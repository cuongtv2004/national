import { useState } from 'react'
import { Link } from 'react-router-dom'
import { html } from '../html.js'

// Thẻ cờ tái sử dụng: ảnh cờ + tên VI + badge châu lục. Fallback emoji nếu ảnh lỗi.
export function FlagCard({ country }) {
  const [broken, setBroken] = useState(false)

  return html`
    <${Link}
      to=${`/quoc-gia/${country.lower}`}
      class="group block bg-surface rounded-card overflow-hidden border border-white/5
             transition-transform duration-200 hover:-translate-y-1 hover:border-accent/40
             focus-visible:-translate-y-1"
    >
      <div class="flag-img w-full relative flex items-center justify-center overflow-hidden">
        ${broken
          ? html`<span class="text-6xl" aria-hidden="true">${country.flagEmoji}</span>`
          : html`<img
              src=${country.flagPng}
              srcSet=${`${country.flagPng} 1x, ${country.flagPng2x} 2x`}
              alt=${'Cờ của ' + country.nameVi}
              loading="lazy"
              onError=${() => setBroken(true)}
              class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />`}
      </div>
      <div class="p-3">
        <h3 class="font-display font-bold leading-tight truncate">${country.nameVi}</h3>
        <p class="text-xs text-muted mt-0.5">${country.continentVi}</p>
      </div>
    <//>
  `
}
