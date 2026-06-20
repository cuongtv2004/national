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
import { MapPage } from './pages/MapPage.js'
import { GamesHub } from './pages/GamesHub.js'
import { MapQuizPage } from './pages/MapQuizPage.js'
import { MemoryPage } from './pages/MemoryPage.js'
import { CollectionPage } from './pages/CollectionPage.js'

function App() {
  return html`
    <${CountriesProvider}>
      <${HashRouter}>
        <div class="min-h-screen flex flex-col">
          <${Navbar} />
          <main class="flex-1">
            <${Routes}>
              <${Route} path="/" element=${html`<${HomePage} />`} />
              <${Route} path="/ban-do" element=${html`<${MapPage} />`} />
              <${Route} path="/kham-pha" element=${html`<${GalleryPage} />`} />
              <${Route} path="/quoc-gia/:code" element=${html`<${CountryDetailPage} />`} />
              <${Route} path="/thu-thach" element=${html`<${GamesHub} />`} />
              <${Route} path="/thu-thach/doan-co" element=${html`<${QuizPage} />`} />
              <${Route} path="/thu-thach/ban-do" element=${html`<${MapQuizPage} />`} />
              <${Route} path="/thu-thach/lat-the" element=${html`<${MemoryPage} />`} />
              <${Route} path="/bo-suu-tap" element=${html`<${CollectionPage} />`} />
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
