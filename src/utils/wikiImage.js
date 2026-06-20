// Lấy ảnh đại diện từ Wikipedia theo tên (địa danh, món ăn, văn hóa).
// Miễn phí, không cần key, có CORS. Có cache (bộ nhớ + sessionStorage).
//
// Tìm theo nhiều tầng để tối đa khả năng có ảnh:
//   1) summary (vi) đúng tên bài
//   2) summary (vi) sau khi bỏ tiền tố mô tả (vd "Thủ đô Amman" -> "Amman")
//   3) tìm kiếm (vi) theo tên / tên rút gọn
//   4) tìm kiếm (en) theo tên rút gọn  — tên riêng quốc tế thường có ảnh ở Wikipedia tiếng Anh

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

// Bỏ tiền tố mô tả hay gặp để khớp tên bài / tìm kiếm tốt hơn.
// Sắp xếp cụm dài trước cụm ngắn để khớp đúng (vd "Bánh mì" trước "Bánh").
// An toàn vì luôn thử nguyên tên trước, chỉ rút gọn khi nguyên tên không có ảnh.
const PREFIX =
  /^(Nguyên tử khổng lồ|Khu bảo tồn tinh tinh|Thị trấn hang động|Tranh cắt giấy|Đất Bảy Màu|Tháp đồng hồ|Suối nước nóng|Vườn quốc gia|Vườn bách thảo|Chuối chiên|Bánh mì|Bánh ngọt|Bánh chiên|Bánh kẹp|Khoai tây|Thịt xiên|Thịt cuộn|Điệu nhảy|Đàn hạc|Vòi phun|Cổng đá|Hố xanh|Hố bơi|Dãy núi|Hang động|Hẻm núi|Thác nước|Núi lửa|Bãi biển|Bãi đá|Đảo san hô|Cánh đồng|Quần đảo|Phố cổ|Cố đô|Cung điện|Vòng quay|Quảng trường|Tàn tích|Tu viện|Pháo đài|Lâu đài|Sa mạc|Công viên|Bảo tàng|Thành phố|Thị trấn|Thủ đô|Khu bảo tồn|Bánh|Món|Súp|Cháo|Xúc xích|Thịt|Chuối|Đậu|Cơm|Mì|Làng|Núi|Thác|Hồ|Đảo|Vịnh|Sông|Đền|Chợ|Cầu|Vườn|Khu|Đỉnh|Đầm|Vòm đá|Đường đua|Dãy|Tháp|Hang|Biển)\s+/i

function simplify(term) {
  return term.replace(PREFIX, '').trim()
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
  let thumb = null
  try {
    thumb = await summary('vi', term)
    if (!thumb && s !== term) thumb = await summary('vi', s)
    if (!thumb) thumb = await searchImage('vi', term)
    if (!thumb && s !== term) thumb = await searchImage('vi', s)
    if (!thumb) thumb = await searchImage('en', s || term)
  } catch {
    thumb = null
  }

  mem.set(term, thumb)
  try {
    sessionStorage.setItem(cacheKey, thumb || '')
  } catch {}
  return thumb
}
