import { Link } from 'react-router-dom'
import { html } from '../html.js'
import { loadProgress } from '../utils/score.js'

const GAMES = [
  { to: '/thu-thach/doan-co', icon: '🚩', title: 'Đoán cờ', desc: 'Nhìn cờ đoán tên, hoặc học tên tiếng Anh', color: '#E8294A' },
  { to: '/thu-thach/ban-do', icon: '🗺️', title: 'Tìm trên bản đồ', desc: 'Tìm đúng vị trí quốc gia trên bản đồ', color: '#16A34A' },
  { to: '/thu-thach/lat-the', icon: '🃏', title: 'Lật thẻ ghi nhớ', desc: 'Lật thẻ tìm cặp cờ và tên giống nhau', color: '#7C3AED' },
]

export function GamesHub() {
  const p = loadProgress()
  return html`
    <div class="max-w-3xl mx-auto px-4 py-10">
      <h1 class="font-display text-4xl font-extrabold mb-2 text-center">Trò chơi 🎮</h1>
      <p class="text-muted mb-8 text-center">Chọn một trò chơi để vừa chơi vừa học cờ nhé!</p>
      <div class="grid sm:grid-cols-3 gap-4">
        ${GAMES.map(
          (g) => html`
            <${Link}
              key=${g.to}
              to=${g.to}
              class="block rounded-card p-6 text-center text-ground font-display font-bold hover:scale-105 transition-transform shadow-lg"
              style=${`background-color:${g.color}`}
            >
              <div class="text-5xl mb-2" aria-hidden="true">${g.icon}</div>
              <div class="text-xl">${g.title}</div>
              <div class="text-sm font-body font-medium opacity-90 mt-1">${g.desc}</div>
            <//>
          `
        )}
      </div>
      ${p.totalPlayed > 0
        ? html`<p class="text-muted text-sm mt-8 text-center">
            Đã chơi ${p.totalPlayed} lượt · Điểm cao nhất: <span class="text-accent font-bold">${p.bestScore}/10</span>
          </p>`
        : null}
    </div>
  `
}
