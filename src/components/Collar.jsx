import { useEffect, useRef } from 'react'

// Collar dibujado en SVG: un hilo con cuentas que caen una a una y se mece.
// Liviano: sin imágenes ni librerías. Reacciona al puntero con una variable CSS.

const PIEDRAS = [
  { id: 'turquesa', luz: '#9fe3dc', base: '#2aa39a', sombra: '#0f5e5a' },
  { id: 'coral', luz: '#ffb3a6', base: '#e54d38', sombra: '#8f2415' },
  { id: 'oliva', luz: '#ece27a', base: '#c2b71d', sombra: '#6c650a' },
  { id: 'azul', luz: '#5d7fb8', base: '#062553', sombra: '#020d20' },
  { id: 'manteca', luz: '#fffbe3', base: '#fcf1b3', sombra: '#c9b560' },
  { id: 'ambar', luz: '#ffd79a', base: '#d98a2b', sombra: '#7a420c' },
]

// Punto de una curva cuadrática: el hilo cuelga de dos extremos y baja en el centro.
const P0 = { x: 40, y: 20 }
const P1 = { x: 260, y: 640 }
const P2 = { x: 480, y: 20 }
const punto = (t) => ({
  x: (1 - t) ** 2 * P0.x + 2 * (1 - t) * t * P1.x + t ** 2 * P2.x,
  y: (1 - t) ** 2 * P0.y + 2 * (1 - t) * t * P1.y + t ** 2 * P2.y,
})

// Secuencia fija (no aleatoria) para que el collar sea siempre el mismo.
const SECUENCIA = [0, 4, 1, 3, 2, 5, 0, 1, 4, 2, 3, 5, 1, 0, 4, 2, 3, 1, 5, 0]
const TAMANOS = [9, 12, 8, 14, 10, 13, 11, 16, 12, 14, 18, 14, 12, 16, 11, 13, 10, 14, 8, 12]

// Muestrea la curva para ubicar las cuentas por distancia real (no por t),
// así quedan una al lado de la otra como en un collar de verdad.
const MUESTRAS = Array.from({ length: 401 }, (_, k) => punto(k / 400))
const LARGOS = MUESTRAS.reduce((acc, q, k) => {
  acc.push(k === 0 ? 0 : acc[k - 1] + Math.hypot(q.x - MUESTRAS[k - 1].x, q.y - MUESTRAS[k - 1].y))
  return acc
}, [])
const TOTAL = LARGOS[LARGOS.length - 1]
const enDistancia = (d) => {
  const k = Math.max(1, LARGOS.findIndex((l) => l >= d))
  const f = (d - LARGOS[k - 1]) / (LARGOS[k] - LARGOS[k - 1] || 1)
  return {
    x: MUESTRAS[k - 1].x + (MUESTRAS[k].x - MUESTRAS[k - 1].x) * f,
    y: MUESTRAS[k - 1].y + (MUESTRAS[k].y - MUESTRAS[k - 1].y) * f,
  }
}
const SEPARACION = 2
const OCUPADO = TAMANOS.reduce((s, r) => s + r * 2 + SEPARACION, -SEPARACION)
let recorrido = TOTAL / 2 - OCUPADO / 2

const CUENTAS = SECUENCIA.map((piedra, i) => {
  const r = TAMANOS[i]
  const centro = enDistancia(recorrido + r)
  recorrido += r * 2 + SEPARACION
  return { ...centro, r, piedra: PIEDRAS[piedra].id, i }
})
const CENTRO = punto(0.5)

export default function Collar() {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el || !window.matchMedia('(pointer: fine)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let cuadro = 0
    function mover(e) {
      cancelAnimationFrame(cuadro)
      cuadro = requestAnimationFrame(() => {
        const x = (e.clientX / window.innerWidth - 0.5) * 2
        el.style.setProperty('--px', x.toFixed(3))
      })
    }
    window.addEventListener('pointermove', mover, { passive: true })
    return () => {
      window.removeEventListener('pointermove', mover)
      cancelAnimationFrame(cuadro)
    }
  }, [])

  return (
    <div className="collar" ref={ref} aria-hidden="true">
      <svg viewBox="0 0 520 720" role="presentation">
        <defs>
          {PIEDRAS.map((p) => (
            <radialGradient key={p.id} id={`piedra-${p.id}`} cx="35%" cy="30%" r="75%">
              <stop offset="0%" stopColor={p.luz} />
              <stop offset="45%" stopColor={p.base} />
              <stop offset="100%" stopColor={p.sombra} />
            </radialGradient>
          ))}
          <radialGradient id="dije" cx="38%" cy="28%" r="80%">
            <stop offset="0%" stopColor="#c8f1ec" />
            <stop offset="40%" stopColor="#3cb4aa" />
            <stop offset="100%" stopColor="#0b4a46" />
          </radialGradient>
          <filter id="sombra-cuenta" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="6" stdDeviation="5" floodColor="#062553" floodOpacity="0.22" />
          </filter>
        </defs>

        <g className="collar-mece">
          <path className="collar-hilo" d={`M${P0.x} ${P0.y} Q${P1.x} ${P1.y} ${P2.x} ${P2.y}`} pathLength="1" />
          <g filter="url(#sombra-cuenta)">
            {CUENTAS.map((c) => (
              <g key={c.i} className="cuenta" style={{ '--i': c.i }}>
                <circle cx={c.x} cy={c.y} r={c.r} fill={`url(#piedra-${c.piedra})`} />
                <circle cx={c.x - c.r * 0.35} cy={c.y - c.r * 0.4} r={c.r * 0.22} fill="#fff" opacity="0.55" />
              </g>
            ))}
            {/* Dije central: una gota de turquesa */}
            <g className="cuenta dije" style={{ '--i': SECUENCIA.length }}>
              <line x1={CENTRO.x} y1={CENTRO.y} x2={CENTRO.x} y2={CENTRO.y + 34} className="collar-hilo-dije" />
              <path
                d={`M${CENTRO.x} ${CENTRO.y + 30} C ${CENTRO.x + 34} ${CENTRO.y + 70}, ${CENTRO.x + 30} ${CENTRO.y + 118}, ${CENTRO.x} ${CENTRO.y + 124} C ${CENTRO.x - 30} ${CENTRO.y + 118}, ${CENTRO.x - 34} ${CENTRO.y + 70}, ${CENTRO.x} ${CENTRO.y + 30} Z`}
                fill="url(#dije)"
              />
              <ellipse cx={CENTRO.x - 9} cy={CENTRO.y + 66} rx="6" ry="13" fill="#fff" opacity="0.45" />
            </g>
          </g>
        </g>
      </svg>
    </div>
  )
}
