import { html } from '../html.js'

export function Spinner({ label = 'Đang tải...' }) {
  return html`
    <div class="flex flex-col items-center justify-center py-24 text-muted gap-4">
      <div class="text-5xl animate-bounce" aria-hidden="true">🌍</div>
      <p class="font-display text-lg">${label}</p>
    </div>
  `
}

export function ErrorBox({ message }) {
  return html`
    <div class="max-w-md mx-auto my-16 bg-surface border border-accent-2/40 rounded-card p-6 text-center">
      <div class="text-4xl mb-2" aria-hidden="true">😢</div>
      <h2 class="font-display text-xl font-bold mb-1">Ôi, có lỗi rồi!</h2>
      <p class="text-muted text-sm">${message}</p>
    </div>
  `
}
