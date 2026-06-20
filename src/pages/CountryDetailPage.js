import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { html } from '../html.js'
import { useCountry } from '../context.js'
import { Spinner, ErrorBox } from '../components/Spinner.js'
import { ImageCard } from '../components/ImageCard.js'
import { speak, canSpeak } from '../utils/speak.js'

// Ghi nhớ những nước đã xem (cho huy hiệu "Nhà thám hiểm").
function rememberVisit(code) {
  try {
    const key = 'visited_countries'
    const set = new Set(JSON.parse(localStorage.getItem(key) || '[]'))
    set.add(code)
    localStorage.setItem(key, JSON.stringify([...set]))
    return set.size
  } catch {
    return 0
  }
}

function SpeakButton({ text }) {
  if (!canSpeak) return null
  return html`
    <button
      onClick=${() => speak(text)}
      class="ml-2 inline-flex items-center justify-center w-9 h-9 rounded-full bg-surface-2
             hover:bg-accent hover:text-ground transition-colors align-middle"
      aria-label=${'Nghe phát âm: ' + text}
      title="Nghe phát âm tiếng Anh"
    >🔊</button>
  `
}

function InfoStat({ icon, label, value }) {
  return html`
    <div class="bg-surface rounded-card p-4 border border-white/5">
      <div class="text-2xl mb-1" aria-hidden="true">${icon}</div>
      <div class="text-xs text-muted">${label}</div>
      <div class="font-display font-bold text-base sm:text-lg leading-tight break-words">${value}</div>
    </div>
  `
}

function Section({ icon, title, children }) {
  return html`
    <section class="bg-surface rounded-card p-5 border border-white/5 animate-fade-up">
      <h2 class="font-display text-xl font-bold mb-3 flex items-center gap-2">
        <span aria-hidden="true">${icon}</span>${title}
      </h2>
      ${children}
    </section>
  `
}

export function CountryDetailPage() {
  const { code } = useParams()
  const { country, loading, error } = useCountry(code)
  const [broken, setBroken] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (country) {
      rememberVisit(country.code)
      window.scrollTo({ top: 0 })
    }
  }, [country?.code])

  if (loading) return html`<${Spinner} />`
  if (error) return html`<${ErrorBox} message=${error} />`
  if (!country)
    return html`<${ErrorBox} message="Không tìm thấy quốc gia này. Thử quay lại trang Khám phá nhé!" />`

  const areaText = country.area ? country.area.toLocaleString('vi-VN') + ' km²' : 'Chưa rõ'

  return html`
    <div class="max-w-4xl mx-auto px-4 py-8">
      <${Link} to="/kham-pha" class="text-muted hover:text-ink text-sm inline-flex items-center gap-1 mb-4">
        ← Quay lại Khám phá
      <//>

      <div class="grid md:grid-cols-2 gap-6 items-center mb-8">
        <div class="rounded-card overflow-hidden border border-white/10 shadow-lg flag-img bg-surface-2 flex items-center justify-center">
          ${broken
            ? html`<span class="text-[8rem]" aria-hidden="true">${country.flagEmoji}</span>`
            : html`<img
                src=${country.flagPng2x}
                alt=${'Cờ của ' + country.nameVi}
                onError=${() => setBroken(true)}
                class="w-full h-full object-cover"
              />`}
        </div>

        <div>
          <p class="text-muted text-sm mb-1">${country.continentVi} · ${country.subregion}</p>
          <h1 class="font-display text-3xl sm:text-4xl font-extrabold leading-tight break-words">${country.nameVi}</h1>
          <p class="text-xl mt-2">
            <span class="text-muted text-sm">Tiếng Anh:</span> <span class="font-semibold">${country.nameEn}</span>
            <${SpeakButton} text=${country.nameEn} />
          </p>
          ${country.demonym &&
          html`<p class="text-lg mt-1">
            <span class="text-muted text-sm">Người dân:</span> <span class="font-semibold">${country.demonym}</span>
            <${SpeakButton} text=${country.demonym} />
          </p>`}
        </div>
      </div>

      <div class="grid grid-cols-3 gap-3 mb-6">
        <${InfoStat} icon="🏛️" label="Thủ đô" value=${country.capital} />
        <${InfoStat} icon="🌍" label="Châu lục" value=${country.continentVi} />
        <${InfoStat} icon="📐" label="Diện tích" value=${areaText} />
      </div>

      ${country.flagMeaning &&
      html`<div class="mb-6">
        <${Section} icon="🎨" title="Ý nghĩa lá cờ">
          <p class="leading-relaxed">${country.flagMeaning}</p>
        <//>
      </div>`}

      ${country.hasExtra
        ? html`
            <div class="grid sm:grid-cols-2 gap-4">
              ${country.funFacts &&
              html`<div class="sm:col-span-2">
                <${Section} icon="💡" title="Bạn có biết không?">
                  <ul class="space-y-2">
                    ${country.funFacts.map(
                      (f, i) => html`<li key=${i} class="flex gap-2">
                        <span class="text-accent" aria-hidden="true">★</span><span>${f}</span>
                      </li>`
                    )}
                  </ul>
                <//>
              </div>`}
              ${country.tourism &&
              html`<div class="sm:col-span-2">
                <${Section} icon="🏝️" title="Du lịch">
                  <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                    ${country.tourism.map(
                      (t, i) => html`<${ImageCard} key=${i} term=${t} label=${t} emoji="🏝️" />`
                    )}
                  </div>
                <//>
              </div>`}
              ${country.food &&
              html`<div class="sm:col-span-2">
                <${Section} icon="🍜" title="Món ăn đặc trưng">
                  <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                    ${country.food.map(
                      (t, i) => html`<${ImageCard} key=${i} term=${t} label=${t} emoji="🍽️" />`
                    )}
                  </div>
                <//>
              </div>`}
              ${country.culture &&
              html`<div class="sm:col-span-2">
                <${Section} icon="🎎" title="Văn hóa truyền thống">
                  <div class="flex flex-col sm:flex-row gap-4 items-start">
                    ${country.cultureImage &&
                    html`<div class="w-full sm:w-56 shrink-0">
                      <${ImageCard} term=${country.cultureImage} label=${country.cultureImage} emoji="🎎" />
                    </div>`}
                    <p class="leading-relaxed flex-1">${country.culture}</p>
                  </div>
                <//>
              </div>`}
            </div>
          `
        : html`<div class="bg-surface rounded-card p-6 border border-white/5 text-center text-muted">
            <p>Thông tin chi tiết về quốc gia này sẽ được bổ sung sớm. 🌱</p>
          </div>`}

      <div class="mt-8 text-center">
        <button
          onClick=${() => navigate('/thu-thach')}
          class="bg-accent text-ground font-display font-bold text-lg px-8 py-4 rounded-full
                 hover:scale-105 transition-transform"
        >
          🎮 Thử đoán cờ trong trò chơi!
        </button>
      </div>
    </div>
  `
}
