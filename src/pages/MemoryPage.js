import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { html } from '../html.js'
import { useCountries } from '../context.js'
import { Spinner, ErrorBox } from '../components/Spinner.js'
import { shuffle, sample } from '../utils/shuffle.js'
import { markQuizCorrect } from '../utils/collection.js'

const PAIRS = 6 // 6 cặp = 12 thẻ

function makeDeck(countries) {
  const pool = countries.filter((c) => c.hasVi)
  const picked = sample(pool, PAIRS)
  const cards = []
  picked.forEach((c, i) => {
    cards.push({ uid: 'f' + i, code: c.code, type: 'flag', country: c })
    cards.push({ uid: 'n' + i, code: c.code, type: 'name', country: c })
  })
  return shuffle(cards).map((c) => ({ ...c, flipped: false, matched: false }))
}

export function MemoryPage() {
  const { countries, loading, error } = useCountries()
  const [cards, setCards] = useState([])
  const [open, setOpen] = useState([]) // chỉ số thẻ đang lật (tối đa 2)
  const [lock, setLock] = useState(false)
  const [moves, setMoves] = useState(0)

  const newGame = useCallback(() => {
    setCards(makeDeck(countries))
    setOpen([])
    setLock(false)
    setMoves(0)
  }, [countries])

  useEffect(() => {
    if (countries.length && !cards.length) newGame()
  }, [countries]) // eslint-disable-line

  if (loading) return html`<${Spinner} />`
  if (error) return html`<${ErrorBox} message=${error} />`
  if (!cards.length) return html`<${Spinner} />`

  const matchedCount = cards.filter((c) => c.matched).length
  const won = matchedCount === cards.length

  function flip(i) {
    if (lock) return
    const c = cards[i]
    if (c.flipped || c.matched) return
    const nextCards = cards.map((x, j) => (j === i ? { ...x, flipped: true } : x))
    const nextOpen = [...open, i]
    setCards(nextCards)
    setOpen(nextOpen)

    if (nextOpen.length === 2) {
      setMoves((m) => m + 1)
      const [a, b] = nextOpen
      const ca = nextCards[a]
      const cb = nextCards[b]
      if (ca.code === cb.code && ca.type !== cb.type) {
        // khớp
        markQuizCorrect(ca.code)
        setTimeout(() => {
          setCards((cur) => cur.map((x, j) => (j === a || j === b ? { ...x, matched: true } : x)))
          setOpen([])
        }, 450)
      } else {
        setLock(true)
        setTimeout(() => {
          setCards((cur) => cur.map((x, j) => (j === a || j === b ? { ...x, flipped: false } : x)))
          setOpen([])
          setLock(false)
        }, 900)
      }
    }
  }

  return html`
    <div class="max-w-2xl mx-auto px-4 py-6">
      <div class="flex items-center justify-between mb-3">
        <${Link} to="/thu-thach" class="text-muted hover:text-ink text-sm">← Trò chơi<//>
        <span class="text-accent font-bold text-sm">Cặp: ${matchedCount / 2}/${PAIRS} · Lượt lật: ${moves}</span>
      </div>

      <h1 class="font-display text-2xl font-extrabold mb-1 text-center">Lật thẻ ghi nhớ 🃏</h1>
      <p class="text-muted text-sm mb-5 text-center">Tìm cặp <b>lá cờ</b> và <b>tên nước</b> giống nhau!</p>

      ${won
        ? html`<div class="text-center bg-surface rounded-card p-6 border border-white/10 mb-5 animate-bounce-in">
            <div class="text-4xl mb-2">🎉</div>
            <div class="font-display text-xl font-bold">Hoàn thành!</div>
            <p class="text-muted">Bạn ghép xong ${PAIRS} cặp trong ${moves} lượt lật.</p>
            <button onClick=${newGame} class="mt-4 bg-accent text-ground font-display font-bold px-6 py-3 rounded-full hover:scale-105 transition-transform">
              🔄 Chơi ván mới
            </button>
          </div>`
        : null}

      <div class="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3">
        ${cards.map((c, i) => {
          const show = c.flipped || c.matched
          return html`<button
            key=${c.uid}
            onClick=${() => flip(i)}
            disabled=${show || lock}
            class=${`aspect-[3/4] rounded-card border flex items-center justify-center p-1 transition-all ${
              c.matched
                ? 'border-green-400 bg-green-500/15'
                : show
                ? 'border-accent bg-surface'
                : 'border-white/10 bg-surface-2 hover:border-white/30'
            }`}
          >
            ${show
              ? c.type === 'flag'
                ? html`<img src=${c.country.flagPng} alt="" class="w-full h-full object-cover rounded" />`
                : html`<span class="font-display font-bold text-sm leading-tight text-center">${c.country.nameVi}</span>`
              : html`<span class="text-3xl opacity-60" aria-hidden="true">🌐</span>`}
          </button>`
        })}
      </div>

      ${!won
        ? html`<div class="text-center mt-5">
            <button onClick=${newGame} class="text-muted hover:text-ink text-sm">🔄 Ván mới</button>
          </div>`
        : null}
    </div>
  `
}
