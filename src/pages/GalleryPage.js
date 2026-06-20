import { useMemo, useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { html } from '../html.js'
import { useCountries } from '../context.js'
import { FlagCard } from '../components/FlagCard.js'
import { SearchBar } from '../components/SearchBar.js'
import { ContinentPill } from '../components/ContinentPill.js'
import { Spinner, ErrorBox } from '../components/Spinner.js'
import { stripDiacritics } from '../utils/normalize.js'

export function GalleryPage() {
  const { countries, continents, loading, error } = useCountries()
  const [params, setParams] = useSearchParams()
  const [query, setQuery] = useState('')

  const activeSlug = params.get('chau') || 'all'
  const activeContinent = continents.find((c) => c.slug === activeSlug) || null

  // Cuộn lên đầu khi đổi bộ lọc
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [activeSlug])

  const filtered = useMemo(() => {
    const q = stripDiacritics(query)
    return countries.filter((c) => {
      const matchContinent = !activeContinent || c.continent === activeContinent.key
      const matchQuery = !q || c.searchKey.includes(q)
      return matchContinent && matchQuery
    })
  }, [countries, query, activeContinent])

  function setContinent(slug) {
    const next = new URLSearchParams(params)
    if (slug === 'all') next.delete('chau')
    else next.set('chau', slug)
    setParams(next, { replace: true })
  }

  if (loading) return html`<${Spinner} />`
  if (error) return html`<${ErrorBox} message=${error} />`

  return html`
    <div class="max-w-6xl mx-auto px-4 py-8">
      <h1 class="font-display text-3xl sm:text-4xl font-extrabold mb-2">Khám phá các lá cờ 🚩</h1>
      <p class="text-muted mb-6">Tìm và bấm vào lá cờ để xem điều thú vị về quốc gia đó!</p>

      <div class="mb-4"><${SearchBar} value=${query} onChange=${setQuery} /></div>

      <div class="flex gap-2 overflow-x-auto pb-3 -mx-1 px-1 mb-6">
        <${ContinentPill}
          label="Tất cả"
          emoji="🌐"
          active=${activeSlug === 'all'}
          color="#FCD116"
          onClick=${() => setContinent('all')}
        />
        ${continents.map(
          (c) => html`<${ContinentPill}
            key=${c.key}
            label=${c.nameVi}
            emoji=${c.emoji}
            color=${c.color}
            active=${activeSlug === c.slug}
            onClick=${() => setContinent(c.slug)}
          />`
        )}
      </div>

      <p class="text-sm text-muted mb-4">Tìm thấy <span class="text-accent font-bold">${filtered.length}</span> lá cờ</p>

      ${filtered.length === 0
        ? html`<div class="text-center py-20 text-muted">
            <div class="text-5xl mb-3">🔍</div>
            <p class="font-display text-lg">Không tìm thấy cờ nào. Thử tên khác nhé!</p>
          </div>`
        : html`<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            ${filtered.map((c) => html`<${FlagCard} key=${c.code} country=${c} />`)}
          </div>`}
    </div>
  `
}
