import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { html } from './html.js'
import { CountriesProvider } from './context.js'
import { Navbar } from './components/Navbar.js'
import { Footer } from './components/Footer.js'
import { HomePage } from './pages/HomePage.js'
import { GalleryPage } from './pages/GalleryPage.js'
import { CountryDetailPage } from './pages/CountryDetailPage.js'
import { QuizPage } from './pages/QuizPage.js'

function App() {
  return html`
    <${CountriesProvider}>
      <${HashRouter}>
        <div class="min-h-screen flex flex-col">
          <${Navbar} />
          <main class="flex-1">
            <${Routes}>
              <${Route} path="/" element=${html`<${HomePage} />`} />
              <${Route} path="/kham-pha" element=${html`<${GalleryPage} />`} />
              <${Route} path="/quoc-gia/:code" element=${html`<${CountryDetailPage} />`} />
              <${Route} path="/thu-thach" element=${html`<${QuizPage} />`} />
              <${Route} path="*" element=${html`<${Navigate} to="/" replace />`} />
            <//>
          </main>
          <${Footer} />
        </div>
      <//>
    <//>
  `
}

createRoot(document.getElementById('root')).render(html`<${StrictMode}><${App} /><//>`)
