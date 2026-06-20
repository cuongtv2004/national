import { useRef, useEffect } from 'react'
import { geoOrthographic, geoPath, geoGraticule, geoContains } from 'd3-geo'
import { html } from '../html.js'
import { loadWorldFeatures } from '../utils/worldmap.js'

const SIZE = 500 // đơn vị logic cho phép chiếu

// Quả địa cầu 3D vẽ bằng canvas: xoay được bằng tay, tự quay nhẹ, chạm để chọn nước.
export function Globe({ countries, continents, selected, onSelect }) {
  const canvasRef = useRef(null)
  const rot = useRef({ l: 20, p: -10 })
  const dragging = useRef(false)
  const last = useRef({ x: 0, y: 0 })
  const moved = useRef(0)
  const featsRef = useRef(null)
  const dataRef = useRef({ byCcn3: {}, color: {} })
  const selRef = useRef(null)

  // cập nhật tra cứu nước + màu
  useEffect(() => {
    const color = Object.fromEntries(continents.map((c) => [c.key, c.color]))
    const byCcn3 = {}
    for (const c of countries) if (c.ccn3) byCcn3[c.ccn3] = c
    dataRef.current = { byCcn3, color }
  }, [countries, continents])

  useEffect(() => {
    selRef.current = selected ? selected.ccn3 : null
  }, [selected])

  useEffect(() => {
    let raf
    let stop = false
    const canvas = canvasRef.current
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = SIZE * dpr
    canvas.height = SIZE * dpr
    const ctx = canvas.getContext('2d')
    ctx.scale(dpr, dpr)

    const projection = geoOrthographic()
      .scale(SIZE / 2 - 6)
      .translate([SIZE / 2, SIZE / 2])
      .clipAngle(90)
    const path = geoPath(projection, ctx)
    const graticule = geoGraticule()()

    loadWorldFeatures()
      .then((f) => {
        featsRef.current = f
      })
      .catch(() => {})

    function draw() {
      if (stop) return
      if (!dragging.current) rot.current.l += 0.16 // tự quay nhẹ
      projection.rotate([rot.current.l, rot.current.p])
      ctx.clearRect(0, 0, SIZE, SIZE)

      // đại dương
      ctx.beginPath()
      path({ type: 'Sphere' })
      ctx.fillStyle = '#0a1830'
      ctx.fill()

      // kinh tuyến/vĩ tuyến mờ
      ctx.beginPath()
      path(graticule)
      ctx.strokeStyle = 'rgba(255,255,255,0.07)'
      ctx.lineWidth = 0.5
      ctx.stroke()

      // các nước
      const feats = featsRef.current
      const { byCcn3, color } = dataRef.current
      if (feats) {
        for (const f of feats) {
          const c = byCcn3[f.id]
          ctx.beginPath()
          path(f)
          ctx.fillStyle = selRef.current && f.id === selRef.current ? '#FCD116' : c ? color[c.continent] || '#2a3b5e' : '#2a3b5e'
          ctx.fill()
          ctx.strokeStyle = '#0a1830'
          ctx.lineWidth = 0.3
          ctx.stroke()
        }
      }

      // viền quả cầu
      ctx.beginPath()
      path({ type: 'Sphere' })
      ctx.strokeStyle = 'rgba(252,209,22,0.5)'
      ctx.lineWidth = 1.2
      ctx.stroke()

      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)

    // toạ độ con trỏ -> đơn vị logic
    function toLocal(e) {
      const r = canvas.getBoundingClientRect()
      return [((e.clientX - r.left) * SIZE) / r.width, ((e.clientY - r.top) * SIZE) / r.height]
    }
    function onDown(e) {
      dragging.current = true
      moved.current = 0
      const [x, y] = toLocal(e)
      last.current = { x, y }
      canvas.setPointerCapture?.(e.pointerId)
    }
    function onMove(e) {
      if (!dragging.current) return
      const [x, y] = toLocal(e)
      const dx = x - last.current.x
      const dy = y - last.current.y
      moved.current += Math.abs(dx) + Math.abs(dy)
      rot.current.l += dx * 0.3
      rot.current.p = Math.max(-90, Math.min(90, rot.current.p - dy * 0.3))
      last.current = { x, y }
    }
    function onUp(e) {
      dragging.current = false
      if (moved.current < 6) {
        // coi như chạm chọn nước
        const [x, y] = toLocal(e)
        const dxc = x - SIZE / 2
        const dyc = y - SIZE / 2
        const r = SIZE / 2 - 6
        if (dxc * dxc + dyc * dyc <= r * r) {
          const pt = projection.invert([x, y])
          const feats = featsRef.current
          if (pt && feats) {
            const hit = feats.find((f) => geoContains(f, pt))
            const c = hit && dataRef.current.byCcn3[hit.id]
            if (c) onSelect(c)
          }
        }
      }
    }
    canvas.addEventListener('pointerdown', onDown)
    canvas.addEventListener('pointermove', onMove)
    canvas.addEventListener('pointerup', onUp)
    canvas.addEventListener('pointerleave', () => (dragging.current = false))

    return () => {
      stop = true
      cancelAnimationFrame(raf)
      canvas.removeEventListener('pointerdown', onDown)
      canvas.removeEventListener('pointermove', onMove)
      canvas.removeEventListener('pointerup', onUp)
    }
  }, []) // eslint-disable-line

  return html`
    <div class="flex flex-col items-center">
      <canvas
        ref=${canvasRef}
        class="touch-none cursor-grab active:cursor-grabbing"
        style="width:100%;max-width:480px;height:auto;aspect-ratio:1/1"
        role="img"
        aria-label="Quả địa cầu 3D xoay được"
      ></canvas>
      <p class="text-xs text-muted mt-2 text-center">Kéo để xoay quả cầu · Chạm vào một quốc gia để xem tên</p>
    </div>
  `
}
