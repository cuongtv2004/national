// Fisher–Yates shuffle — trả về mảng mới, không sửa mảng gốc.
export function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Lấy ngẫu nhiên n phần tử khác nhau.
export function sample(arr, n) {
  return shuffle(arr).slice(0, n)
}
