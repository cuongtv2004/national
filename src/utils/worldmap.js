// Tiện ích bản đồ dùng chung: tải dữ liệu TopoJSON + phép chiếu d3-geo.
import * as topojson from 'topojson-client'
import { geoEquirectangular, geoPath, geoOrthographic } from 'd3-geo'

export const MAP_W = 1000
export const MAP_H = 500

// Phép chiếu phẳng (equirectangular) — tự cắt ở kinh tuyến 180°.
export const flatProjection = geoEquirectangular().fitSize([MAP_W, MAP_H], { type: 'Sphere' })
export const flatPath = geoPath(flatProjection)

let _features = null

// Tải các quốc gia (đã bỏ Nam Cực) — cache để chỉ tải một lần.
export async function loadWorldFeatures() {
  if (_features) return _features
  const res = await fetch(new URL('../../data/countries-110m.json', import.meta.url))
  if (!res.ok) throw new Error('Không tải được dữ liệu bản đồ')
  const topo = await res.json()
  _features = topojson.feature(topo, topo.objects.countries).features.filter((f) => f.id !== '010')
  return _features
}

// Tạo phép chiếu quả cầu (orthographic) với bán kính & tâm cho trước.
export function makeGlobe(size) {
  return geoOrthographic()
    .scale(size / 2 - 2)
    .translate([size / 2, size / 2])
    .clipAngle(90)
}

export { geoPath }
