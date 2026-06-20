import { html } from '../html.js'

export function SearchBar({ value, onChange, placeholder = 'Tìm tên quốc gia...' }) {
  return html`
    <div class="relative">
      <span class="absolute left-4 top-1/2 -translate-y-1/2 text-muted text-lg" aria-hidden="true">🔍</span>
      <input
        type="search"
        value=${value}
        onInput=${(e) => onChange(e.target.value)}
        placeholder=${placeholder}
        aria-label="Tìm kiếm quốc gia"
        class="w-full bg-surface border border-white/10 rounded-full pl-12 pr-4 py-3
               text-ink placeholder:text-muted focus:border-accent focus:outline-none"
      />
    </div>
  `
}
