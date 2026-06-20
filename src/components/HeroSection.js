import { useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { html } from '../html.js'

// Màu cờ thực để làm "mưa cờ" trên canvas.
const FLAG_COLORS = [
  '#DA251D', '#FFCD00', '#003DA5', '#009639', '#CE1126', '#FFFFFF',
  '#FF9933', '#138808', '#000000', '#EF3340', '#0055A4', '#21468B',
  '#FCD116', '#078930', '#E8112D', '#00247D', '#FF0000', '#FDB913',
]

function prefersReducedMotion() {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  } catch {
    return false
  }
}

export function HeroSection({ mysteryCountry }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || prefersReducedMotion()) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf
    const W = (canvas.width = canvas.offsetWidth)
    const H = (canvas.height = canvas.offsetHeight)
    const N = Math.min(60, Math.floor(W / 12))
    const drops = Array.from({ length: N }, () => ({
      x: Math.random() * W,
      y: Math.random() * -H,
      w: 14 + Math.random() * 14,
      h: 9 + Math.random() * 9,
      vy: 1.2 + Math.random() * 2.2,
      color: FLAG_COLORS[Math.floor(Math.random() * FLAG_COLORS.length)],
      rot: Math.random() * Math.PI,
    }))

    const start = performance.now()
    function frame(now) {
      const elapsed = now - start
      ctx.clearRect(0, 0, W, H)
      const fade = Math.max(0, 1 - Math.max(0, elapsed - 1400) / 900) // mờ dần sau 1.4s
      ctx.globalAlpha = 0.85 * fade
      for (const d of drops) {
        d.y += d.vy
        d.rot += 0.02
        ctx.save()
        ctx.translate(d.x, d.y)
        ctx.rotate(d.rot)
        ctx.fillStyle = d.color
        ctx.fillRect(-d.w / 2, -d.h / 2, d.w, d.h)
        ctx.restore()
      }
      if (fade > 0.01) raf = requestAnimationFrame(frame)
      else ctx.clearRect(0, 0, W, H)
    }
    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [])

  return html`
    <section class="relative overflow-hidden">
      <canvas ref=${canvasRef} class="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true"></canvas>
      <div class="relative max-w-5xl mx-auto px-4 pt-16 pb-12 text-center">
        <p class="text-accent font-semibold tracking-wide uppercase text-sm mb-2">Chào mừng bạn nhỏ đến với</p>
        <h1 class="font-display text-5xl sm:text-7xl font-extrabold leading-none">
          Cờ <span class="text-accent">Các Nước</span>
        </h1>
        <p class="text-muted text-lg mt-4 max-w-xl mx-auto">
          Khám phá những lá cờ của thế giới — vừa chơi, vừa học, vừa giỏi tiếng Anh! 🌍
        </p>

        ${mysteryCountry &&
        html`
          <div class="mt-10 inline-block bg-surface/80 backdrop-blur rounded-card p-6 border border-white/10">
            <p class="font-display text-lg mb-3">🔮 Lá cờ bí ẩn hôm nay</p>
            <div class="w-48 h-32 mx-auto rounded-flag overflow-hidden border border-white/10 flag-img">
              <img src=${mysteryCountry.flagPng2x} alt="Lá cờ bí ẩn" class="w-full h-full object-cover blur-[2px]" />
            </div>
            <${Link}
              to="/thu-thach"
              class="mt-4 inline-block bg-accent text-ground font-display font-bold px-6 py-3 rounded-full hover:scale-105 transition-transform"
            >Đoán xem là nước nào! →<//>
          </div>
        `}
      </div>
    </section>
  `
}
