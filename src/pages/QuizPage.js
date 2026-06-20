import { useMemo, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { html } from '../html.js'
import { useCountries } from '../context.js'
import { Spinner, ErrorBox } from '../components/Spinner.js'
import { ScoreBoard } from '../components/ScoreBoard.js'
import { shuffle, sample } from '../utils/shuffle.js'
import { speak, canSpeak } from '../utils/speak.js'
import { saveResult, loadProgress } from '../utils/score.js'

const TOTAL = 10

const MODES = [
  { id: 'flag-vi', icon: '🚩', title: 'Đoán tên nước', desc: 'Xem cờ → chọn tên tiếng Việt' },
  { id: 'name-flag', icon: '🔤', title: 'Đoán lá cờ', desc: 'Xem tên → chọn đúng cờ' },
  { id: 'flag-en', icon: '🇬🇧', title: 'Học tiếng Anh', desc: 'Xem cờ → chọn tên tiếng Anh' },
]

// Tạo danh sách câu hỏi: mỗi câu 1 đáp án đúng + 3 distractor (ưu tiên cùng châu lục).
function buildQuestions(countries) {
  // Chỉ dùng nước có tên tiếng Việt riêng để câu hỏi "đời" hơn, nhưng vẫn đủ pool.
  const pool = countries.filter((c) => c.nameVi && c.nameEn)
  const answers = sample(pool, TOTAL)
  return answers.map((ans) => {
    let sameRegion = pool.filter((c) => c.continent === ans.continent && c.code !== ans.code)
    if (sameRegion.length < 3) sameRegion = pool.filter((c) => c.code !== ans.code)
    const distractors = sample(sameRegion, 3)
    return { answer: ans, options: shuffle([ans, ...distractors]) }
  })
}

function ModePicker({ onPick }) {
  const progress = loadProgress()
  return html`
    <div class="max-w-2xl mx-auto px-4 py-10 text-center">
      <h1 class="font-display text-4xl font-extrabold mb-2">Thử thách đoán cờ 🎮</h1>
      <p class="text-muted mb-8">Chọn một kiểu chơi nhé!</p>
      <div class="grid sm:grid-cols-3 gap-4">
        ${MODES.map(
          (m) => html`
            <button
              key=${m.id}
              onClick=${() => onPick(m.id)}
              class="bg-surface rounded-card p-6 border border-white/10 hover:border-accent hover:-translate-y-1 transition-all text-center"
            >
              <div class="text-4xl mb-2" aria-hidden="true">${m.icon}</div>
              <div class="font-display font-bold text-lg">${m.title}</div>
              <div class="text-sm text-muted mt-1">${m.desc}</div>
            </button>
          `
        )}
      </div>
      ${progress.totalPlayed > 0
        ? html`<p class="text-muted text-sm mt-8">
            Bạn đã chơi ${progress.totalPlayed} lượt · Điểm cao nhất: <span class="text-accent font-bold">${progress.bestScore}/10</span>
          </p>`
        : null}
    </div>
  `
}

function OptionButton({ children, state, onClick, disabled }) {
  const cls = {
    idle: 'bg-surface hover:border-accent border-white/10',
    correct: 'bg-green-500 text-ground border-green-400',
    wrong: 'bg-accent-2 text-white border-red-400',
    dim: 'bg-surface border-white/5 opacity-50',
  }[state]
  return html`
    <button
      onClick=${onClick}
      disabled=${disabled}
      class=${`w-full min-h-[56px] px-4 py-3 rounded-card border font-semibold text-lg transition-all ${cls}`}
    >${children}</button>
  `
}

function FlagThumb({ country }) {
  return html`<div class="flag-img w-full rounded-flag overflow-hidden border border-white/10">
    <img src=${country.flagPng} alt="lá cờ lựa chọn" class="w-full h-full object-cover" loading="lazy" />
  </div>`
}

export function QuizPage() {
  const { countries, loading, error } = useCountries()
  const navigate = useNavigate()

  const [mode, setMode] = useState(null)
  const [questions, setQuestions] = useState([])
  const [idx, setIdx] = useState(0)
  const [picked, setPicked] = useState(null)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [finished, setFinished] = useState(false)
  const [finalProgress, setFinalProgress] = useState(null)

  const startMode = useCallback(
    (m) => {
      setMode(m)
      setQuestions(buildQuestions(countries))
      setIdx(0)
      setPicked(null)
      setScore(0)
      setStreak(0)
      setBestStreak(0)
      setFinished(false)
    },
    [countries]
  )

  const current = questions[idx]

  function choose(opt) {
    if (picked) return
    setPicked(opt)
    const correct = opt.code === current.answer.code
    const newScore = correct ? score + 1 : score
    const newStreak = correct ? streak + 1 : 0
    const newBest = Math.max(bestStreak, newStreak)
    setScore(newScore)
    setStreak(newStreak)
    setBestStreak(newBest)
    if (correct && mode === 'flag-en') setTimeout(() => speak(current.answer.nameEn), 250)

    setTimeout(() => {
      if (idx + 1 >= questions.length) {
        const prog = saveResult({ score: newScore, total: TOTAL, bestStreak: newBest })
        setFinalProgress(prog)
        setFinished(true)
      } else {
        setIdx((i) => i + 1)
        setPicked(null)
      }
    }, 950)
  }

  if (loading) return html`<${Spinner} />`
  if (error) return html`<${ErrorBox} message=${error} />`
  if (!mode) return html`<${ModePicker} onPick=${startMode} />`
  if (finished)
    return html`<div class="px-4 py-10"><${ScoreBoard}
      score=${score}
      total=${TOTAL}
      progress=${finalProgress || loadProgress()}
      onReplay=${() => startMode(mode)}
      onExplore=${() => navigate('/kham-pha')}
    /></div>`

  if (!current) return html`<${Spinner} />`

  const isFlagQuestion = mode !== 'name-flag'
  const optState = (opt) => {
    if (!picked) return 'idle'
    if (opt.code === current.answer.code) return 'correct'
    if (opt.code === picked.code) return 'wrong'
    return 'dim'
  }

  return html`
    <div class="max-w-2xl mx-auto px-4 py-8">
      <div class="flex items-center justify-between mb-4 text-sm">
        <span class="text-muted">Câu ${idx + 1} / ${TOTAL}</span>
        <span class="text-accent font-bold">⭐ ${score} điểm${streak >= 2 ? ` · 🔥 ${streak}` : ''}</span>
      </div>
      <div class="h-2 bg-surface rounded-full overflow-hidden mb-6">
        <div class="h-full bg-accent transition-all" style=${`width:${(idx / TOTAL) * 100}%`}></div>
      </div>

      <div class="bg-surface rounded-card p-6 border border-white/10 mb-6 text-center">
        ${isFlagQuestion
          ? html`
              <div class="w-56 h-36 mx-auto rounded-flag overflow-hidden border border-white/10 flag-img mb-4">
                <img src=${current.answer.flagPng2x} alt="Lá cờ cần đoán" class="w-full h-full object-cover" />
              </div>
              <p class="font-display text-xl font-bold">
                ${mode === 'flag-en' ? 'Đây là cờ của nước nào? (tiếng Anh)' : 'Đây là cờ của nước nào?'}
              </p>
            `
          : html`
              <p class="text-muted text-sm">Đâu là lá cờ của</p>
              <p class="font-display text-3xl font-extrabold mb-2">${current.answer.nameVi}?</p>
            `}
      </div>

      ${isFlagQuestion
        ? html`<div class="grid sm:grid-cols-2 gap-3">
            ${current.options.map(
              (opt) => html`<${OptionButton}
                key=${opt.code}
                state=${optState(opt)}
                disabled=${!!picked}
                onClick=${() => choose(opt)}
              >${mode === 'flag-en' ? opt.nameEn : opt.nameVi}<//>`
            )}
          </div>`
        : html`<div class="grid grid-cols-2 gap-3">
            ${current.options.map(
              (opt) => html`<button
                key=${opt.code}
                disabled=${!!picked}
                onClick=${() => choose(opt)}
                class=${`rounded-card border p-2 transition-all ${
                  picked
                    ? opt.code === current.answer.code
                      ? 'border-green-400 ring-2 ring-green-400'
                      : opt.code === picked.code
                      ? 'border-red-400 opacity-70'
                      : 'opacity-40 border-white/5'
                    : 'border-white/10 hover:border-accent hover:-translate-y-1'
                }`}
              >
                <${FlagThumb} country=${opt} />
              </button>`
            )}
          </div>`}

      ${picked && canSpeak && mode === 'flag-en'
        ? html`<div class="text-center mt-4">
            <button onClick=${() => speak(current.answer.nameEn)} class="text-muted hover:text-ink text-sm">
              🔊 Nghe lại: <span class="font-semibold">${current.answer.nameEn}</span>
            </button>
          </div>`
        : null}
    </div>
  `
}
