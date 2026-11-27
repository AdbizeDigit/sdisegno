import { MARCA } from '../marca.js'

// Muestra el logo de la marca, o sus iniciales mientras no haya uno.
export default function Logo({ tamano = 52, radio = 12, conTexto = false, className = '' }) {
  const alt = conTexto ? MARCA.nombre : ''
  if (MARCA.logo) {
    return <img src={MARCA.logo} alt={alt} width={tamano} height={tamano} className={className} style={{ borderRadius: radio, display: 'block' }} />
  }
  return (
    <svg
      width={tamano}
      height={tamano}
      viewBox="0 0 52 52"
      className={className}
      role={conTexto ? 'img' : undefined}
      aria-label={conTexto ? MARCA.nombre : undefined}
      aria-hidden={conTexto ? undefined : 'true'}
      style={{ display: 'block' }}
    >
      <circle cx="26" cy="26" r="25" fill="var(--fondo-claro)" stroke="var(--primario)" strokeWidth="1.5" />
      <text x="25" y="27" textAnchor="middle" dominantBaseline="central" fill="var(--primario)" fontFamily="var(--titulos)" fontStyle="italic" fontWeight="600" fontSize="26">
        {MARCA.iniciales}
      </text>
      <circle cx="38" cy="34" r="1.8" fill="var(--primario)" />
    </svg>
  )
}

// Favicon con las iniciales, para no depender de un archivo de imagen.
export function faviconIniciales(color) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52"><circle cx="26" cy="26" r="26" fill="${color}"/><text x="25" y="27" text-anchor="middle" dominant-baseline="central" fill="#fff" font-family="Georgia,serif" font-style="italic" font-weight="700" font-size="26">${MARCA.iniciales}</text></svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}
