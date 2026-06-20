// Phát âm tiếng Anh bằng Web Speech API (built-in trình duyệt).
// No-op nếu trình duyệt không hỗ trợ — không bao giờ làm app crash.
export function speak(text, lang = 'en-US') {
  try {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return false
    const synth = window.speechSynthesis
    synth.cancel() // dừng câu đang đọc dở
    const u = new SpeechSynthesisUtterance(text)
    u.lang = lang
    u.rate = 0.9 // chậm hơn chút cho bé nghe rõ
    u.pitch = 1.05
    synth.speak(u)
    return true
  } catch {
    return false
  }
}

export const canSpeak =
  typeof window !== 'undefined' && 'speechSynthesis' in window
