// Lấy ảnh đại diện từ Wikipedia theo tên (địa danh, món ăn, văn hóa).
// Miễn phí, không cần key, có CORS. Có cache (bộ nhớ + sessionStorage).
//
// Tìm theo nhiều tầng để tối đa khả năng có ảnh:
//   1) summary (vi) đúng tên bài
//   2) summary (vi) sau khi bỏ tiền tố mô tả (vd "Thủ đô Amman" -> "Amman")
//   3) tìm kiếm (vi) theo tên / tên rút gọn
//   4) tìm kiếm (en) theo tên rút gọn  — tên riêng quốc tế thường có ảnh ở Wikipedia tiếng Anh
//   5) ảnh P18 trên Wikidata (lưới an toàn) — CHỈ chạy khi cả 4 tầng trên trượt,
//      nên tên đã có ảnh không phát sinh thêm request. Giảm rủi ro khớp nhầm thực
//      thể: ưu tiên tên bài tin cậy (override), rồi tên rút gọn; ngôn ngữ vi→en.

const mem = new Map()

async function fetchJSON(url) {
  const res = await fetch(url)
  if (!res.ok) return null
  return res.json()
}

async function summary(lang, term) {
  const url = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/` + encodeURIComponent(term.replace(/ /g, '_'))
  const d = await fetchJSON(url)
  if (!d) return null
  return d?.originalimage?.source || d?.thumbnail?.source || null
}

async function searchImage(lang, term) {
  const url =
    `https://${lang}.wikipedia.org/w/api.php?action=query&format=json&generator=search` +
    '&gsrsearch=' + encodeURIComponent(term) +
    '&gsrlimit=1&prop=pageimages&piprop=thumbnail&pithumbsize=400&origin=*'
  const d = await fetchJSON(url)
  const pages = d?.query?.pages
  if (!pages) return null
  const first = Object.values(pages)[0]
  return first?.thumbnail?.source || null
}

// Wikidata: tra ID thực thể theo tên (vi trước, en sau ở wikidataImage).
async function wikidataEntityId(lang, term) {
  const url =
    'https://www.wikidata.org/w/api.php?action=wbsearchentities&search=' +
    encodeURIComponent(term) +
    `&language=${lang}&format=json&origin=*&limit=1`
  const data = await fetchJSON(url)
  return data?.search?.[0]?.id || null
}

// Wikidata: lấy tên tệp ảnh (thuộc tính P18) của thực thể.
async function wikidataP18(qid) {
  const url =
    'https://www.wikidata.org/w/api.php?action=wbgetclaims&entity=' +
    qid + '&property=P18&format=json&origin=*'
  const data = await fetchJSON(url)
  return data?.claims?.P18?.[0]?.mainsnak?.datavalue?.value || null
}

