import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { html } from '../html.js'
import { useCountries } from '../context.js'
import { Spinner, ErrorBox } from '../components/Spinner.js'

function FlagMini({ country }) {
  if (!country) return null
  return html`
    <${Link} to=${`/quoc-gia/${country.lower}`} class="flex-1 min-w-0 group">
      <div class="flag-img w-full rounded-flag overflow-hidden border border-white/10 group-hover:border-accent/50 transition-colors">
        <img src=${country.flagPng} alt=${'Cờ ' + country.nameVi} loading="lazy" class="w-full h-full object-cover" />
      </div>
      <div class="font-display font-bold text-center mt-2 text-sm sm:text-base truncate">${country.nameVi}</div>
    <//>
  `
}

export function TwinFlagsPage() {
  const { countries, loading, error } = useCountries()
  const [pairs, setPairs] = useState(null)
  const [perr, setPerr] = useState(null)

  useEffect(() => {
    let alive = true
    fetch(new URL('../../data/twin-flags.json', import.meta.url))
      .then((r) => {
        if (!r.ok) throw new Error('Không tải được dữ liệu cờ song sinh')
        return r.json()
      })
      .then((d) => alive && setPairs(d))
      .catch((e) => alive && setPerr(e.message))
    return () => {
      alive = false
    }
  }, [])

  const byCode = useMemo(() => {
    const m = {}
    for (const c of countries) m[c.code] = c
    return m
  }, [countries])

  if (loading) return html`<${Spinner} />`
  if (error) return html`<${ErrorBox} message=${error} />`
  if (perr) return html`<${ErrorBox} message=${perr} />`
  if (!pairs) return html`<${Spinner} label="Đang tải các cặp cờ..." />`

  return html`
    <div class="max-w-3xl mx-auto px-4 py-8">
      <h1 class="font-display text-3xl sm:text-4xl font-extrabold mb-2">Cờ song sinh 👀</h1>
      <p class="text-muted mb-6">
        Có những lá cờ trông <b>giống nhau đến bất ngờ</b>! Cùng xem cách phân biệt từng cặp nhé.
      </p>

      <div class="space-y-4">
        ${pairs.map((p, i) => {
          const a = byCode[p.a]
          const b = byCode[p.b]
          if (!a || !b) return null
          return html`
            <div key=${i} class="bg-surface rounded-card border border-white/10 p-4">
              <div class="flex items-start gap-3 sm:gap-5">
                <${FlagMini} country=${a} />
                <div class="self-center text-2xl text-muted shrink-0" aria-hidden="true">⇄</div>
                <${FlagMini} country=${b} />
              </div>
              <div class="mt-3 bg-surface-2 rounded-xl px-4 py-3 text-sm leading-relaxed">
                <span class="text-accent font-semibold">Cách phân biệt: </span>${p.note}
              </div>
            </div>
          `
        })}
      </div>
    </div>
  `
}
