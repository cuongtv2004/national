// Quản lý điểm + huy hiệu qua localStorage.
const KEY = 'quiz_progress'

const BADGES = [
  { id: 'first', icon: '🎉', name: 'Người mới', test: (s) => s.totalPlayed >= 1 },
  { id: 'perfect', icon: '🏆', name: 'Thiên tài cờ', test: (s) => s.bestScore >= 10 },
  { id: 'explorer', icon: '🧭', name: 'Nhà thám hiểm', test: (s) => s.visited >= 50 },
  { id: 'streak', icon: '🔥', name: 'Không thể cản', test: (s) => s.bestStreak >= 5 },
]

export function loadProgress() {
  try {
    const base = { totalPlayed: 0, totalCorrect: 0, bestScore: 0, bestStreak: 0 }
    const saved = JSON.parse(localStorage.getItem(KEY) || '{}')
    const visited = JSON.parse(localStorage.getItem('visited_countries') || '[]').length
    return { ...base, ...saved, visited }
  } catch {
    return { totalPlayed: 0, totalCorrect: 0, bestScore: 0, bestStreak: 0, visited: 0 }
  }
}

export function saveResult({ score, total, bestStreak }) {
  try {
    const p = loadProgress()
    const next = {
      totalPlayed: p.totalPlayed + 1,
      totalCorrect: p.totalCorrect + score,
      bestScore: Math.max(p.bestScore, score),
      bestStreak: Math.max(p.bestStreak, bestStreak),
    }
    localStorage.setItem(KEY, JSON.stringify(next))
    return { ...next, visited: p.visited }
  } catch {
    return loadProgress()
  }
}

export function earnedBadges(progress) {
  return BADGES.filter((b) => b.test(progress))
}

export { BADGES }