// Lấy ảnh P18 từ Wikidata rồi dựng URL Commons FilePath. Trả về null nếu thiếu.
async function wikidataImage(term) {
  if (!term) return null
  let qid = await wikidataEntityId('vi', term)
  if (!qid) qid = await wikidataEntityId('en', term)
  if (!qid) return null
  const filename = await wikidataP18(qid)
  if (!filename) return null
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(filename)}?width=400`
}

// Bỏ tiền tố mô tả hay gặp để khớp tên bài / tìm kiếm tốt hơn.
// Sắp xếp cụm dài trước cụm ngắn để khớp đúng (vd "Bánh mì" trước "Bánh").
// An toàn vì luôn thử nguyên tên trước, chỉ rút gọn khi nguyên tên không có ảnh.
const PREFIX =
  /^(Nguyên tử khổng lồ|Khu bảo tồn tinh tinh|Thị trấn hang động|Tranh cắt giấy|Đất Bảy Màu|Tháp đồng hồ|Suối nước nóng|Vườn quốc gia|Vườn bách thảo|Rạn san hô|Đường lát đá|Thánh đường|Đấu trường|Cao nguyên|Thung lũng|Đồng bằng|Bến cảng|Kênh đào|Vách núi|Thành cổ|Bờ biển|Bán đảo|Tòa nhà|Giăm bông|Nhà thờ|Phô mai|Cà phê|Chuối chiên|Bánh mì|Bánh ngọt|Bánh chiên|Bánh kẹp|Khoai tây|Thịt xiên|Thịt cuộn|Điệu nhảy|Đàn hạc|Vòi phun|Cổng đá|Hố xanh|Hố bơi|Dãy núi|Hang động|Hẻm núi|Thác nước|Núi lửa|Bãi biển|Bãi đá|Đảo san hô|Cánh đồng|Quần đảo|Phố cổ|Cố đô|Cung điện|Vòng quay|Quảng trường|Tàn tích|Tu viện|Pháo đài|Lâu đài|Sa mạc|Công viên|Bảo tàng|Thành phố|Thị trấn|Thủ đô|Khu bảo tồn|Bánh|Món|Súp|Cháo|Xúc xích|Thịt|Chuối|Đậu|Cơm|Mì|Làng|Núi|Thác|Hồ|Đảo|Vịnh|Sông|Đền|Chợ|Cầu|Vườn|Khu|Đỉnh|Đầm|Vòm đá|Đường đua|Dãy|Tháp|Hang|Tượng|Rừng|Vùng|Mũi|Cảng|Trà|Biển)\s+/i

function simplify(term) {
  return term.replace(PREFIX, '').trim()
}

// Tên tiếng Việt khớp nhầm bài/ảnh trên Wikipedia → trỏ tới tên bài tin cậy.
const OVERRIDES = {
  'Công viên Güell': 'Park Güell',
  'Bãi biển Ibiza': 'Cala Comte',
  'Bánh Churros': 'Churros',
  // Các tên dưới đây bị thiếu ảnh trong lần audit (miss.txt). Đã xác minh từng
  // tên bài bằng chính endpoint REST summary mà summary('en') dùng — mỗi tên
  // trả về originalimage/thumbnail thật (xem báo cáo dev).
  'Dãy núi Sharr': 'Šar Mountains',  // Kosovo — Small_Turk_and_Titov_Vrv.jpg
  'Momo': 'Momo (food)',             // Nepal/Bhutan — Momo_nepal.jpg
  'Mì Lagman': 'Laghman (food)',     // Kazakhstan/Uzbekistan — Лагман.jpg
  'Phô mai nâu': 'Brunost',          // Norway — Brunost.jpg
  'Đảo Sal': 'Santa Maria, Cape Verde',  // Cape Verde — SantaMariaSal.jpg (ảnh bãi biển; 'Sal, Cape Verde' chỉ trả về bản đồ)
  // Bài món ăn Nicaragua chỉ có trên Wikipedia tiếng Tây Ban Nha; trên en/vi
  // "Quesillo" là trang định hướng không ảnh và search('en') trả về món sai
  // (Oaxaca cheese của Mexico). Chuỗi override có thêm bước summary('es').
  'Bánh Quesillo': 'Quesillo nicaragüense',  // Nicaragua (es) — Quesillo_de_Nicaragua.jpg
}

export async function fetchWikiThumb(term) {
  if (!term) return null
  if (mem.has(term)) return mem.get(term)

  const cacheKey = 'wikithumb:' + term
  try {
    const cached = sessionStorage.getItem(cacheKey)
    if (cached !== null) {
      const v = cached || null
      mem.set(term, v)
      return v
    }
  } catch {}

  const s = simplify(term)
  const override = OVERRIDES[term]
  let thumb = null
  try {
    // Một số tên khớp nhầm bài Wikipedia (vd tìm "Güell" ra ảnh Sagrada Familia,
    // "Ibiza" ra lá cờ): ưu tiên tra theo tên bài tin cậy đã chỉ định.
    if (override) {
      thumb = await summary('en', override)
      if (!thumb) thumb = await summary('vi', override)
      // Một số bài chỉ tồn tại trên Wikipedia tiếng Tây Ban Nha (vd món ăn
      // Nicaragua "Quesillo nicaragüense"). Bước này chỉ chạy khi có override
      // nên không thêm request cho ~1326 tên không override.
      if (!thumb) thumb = await summary('es', override)
      if (!thumb) thumb = await searchImage('en', override)
    }
    if (!thumb) thumb = await summary('vi', term)
    if (!thumb && s !== term) thumb = await summary('vi', s)
    if (!thumb) thumb = await searchImage('vi', term)
    if (!thumb && s !== term) thumb = await searchImage('vi', s)
    if (!thumb) thumb = await searchImage('en', s || term)
    if (!thumb) thumb = await wikidataImage(override || s || term)
  } catch {
    thumb = null
  }

  mem.set(term, thumb)
  // Chỉ lưu lâu dài kết quả thành công. Không cache kết quả rỗng vào
  // sessionStorage để một lần lỗi mạng/CORS thoáng qua không làm mất ảnh
  // cả phiên — lần tải lại sau sẽ thử lấy lại.
  if (thumb) {
    try {
      sessionStorage.setItem(cacheKey, thumb)
    } catch {}
  }
  return thumb
}
