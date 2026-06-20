// Tải dữ liệu tĩnh từ thư mục data/ rồi merge + normalize.
// Không gọi API runtime (REST Countries đã deprecated) — dữ liệu nằm sẵn trong repo.

import { stripDiacritics } from './utils/normalize.js'

const DATA_BASE = new URL('../data/', import.meta.url)

async function fetchJSON(name) {
  const res = await fetch(new URL(name, DATA_BASE))
  if (!res.ok) throw new Error(`Không tải được ${name} (HTTP ${res.status})`)
  return res.json()
}

function pickCapital(country, extra) {
  if (extra && extra.capital) return extra.capital
  if (Array.isArray(country.capital) && country.capital.length) return country.capital[0]
  return 'Chưa rõ'
}

function normalize(raw, viNames, extraMap) {
  const code = raw.cca2
  const nameEn = raw?.name?.common || code
  const nameVi = viNames[code] || nameEn
  const extra = extraMap[code] || null
  const demonym = raw?.demonyms?.eng?.m || raw?.demonyms?.eng?.f || ''
  const lower = code.toLowerCase()

  return {
    code,
    lower,
    nameEn,
    nameVi,
    demonym,
    flagEmoji: raw.flag || '🏳️',
    flagPng: `https://flagcdn.com/w320/${lower}.png`,
    flagPng2x: `https://flagcdn.com/w640/${lower}.png`,
    continent: raw.region || 'Khác',
    subregion: raw.subregion || '',
    capital: pickCapital(raw, extra),
    area: typeof raw.area === 'number' ? raw.area : null,
    // nội dung phong phú (có thể null)
    tourism: extra?.tourism || null,
    culture: extra?.culture || null,
    cultureImage: extra?.cultureImage || null,
    food: extra?.food || null,
    funFacts: extra?.funFacts || null,
    hasExtra: !!extra,
    // chuỗi đã bỏ dấu, phục vụ tìm kiếm
    searchKey: `${stripDiacritics(nameVi)} ${stripDiacritics(nameEn)} ${code.toLowerCase()}`,
  }
}

let _cache = null

export async function loadCountries() {
  if (_cache) return _cache

  const [rawList, viNames, extraMap, continents] = await Promise.all([
    fetchJSON('countries.json'),
    fetchJSON('countries-vi.json'),
    fetchJSON('countries-extra.json'),
    fetchJSON('continents-vi.json'),
  ])

  const continentVi = Object.fromEntries(continents.map((c) => [c.key, c]))

  const countries = rawList
    .filter((c) => c.cca2) // bỏ entry thiếu mã
    .map((c) => {
      const n = normalize(c, viNames, extraMap)
      n.continentVi = continentVi[n.continent]?.nameVi || n.continent
      return n
    })
    .sort((a, b) => a.nameVi.localeCompare(b.nameVi, 'vi'))

  _cache = { countries, continents }
  return _cache
}
