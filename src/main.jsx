import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { MARCA, COLORES } from './marca.js'
import { faviconIniciales } from './components/Logo.jsx'

// El panel se carga aparte para no sumar peso a la tienda.
const Admin = lazy(() => import('./admin/Admin.jsx'))
const esAdmin = window.location.pathname.startsWith('/admin')

// Aplica los datos de la marca antes de pintar la página.
const raiz = document.documentElement
for (const [nombre, valor] of Object.entries(COLORES)) raiz.style.setProperty(`--${nombre}`, valor)
document.title = MARCA.nombre
document.querySelector('meta[name="description"]')?.setAttribute('content', MARCA.descripcion)
document.querySelector('meta[name="theme-color"]')?.setAttribute('content', COLORES.primario)
const icono = document.querySelector('link[rel="icon"]')
if (icono) {
  icono.type = MARCA.logo ? '' : 'image/svg+xml'
  icono.href = MARCA.logo || faviconIniciales(COLORES.primario)
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {esAdmin ? (
      <Suspense fallback={null}>
        <Admin />
      </Suspense>
    ) : (
      <App />
    )}
  </StrictMode>,
)
