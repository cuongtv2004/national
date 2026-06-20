import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import * as topojson from 'topojson-client'
import { geoEquirectangular, geoPath } from 'd3-geo'
import { html } from '../html.js'
import { useCountries } from '../context.js'
import { Spinner, ErrorBox } from '../components/Spinner.js'

const W = 1000
const H = 500
// d3-geo tự cắt ở kinh tuyến 180° nên các nước vắt qua (Nga, Fiji...) vẽ đúng.
const projection = geoEquirectangular().fitSize([W, H], { type: 'Sphere' })
const pathGen = geoPath(projection)
function project(lon, lat) {
  return projection([lon, lat])
}

// Nhãn châu lục đặt ở vị trí tượng trưng (kinh độ, vĩ độ).
const CONT_LABELS = [
  { key: 'Asia', lon: 95, lat: 48 },
  { key: 'Europe', lon: 12, lat: 57 },
  { key: 'Africa', lon: 19, lat: 4 },
  { key: 'Americas', lon: -98, lat: 44 },
  { key: 'Oceania', lon: 142, lat: -25 },
]

export function MapPage() {
  const { countries, continents, loading, error } = useCountries()
  const navigate = useNavigate()
  const [topo, setTopo] = useState(null)
  const [topoErr, setTopoErr] = useState(null)
  const [sel, setSel] = useState(null)

  useEffect(() => {
    let alive = true
    fetch(new URL('../../data/countries-110m.json', import.meta.url))
      .then((r) => {
        if (!r.ok) throw new Error('Không tải được dữ liệu bản đồ')
        return r.json()
      })
      .then((d) => alive && setTopo(d))
      .catch((e) => alive && setTopoErr(e.message))
    return () => {
      alive = false
    }
  }, [])

  // Tra cứu ccn3 -> thông tin nước + màu châu lục.
  const { byCcn3, contColor, contViName } = useMemo(() => {
    const cc = Object.fromEntries(continents.map((c) => [c.key, c.color]))
    const cn = Object.fromEntries(continents.map((c) => [c.key, c.nameVi]))
    const map = {}
    for (const c of countries) if (c.ccn3) map[c.ccn3] = c
    return { byCcn3: map, contColor: cc, contViName: cn }
  }, [countries, continents])

  const shapes = useMemo(() => {
    if (!topo) return []
    const feats = topojson.feature(topo, topo.objects.countries).features
    // Bỏ Nam Cực (id 010): không phải châu lục để học và nằm ngoài vùng hiển thị.
    return feats.filter((f) => f.id !== '010').map((f) => {
      const c = byCcn3[f.id]
      return {
        id: f.id,
        d: pathGen(f),
        country: c || null,
        color: c ? contColor[c.continent] || '#2a3b5e' : '#2a3b5e',
        name: c ? c.nameVi : f.properties?.name || '',
      }
    })
  }, [topo, byCcn3, contColor])

  if (loading) return html`<${Spinner} />`
  if (error) return html`<${ErrorBox} message=${error} />`

  const usableConts = continents.filter((c) => CONT_LABELS.some((l) => l.key === c.key))

  return html`
    <div class="max-w-5xl mx-auto px-4 py-8">
      <h1 class="font-display text-3xl sm:text-4xl font-extrabold mb-2">Bản đồ thế giới 🗺️</h1>
      <p class="text-muted mb-5">
        Mỗi <b>màu</b> là một châu lục. Đây là tất cả vùng đất mà bạn sẽ khám phá! Chạm vào một quốc gia để xem tên.
      </p>

      <!-- Chú giải châu lục -->
      <div class="flex flex-wrap gap-2 mb-4">
        ${usableConts.map(
          (c) => html`<span key=${c.key} class="inline-flex items-center gap-2 bg-surface rounded-full pl-2 pr-3 py-1 text-sm border border-white/5">
            <span class="w-4 h-4 rounded-full" style=${`background-color:${c.color}`}></span>${c.emoji} ${c.nameVi}
          </span>`
        )}
      </div>

      <!-- Thanh thông tin nước đang chọn -->
      <div class="mb-3 min-h-[52px] bg-surface rounded-card border border-white/10 px-4 py-3 flex items-center justify-between gap-3">
        ${sel
          ? html`<div class="flex items-center gap-2 min-w-0">
                <span class="text-2xl" aria-hidden="true">${sel.flagEmoji}</span>
                <div class="min-w-0">
                  <div class="font-display font-bold leading-tight truncate">${sel.nameVi}</div>
                  <div class="text-xs text-muted">${contViName[sel.continent] || sel.continent}</div>
                </div>
              </div>
              <button
                onClick=${() => navigate(`/quoc-gia/${sel.lower}`)}
                class="shrink-0 bg-accent text-ground font-semibold rounded-full px-4 py-2 text-sm hover:scale-105 transition-transform"
              >Xem chi tiết →</button>`
          : html`<span class="text-muted text-sm">Chạm vào một quốc gia trên bản đồ để xem tên nhé! 👆</span>`}
      </div>

      ${topoErr
        ? html`<${ErrorBox} message=${topoErr} />`
        : !topo
        ? html`<${Spinner} label="Đang vẽ bản đồ..." />`
        : html`
            <div class="overflow-x-auto rounded-card border border-white/10 bg-[#0a1830]">
              <svg
                viewBox="0 18 1000 392"
                class="w-full h-auto block"
                role="img"
                aria-label="Bản đồ thế giới tô màu theo châu lục"
              >
                ${shapes.map(
                  (s) => html`<path
                    key=${s.id}
                    d=${s.d}
                    fill=${sel && sel.ccn3 === s.id ? '#FCD116' : s.color}
                    stroke="#0a1830"
                    strokeWidth="0.5"
                    class=${s.country ? 'cursor-pointer hover:opacity-80' : 'opacity-60'}
                    onClick=${s.country ? () => setSel(s.country) : null}
                  >
                    <title>${s.name}</title>
                  </path>`
                )}
                ${CONT_LABELS.map((l) => {
                  const [x, y] = project(l.lon, l.lat)
                  return html`<text
                    key=${l.key}
                    x=${x}
                    y=${y}
                    textAnchor="middle"
                    class="pointer-events-none"
                    fill="#ffffff"
                    fontFamily="Baloo 2, sans-serif"
                    fontWeight="800"
                    fontSize="18"
                    opacity="0.92"
                    stroke="#0a1830"
                    strokeWidth="3"
                    paintOrder="stroke"
                  >${contViName[l.key] || l.key}</text>`
                })}
              </svg>
            </div>
            <p class="text-xs text-muted mt-2 text-center">Dữ liệu bản đồ: world-atlas (Natural Earth). Nam Cực không có quốc gia nên được lược bớt.</p>
          `}
    </div>
  `
}
