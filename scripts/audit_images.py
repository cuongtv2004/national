#!/usr/bin/env python3
"""Audit ảnh: tìm các term (du lịch / món ăn / văn hóa) KHÔNG lấy được ảnh
từ Wikipedia, mô phỏng đúng logic của src/utils/wikiImage.js.

Vì sao cần chạy chậm: gọi Wikipedia dồn dập sẽ bị trả HTTP 429 (Too Many
Requests). Script này:
  - đi TUẦN TỰ, giãn nhịp ~1 request/giây;
  - phát hiện 429/5xx và lùi (backoff) dài thay vì coi là "không có ảnh";
  - gọi API theo LÔ 20 tiêu đề (ít request) cho pha title, chỉ search lẻ phần còn sót;
  - CHECKPOINT ra file json để chạy lại là tiếp tục, không làm lại từ đầu.

Chạy:   python3 scripts/audit_images.py
Kết quả: scripts/audit_out/miss.txt  (+ checkpoint trong cùng thư mục)
"""
import re, subprocess, urllib.parse, json, os, time, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "scripts", "audit_out")
os.makedirs(OUT, exist_ok=True)

# ---- nạp PREFIX & OVERRIDES trực tiếp từ wikiImage.js (luôn khớp code thật) ----
src = open(os.path.join(ROOT, "src/utils/wikiImage.js"), encoding="utf-8").read()
PREFIX = re.compile(
    r'^(' + '|'.join(re.escape(p) for p in
        re.search(r'/\^\((.*?)\)\\s\+/i', src, re.S).group(1).split('|')) + r')\s+', re.I)
simplify = lambda t: PREFIX.sub('', t).strip()
_ovblk = src[src.index('const OVERRIDES'):src.index('const OVERRIDES') + 600]
OVERRIDES = dict(re.findall(r"'([^']+)':\s*'([^']+)'", _ovblk))

# ---- curl 429-aware ----
PACE = 1.0          # giãn nhịp tối thiểu giữa các request (giây)
MAX_429 = 6         # số lần lùi tối đa khi gặp 429 cho 1 request
_last = [0.0]

def _throttle():
    dt = time.time() - _last[0]
    if dt < PACE:
        time.sleep(PACE - dt)
    _last[0] = time.time()

def curl(url):
    """Trả (http_code:int, body:str). Lùi dài khi 429/5xx."""
    for attempt in range(MAX_429 + 1):
        _throttle()
        try:
            p = subprocess.run(
                ['curl', '-s', '--max-time', '30', '-w', '\n%{http_code}', url],
                capture_output=True, text=True)
            out = p.stdout
        except Exception:
            out = ''
        code, _, body = out.rpartition('\n')  # ngược: lấy phần sau \n cuối
        # -w nối '\n<code>' vào cuối; tách lại:
        if body.isdigit():
            http, payload = int(body), code
        else:
            http, payload = 0, out
        if http == 200 and payload.strip():
            return 200, payload
        if http in (429, 500, 502, 503, 504) or http == 0:
            wait = min(60, 8 * (attempt + 1))
            print(f"    [http {http}] lùi {wait}s (lần {attempt+1})", flush=True)
            time.sleep(wait)
            continue
        return http, payload
    return 429, ''

def _json(url):
    code, body = curl(url)
    if code != 200:
        return None
    try:
        return json.loads(body)
    except Exception:
        return None

def batch_pageimages(lang, titles, ckpt):
    """{title: thumb} cho tiêu đề tồn tại & có ảnh. Checkpoint theo offset."""
    titles = [t for t in titles if t]
    done = json.load(open(ckpt)) if os.path.exists(ckpt) else {"i": 0, "hit": {}}
    res = dict(done["hit"])
    i = done["i"]
    while i < len(titles):
        chunk = titles[i:i + 20]
        url = (f"https://{lang}.wikipedia.org/w/api.php?action=query&format=json"
               f"&prop=pageimages&piprop=thumbnail&pithumbsize=400&redirects=1&titles="
               + urllib.parse.quote("|".join(chunk)))
        d = _json(url) or {}
        q = d.get('query', {})
        norm = {n['from']: n['to'] for n in q.get('normalized', [])}
        redir = {r['from']: r['to'] for r in q.get('redirects', [])}
        t2t = {p['title']: (p.get('thumbnail') or {}).get('source')
               for p in q.get('pages', {}).values() if (p.get('thumbnail') or {}).get('source')}
        for t in chunk:
            cur = redir.get(norm.get(t, t), norm.get(t, t))
            if cur in t2t:
                res[t] = t2t[cur]
        i += 20
        json.dump({"i": i, "hit": res}, open(ckpt, "w"), ensure_ascii=False)
        if i % 200 == 0:
            print(f"  [{lang}] {min(i,len(titles))}/{len(titles)} tiêu đề, {len(res)} có ảnh", flush=True)
    return res

