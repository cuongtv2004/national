import { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { html } from '../html.js'

const LINKS = [
  { to: '/', label: 'Trang chủ', end: true },
  { to: '/ban-do', label: 'Bản đồ' },
  { to: '/kham-pha', label: 'Khám phá' },
  { to: '/thu-thach', label: 'Thử thách' },
]

function linkClass({ isActive }) {
  return [
    'px-4 py-2 rounded-full font-semibold transition-colors',
    isActive ? 'bg-accent text-ground' : 'text-ink/80 hover:text-ink hover:bg-surface-2',
  ].join(' ')
}

export function Navbar() {
  const [open, setOpen] = useState(false)

  return html`
    <header class="sticky top-0 z-40 bg-ground/85 backdrop-blur border-b border-white/5">
      <nav class="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <${Link} to="/" class="flex items-center gap-2 font-display text-2xl font-extrabold">
          <span class="text-3xl" aria-hidden="true">🌍</span>
          <span>Cờ <span class="text-accent">Các Nước</span></span>
        <//>

        <div class="hidden sm:flex items-center gap-1">
          ${LINKS.map(
            (l) => html`<${NavLink} key=${l.to} to=${l.to} end=${l.end} class=${linkClass}>${l.label}<//>`
          )}
        </div>

        <button
          class="sm:hidden p-2 rounded-lg hover:bg-surface-2 text-2xl"
          aria-label="Mở menu"
          aria-expanded=${open}
          onClick=${() => setOpen((v) => !v)}
        >
          ${open ? '✕' : '☰'}
        </button>
      </nav>

      ${open &&
      html`
        <div class="sm:hidden px-4 pb-4 flex flex-col gap-2 border-t border-white/5">
          ${LINKS.map(
            (l) => html`
              <${NavLink}
                key=${l.to}
                to=${l.to}
                end=${l.end}
                class=${linkClass}
                onClick=${() => setOpen(false)}
              >${l.label}<//>
            `
          )}
        </div>
      `}
    </header>
  `
}
