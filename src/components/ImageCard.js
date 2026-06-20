import { useState, useEffect } from 'react'
import { html } from '../html.js'
import { fetchWikiThumb } from '../utils/wikiImage.js'

// Thẻ ảnh: tự lấy ảnh từ Wikipedia theo `term`. Hiện skeleton khi đang tải,
// và emoji dự phòng nếu không tìm thấy ảnh.
export function ImageCard({ term, label, emoji = '✨' }) {
  const [src, setSrc] = useState(undefined) // undefined = đang tải, null = không có, string = có ảnh

  useEffect(() => {
    let alive = true
    setSrc(undefined)
    fetchWikiThumb(term).then((s) => {
      if (alive) setSrc(s)
    })
    return () => {
      alive = false
    }
  }, [term])

  return html`
    <figure class="bg-surface-2 rounded-card overflow-hidden border border-white/5 group">
      <div class="relative w-full aspect-[4/3] overflow-hidden flex items-center justify-center bg-ground/40">
        ${src === undefined
          ? html`<div class="w-full h-full animate-pulse bg-white/5"></div>`
          : src
          ? html`<img
              src=${src}
              alt=${label}
              loading="lazy"
              class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />`
          : html`<span class="text-5xl opacity-70" aria-hidden="true">${emoji}</span>`}
      </div>
      <figcaption class="px-3 py-2 text-sm font-semibold text-center">${label}</figcaption>
    </figure>
  `
}
