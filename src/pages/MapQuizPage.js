import { useState, useEffect, useMemo, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { html } from '../html.js'
import { useCountries } from '../context.js'
import { Spinner, ErrorBox } from '../components/Spinner.js'
import { ScoreBoard } from '../components/ScoreBoard.js'
import { loadWorldFeatures, flatPath } from '../utils/worldmap.js'
import { sample } from '../utils/shuffle.js'
import { saveResult, loadProgress } from '../utils/score.js'
import { markQuizCorrect } from '../utils/collection.js'

const TOTAL = 10

export function MapQuizPage() {
  const { countries, continents, loading, error } = useCountries()
  const navigate = useNavigate()
  const [feats, setFeats] = useState(null)
  const [ferr, setFerr] = useState(null)

  const [questions, setQuestions] = useState([])
  const [idx, setIdx] = useState(0)
  const [picked, setPicked] = useState(null) // shape đã bấm
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)
  const [finalProgress, setFinalProgress] = useState(null)

  useEffect(() => {
    let alive = true
    loadWorldFeatures()
      .then((f) => alive && setFeats(f))
      .catch((e) => alive && setFerr(e.message))
    return () => {
      alive = false
    }
  }, [])

  const { byCcn3, contColor } = useMemo(() => {
    const cc = Object.fromEntries(continents.map((c) => [c.key, c.color]))
    const map = {}
    for (const c of countries) if (c.ccn3) map[c.ccn3] = c
    return { byCcn3: map, contColor: cc }
  }, [countries, continents])

  const shapes = useMemo(() => {
    if (!feats) return []
    return feats.map((f) => {
      const c = byCcn3[f.id]
      return { id: f.id, d: flatPath(f), country: c || null, color: c ? contColor[c.continent] || '#2a3b5e' : '#2a3b5e' }
    })
  }, [feats, byCcn3, contColor])

  const startGame = useCallback(() => {
    // Mục tiêu: nước có tên Việt, nằm trên bản đồ, đủ to để bé bấm.
    const pool = shapes.filter((s) => s.country && s.country.hasVi && (s.country.area || 0) >= 90000)
    setQuestions(sample(pool, Math.min(TOTAL, pool.length)).map((s) => s.country))
    setIdx(0)
    setPicked(null)
    setScore(0)
    setFinished(false)
  }, [shapes])

  // Khởi tạo câu hỏi khi đã có shapes.
  useEffect(() => {
    if (shapes.length && !questions.length && !finished) startGame()
  }, [shapes]) // eslint-disable-line

  if (loading) return html`<${Spinner} />`
  if (error) return html`<${ErrorBox} message=${error} />`
  if (ferr) return html`<${ErrorBox} message=${ferr} />`
  if (!feats || !questions.length) return html`<${Spinner} label="Đang chuẩn bị bản đồ..." />`

  if (finished)
    return html`<div class="px-4 py-10">
      <${ScoreBoard}
        score=${score}
        total=${questions.length}
        progress=${finalProgress || loadProgress()}
        onReplay=${startGame}
        onExplore=${() => navigate('/kham-pha')}
      />
      <div class="text-center mt-4">
        <${Link} to="/thu-thach" class="text-muted hover:text-ink text-sm">← Trò chơi khác<//>
      </div>
    </div>`

  const target = questions[idx]
  const answered = !!picked
  const isCorrect = answered && picked.country && picked.country.code === target.code

  function clickShape(s) {
    if (answered || !s.country) return
    const ok = s.country.code === target.code
    if (ok) {
      markQuizCorrect(target.code)
      setScore((v) => v + 1)
    }
    setPicked(s)
    setTimeout(() => {
      if (idx + 1 >= questions.length) {
        const prog = saveResult({ score: ok ? score + 1 : score, total: questions.length, bestStreak: 0 })
        setFinalProgress(prog)
        setFinished(true)
      } else {
        setIdx((i) => i + 1)
        setPicked(null)
      }
    }, 1200)
  }

  function fillOf(s) {
    if (!answered) return s.color
    if (s.country && s.country.code === target.code) return '#22c55e' // đáp án đúng -> xanh lá
    if (picked && s.id === picked.id) return '#E8294A' // bấm sai -> đỏ
    return s.color
  }

  return html`
    <div class="max-w-5xl mx-auto px-4 py-6">
      <div class="flex items-center justify-between mb-2">
        <${Link} to="/thu-thach" class="text-muted hover:text-ink text-sm">← Trò chơi<//>
        <span class="text-accent font-bold text-sm">⭐ ${score} · Câu ${idx + 1}/${questions.length}</span>
      </div>

      <div class="bg-surface rounded-card border border-white/10 px-4 py-3 mb-3 text-center">
        ${answered
          ? html`<span class="font-display text-lg font-bold ${isCorrect ? 'text-green-400' : 'text-accent-2'}">
              ${isCorrect ? 'Chính xác! 🎉' : `Chưa đúng! Đây là ${target.nameVi}.`}
            </span>`
          : html`<span class="font-display text-lg">Hãy tìm: <span class="text-accent font-extrabold">${target.flagEmoji} ${target.nameVi}</span></span>`}
      </div>

      <div class="overflow-x-auto rounded-card border border-white/10 bg-[#0a1830]">
        <svg viewBox="0 18 1000 392" class="w-full h-auto block" role="img" aria-label="Bản đồ để tìm quốc gia">
          ${shapes.map(
            (s) => html`<path
              key=${s.id}
              d=${s.d}
              fill=${fillOf(s)}
              stroke="#0a1830"
              strokeWidth="0.5"
              class=${s.country ? 'cursor-pointer hover:opacity-80' : 'opacity-50'}
              onClick=${s.country ? () => clickShape(s) : null}
            ><title>${s.country ? s.country.nameVi : ''}</title></path>`
          )}
        </svg>
      </div>
      <p class="text-xs text-muted mt-2 text-center">Mẹo: phóng to bản đồ trên điện thoại để bấm dễ hơn nhé!</p>
    </div>
  `
}
