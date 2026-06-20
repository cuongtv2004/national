import { html } from '../html.js'
import { earnedBadges } from '../utils/score.js'

function starsFor(score, total) {
  const pct = total ? score / total : 0
  if (pct >= 0.9) return 3
  if (pct >= 0.6) return 2
  if (pct >= 0.3) return 1
  return 0
}

export function ScoreBoard({ score, total, progress, onReplay, onExplore }) {
  const stars = starsFor(score, total)
  const great = score / total >= 0.8
  const badges = earnedBadges(progress)

  return html`
    <div class="max-w-md mx-auto text-center bg-surface rounded-card p-8 border border-white/10 animate-bounce-in">
      <div class="text-2xl font-display font-bold mb-1">${great ? 'Xuất sắc! 🎊' : 'Cố lên nhé! 💪'}</div>
      <p class="text-muted">${great ? 'Bạn đúng là chuyên gia cờ!' : 'Thử lại nào, chắc chắn lần sau giỏi hơn!'}</p>

      <div class="my-6 flex justify-center gap-2 text-5xl">
        ${[0, 1, 2].map(
          (i) => html`<span key=${i} class=${i < stars ? 'animate-star-pop' : 'opacity-20'}>⭐</span>`
        )}
      </div>

      <div class="font-display text-6xl font-extrabold text-accent">${score}<span class="text-2xl text-muted">/${total}</span></div>
      <p class="text-muted text-sm mt-1">câu trả lời đúng</p>

      ${badges.length
        ? html`<div class="mt-6">
            <p class="text-sm text-muted mb-2">Huy hiệu của bạn</p>
            <div class="flex flex-wrap justify-center gap-2">
              ${badges.map(
                (b) => html`<span key=${b.id} class="bg-surface-2 rounded-full px-3 py-1.5 text-sm" title=${b.name}>
                  ${b.icon} ${b.name}
                </span>`
              )}
            </div>
          </div>`
        : null}

      <div class="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
        <button onClick=${onReplay} class="bg-accent text-ground font-display font-bold px-6 py-3 rounded-full hover:scale-105 transition-transform">
          🔄 Chơi lại
        </button>
        <button onClick=${onExplore} class="bg-surface-2 font-display font-bold px-6 py-3 rounded-full hover:bg-surface-2/70 transition-colors">
          🌍 Khám phá thêm
        </button>
      </div>
    </div>
  `
}
