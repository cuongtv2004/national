import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { html } from '../html.js'
import { useCountries } from '../context.js'
import { Spinner, ErrorBox } from '../components/Spinner.js'
import { getCollected } from '../utils/collection.js'

function ProgressBar({ value, max, color }) {
  const pct = max ? Math.round((value / max) * 100) : 0
  return html`
    <div class="h-2.5 bg-ground/60 rounded-full overflow-hidden">
      <div class="h-full rounded-full transition-all" style=${`width:${pct}%;background-color:${color}`}></div>
    </div>
  `
}

export function CollectionPage() {
  const { countries, continents, loading, error } = useCountries()
  const collected = useMemo(() => getCollected(), [])

  const groups = useMemo(() => {
    const real = countries.filter((c) => c.hasVi)
    return continents
      .map((cont) => {
        const list = real
          .filter((c) => c.continent === cont.key)
          .sort((a, b) => a.nameVi.localeCompare(b.nameVi, 'vi'))
        return { cont, list, done: list.filter((c) => collected.has(c.code)).length }
      })
      .filter((g) => g.list.length > 0)
  }, [countries, continents, collected])

  if (loading) return html`<${Spinner} />`
  if (error) return html`<${ErrorBox} message=${error} />`

  const total = groups.reduce((a, g) => a + g.list.length, 0)
  const doneTotal = groups.reduce((a, g) => a + g.done, 0)

  return html`
    <div class="max-w-5xl mx-auto px-4 py-8">
      <h1 class="font-display text-3xl sm:text-4xl font-extrabold mb-1">Bộ sưu tập của em 📔</h1>
      <p class="text-muted mb-4">Mỗi lá cờ em đã xem hoặc đoán đúng sẽ được "đóng tem". Cùng sưu tập hết nhé!</p>

      <div class="bg-surface rounded-card border border-white/10 p-5 mb-6">
        <div class="flex items-end justify-between mb-2">
          <span class="font-display font-bold text-lg">Tổng tiến độ</span>
          <span class="text-accent font-display font-extrabold text-2xl">${doneTotal}<span class="text-muted text-base">/${total}</span></span>
        </div>
        <${ProgressBar} value=${doneTotal} max=${total} color="#FCD116" />
        ${doneTotal === total && total > 0
          ? html`<p class="text-green-400 font-semibold mt-3">🏆 Tuyệt vời! Em đã sưu tập đủ tất cả lá cờ!</p>`
          : null}
      </div>

      ${groups.map(
        (g) => html`
          <section key=${g.cont.key} class="mb-8">
            <div class="flex items-center justify-between mb-2">
              <h2 class="font-display text-xl font-bold flex items-center gap-2">
                <span aria-hidden="true">${g.cont.emoji}</span>${g.cont.nameVi}
              </h2>
              <span class="text-sm text-muted">${g.done}/${g.list.length}</span>
            </div>
            <div class="mb-3"><${ProgressBar} value=${g.done} max=${g.list.length} color=${g.cont.color} /></div>
            <div class="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
              ${g.list.map((c) => {
                const got = collected.has(c.code)
                return html`<${Link}
                  key=${c.code}
                  to=${`/quoc-gia/${c.lower}`}
                  title=${c.nameVi}
                  class=${`relative rounded-flag overflow-hidden border block aspect-[3/2] ${
                    got ? 'border-accent/50' : 'border-white/5'
                  }`}
                >
                  <img
                    src=${c.flagPng}
                    alt=${c.nameVi}
                    loading="lazy"
                    class=${got ? '' : 'grayscale opacity-30'}
                    style="width:100%;height:100%;object-fit:cover"
                  />
                  ${got
                    ? html`<span class="absolute top-0.5 right-0.5 text-xs bg-accent text-ground rounded-full w-4 h-4 flex items-center justify-center font-bold">✓</span>`
                    : null}
                <//>`
              })}
            </div>
          </section>
        `
      )}
    </div>
  `
}
