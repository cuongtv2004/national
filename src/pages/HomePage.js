import { useMemo } from 'react'
import { html } from '../html.js'
import { useCountries } from '../context.js'
import { HeroSection } from '../components/HeroSection.js'
import { ContinentGrid } from '../components/ContinentGrid.js'
import { FlagCard } from '../components/FlagCard.js'
import { Spinner, ErrorBox } from '../components/Spinner.js'

const FEATURED = ['VN', 'JP', 'FR', 'BR', 'US', 'EG']

// Chọn 1 nước "bí ẩn" theo ngày (deterministic) — cùng 1 ngày mọi người thấy như nhau.
function dailyIndex(len) {
  const d = new Date()
  const seed = d.getFullYear() * 1000 + d.getMonth() * 50 + d.getDate()
  return len ? seed % len : 0
}

export function HomePage() {
  const { countries, continents, loading, error } = useCountries()

  const featured = useMemo(
    () => FEATURED.map((code) => countries.find((c) => c.code === code)).filter(Boolean),
    [countries]
  )

  const counts = useMemo(() => {
    const m = {}
    for (const c of countries) m[c.continent] = (m[c.continent] || 0) + 1
    return m
  }, [countries])

  const mystery = useMemo(() => {
    if (!countries.length) return null
    // ưu tiên các nước có cờ rõ ràng; chọn theo ngày
    return countries[dailyIndex(countries.length)]
  }, [countries])

  if (loading) return html`<${Spinner} label="Đang chuẩn bị những lá cờ..." />`
  if (error) return html`<${ErrorBox} message=${error} />`

  return html`
    <div>
      <${HeroSection} mysteryCountry=${mystery} />

      <section class="max-w-6xl mx-auto px-4 py-10">
        <h2 class="font-display text-3xl font-extrabold mb-6 text-center">Những lá cờ nổi bật ⭐</h2>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4">
          ${featured.map((c) => html`<${FlagCard} key=${c.code} country=${c} />`)}
        </div>
      </section>

      <${ContinentGrid} continents=${continents} counts=${counts} />
    </div>
  `
}
