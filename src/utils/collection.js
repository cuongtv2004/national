// Theo dõi tiến độ "sưu tập" cờ: nước đã xem chi tiết + nước đã trả lời đúng trong trò chơi.
const VISITED = 'visited_countries'
const CORRECT = 'quiz_correct'

function readSet(key) {
  try {
    return new Set(JSON.parse(localStorage.getItem(key) || '[]'))
  } catch {
    return new Set()
  }
}
function addTo(key, code) {
  try {
    const s = readSet(key)
    if (!s.has(code)) {
      s.add(code)
      localStorage.setItem(key, JSON.stringify([...s]))
    }
    return s.size
  } catch {
    return 0
  }
}

export const getVisited = () => readSet(VISITED)
export const getQuizCorrect = () => readSet(CORRECT)
export const markVisited = (code) => addTo(VISITED, code)
export const markQuizCorrect = (code) => addTo(CORRECT, code)

// "Đã sưu tập" = đã xem chi tiết HOẶC đã đoán đúng.
export function getCollected() {
  const s = getVisited()
  for (const c of getQuizCorrect()) s.add(c)
  return s
}
