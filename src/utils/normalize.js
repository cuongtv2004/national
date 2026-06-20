// Bỏ dấu tiếng Việt + đưa về chữ thường để tìm kiếm linh hoạt.
// Vd: "Việt Nam" -> "viet nam", gõ "viet nam" vẫn khớp.
export function stripDiacritics(str = '') {
  return str
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // dấu tổ hợp (sắc, huyền, hỏi, ngã, nặng, mũ...)
    .replace(/[đĐ]/g, (m) => (m === 'đ' ? 'd' : 'D'))
    .toLowerCase()
    .trim()
}
