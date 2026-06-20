import { Link } from 'react-router-dom'
import { html } from '../html.js'

export function ContinentGrid({ continents, counts }) {
  return html`
    <section class="max-w-6xl mx-auto px-4 py-10">
      <h2 class="font-display text-3xl font-extrabold mb-6 text-center">Chọn châu lục để khám phá 🗺️</h2>
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
        ${continents.map(
          (c) => html`
            <${Link}
              key=${c.key}
              to=${`/kham-pha?chau=${c.slug}`}
              class="rounded-card p-6 text-center font-display font-bold text-ground
                     hover:scale-105 transition-transform shadow-lg"
              style=${`background-color:${c.color}`}
            >
              <div class="text-4xl mb-2" aria-hidden="true">${c.emoji}</div>
              <div class="text-lg leading-tight">${c.nameVi}</div>
              ${counts && counts[c.key]
                ? html`<div class="text-sm font-body font-medium opacity-80 mt-1">${counts[c.key]} lá cờ</div>`
                : null}
            <//>
          `
        )}
      </div>
    </section>
  `
}
