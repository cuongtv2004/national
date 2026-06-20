import { html } from '../html.js'

export function Footer() {
  return html`
    <footer class="mt-16 border-t border-white/5 py-8 text-center text-muted text-sm">
      <p class="font-display text-base text-ink/80">Cờ Các Nước 🌍</p>
      <p class="mt-1">Học cờ thế giới thật vui — dành cho các bạn nhỏ.</p>
      <p class="mt-2 text-xs">
        Dữ liệu cờ từ flagcdn.com · Thông tin quốc gia từ bộ dữ liệu mở mledoze/countries.
      </p>
    </footer>
  `
}