def search(lang, term):
    d = _json(f"https://{lang}.wikipedia.org/w/api.php?action=query&format=json"
              f"&generator=search&gsrsearch=" + urllib.parse.quote(term)
              + "&gsrlimit=1&prop=pageimages&piprop=thumbnail&pithumbsize=400")
    p = (d or {}).get('query', {}).get('pages')
    return list(p.values())[0].get('thumbnail', {}).get('source') if p else None

def main():
    data = json.load(open(os.path.join(ROOT, "data/countries-extra.json"), encoding="utf-8"))
    usage = {}
    for c, v in data.items():
        for t in v.get('tourism', []): usage.setdefault(t, []).append((c, 'tourism'))
        for t in v.get('food', []): usage.setdefault(t, []).append((c, 'food'))
        if v.get('cultureImage'): usage.setdefault(v['cultureImage'], []).append((c, 'culture'))
    terms = sorted(usage)
    print(f"{len(terms)} term / {len(data)} nước.", flush=True)

    vi_t, en_t = set(), set()
    for t in terms:
        ov, s = OVERRIDES.get(t), simplify(t)
        if ov: en_t.add(ov); vi_t.add(ov)
        vi_t.add(t)
        if s != t: vi_t.add(s)
        en_t.add(s or t)

    print("Pha 1: title-based (vi)...", flush=True)
    vi_hit = batch_pageimages('vi', sorted(vi_t), os.path.join(OUT, "ckpt_vi.json"))
    print("Pha 1: title-based (en)...", flush=True)
    en_hit = batch_pageimages('en', sorted(en_t), os.path.join(OUT, "ckpt_en.json"))
    print(f"vi có ảnh: {len(vi_hit)}, en có ảnh: {len(en_hit)}", flush=True)

    need = []
    for t in terms:
        ov, s = OVERRIDES.get(t), simplify(t)
        if (ov and (en_hit.get(ov) or vi_hit.get(ov))) or vi_hit.get(t) or vi_hit.get(s):
            continue
        need.append(t)
    print(f"Cần search lẻ: {len(need)}", flush=True)

    # Pha 2: search fallback, checkpoint theo term
    sp = os.path.join(OUT, "ckpt_search.json")
    searched = json.load(open(sp)) if os.path.exists(sp) else {}
    for idx, t in enumerate(need, 1):
        if t in searched:
            continue
        ov, s = OVERRIDES.get(t), simplify(t)
        r = (ov and search('en', ov)) or search('vi', t) \
            or (s != t and search('vi', s)) or search('en', s or t) or ""
        searched[t] = r or ""
        if idx % 10 == 0:
            json.dump(searched, open(sp, "w"), ensure_ascii=False)
            miss_now = sum(1 for x in need[:idx] if not searched.get(x))
            print(f"  search {idx}/{len(need)} ({miss_now} miss)", flush=True)
    json.dump(searched, open(sp, "w"), ensure_ascii=False)

    miss = sorted(t for t in need if not searched.get(t))
    with open(os.path.join(OUT, "miss.txt"), "w", encoding="utf-8") as f:
        f.write(f"=== {len(miss)}/{len(terms)} TERM MẤT ẢNH ===\n")
        for t in miss:
            f.write(f"  {t:35} [{', '.join(f'{c}/{fld}' for c,fld in usage[t])}]\n")
    print(f"\n=== {len(miss)} TERM MẤT ẢNH === (xem scripts/audit_out/miss.txt)", flush=True)
    for t in miss:
        print(f"  {t:35} [{', '.join(f'{c}/{fld}' for c,fld in usage[t])}]")
    print("DONE_AUDIT", flush=True)

if __name__ == "__main__":
    main()
