import { html } from '../html.js'

export function ContinentPill({ label, emoji, active, color, onClick }) {
  return html`
    <button
      onClick=${onClick}
      aria-pressed=${active}
      class=${[
        'px-4 py-2 rounded-full font-semibold whitespace-nowrap transition-all border',
        active
          ? 'text-ground border-transparent'
          : 'bg-surface text-ink/80 border-white/10 hover:border-white/30',
      ].join(' ')}
      style=${active && color ? `background-color:${color}` : ''}
    >
      ${emoji ? html`<span class="mr-1" aria-hidden="true">${emoji}</span>` : null}${label}
    </button>
  `
}
