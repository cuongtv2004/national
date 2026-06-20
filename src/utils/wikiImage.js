// Lấy ảnh đại diện từ Wikipedia tiếng Việt theo tên (địa danh, món ăn, văn hóa).
// Miễn phí, không cần key, có CORS. Có cache (bộ nhớ + sessionStorage) để không tải lại.

const mem = new Map()

function summaryURL(term) {
  return 'https://vi.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(term.replace(/ /g, '_'))
}

async function tryFetch(term) {
  const res = await fetch(summaryURL(term))
  if (!res.ok) return null
  const data = await res.json()
  // ưu tiên ảnh gốc to hơn, fallback thumbnail
  return data?.originalimage?.source || data?.thumbnail?.source || null
}

// Bỏ tiền tố hay gặp để tăng khả năng khớp (vd "Đảo Phú Quốc" -> "Phú Quốc").
function simplify(term) {
  return term.replace(/^(Đảo|Núi|Biển|Thác|Hồ|Phố cổ|Vịnh|Sông|Đền|Chợ|Cố đô|Cung điện|Bãi biển|Quần đảo|Cánh đồng|Dãy|Khu bảo tồn)\s+/i, '')
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

  let thumb = null
  try {
    thumb = await tryFetch(term)
    if (!thumb) {
      const s = simplify(term)
      if (s !== term) thumb = await tryFetch(s)
    }
  } catch {
    thumb = null
  }

  mem.set(term, thumb)
  try {
    sessionStorage.setItem(cacheKey, thumb || '')
  } catch {}
  return thumb
}
