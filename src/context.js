import { createContext, useContext, useEffect, useState } from 'react'
import { html } from './html.js'
import { loadCountries } from './data.js'

const CountriesContext = createContext(null)

export function CountriesProvider({ children }) {
  const [state, setState] = useState({ loading: true, error: null, countries: [], continents: [] })

  useEffect(() => {
    let alive = true
    loadCountries()
      .then(({ countries, continents }) => {
        if (alive) setState({ loading: false, error: null, countries, continents })
      })
      .catch((err) => {
        if (alive) setState({ loading: false, error: err.message, countries: [], continents: [] })
      })
    return () => {
      alive = false
    }
  }, [])

  return html`<${CountriesContext.Provider} value=${state}>${children}<//>`
}

export function useCountries() {
  const ctx = useContext(CountriesContext)
  if (!ctx) throw new Error('useCountries phải nằm trong CountriesProvider')
  return ctx
}

// Tìm 1 quốc gia theo mã (không phân biệt hoa thường).
export function useCountry(code) {
  const { countries, loading, error } = useCountries()
  const country = countries.find((c) => c.code.toLowerCase() === String(code).toLowerCase()) || null
  return { country, loading, error }
}
