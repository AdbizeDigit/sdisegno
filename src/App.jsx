import { useCallback, useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import Icono from './components/Icono.jsx'
import Logo from './components/Logo.jsx'
import fotoPortada from './assets/portada.webp'
import fotoPortadaChica from './assets/portada-chica.webp'
import Coleccion from './components/Coleccion.jsx'
import Detalle from './components/Detalle.jsx'
import Reserva from './components/Reserva.jsx'
import Carrito from './components/Carrito.jsx'
import VideoFondo from './components/VideoFondo.jsx'
import { api } from './api.js'
import {
  MARCA, PORTADA, SECCIONES, FORMATOS, DESTACADO, LUGARES, EQUIPO, FRASES, MANIFIESTO, VENTANA, PASOS_REDISENO,
} from './marca.js'
import './tienda.css'

const QUIETO = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Cambia el estado con una transición de vista si el navegador la tiene.
function conTransicion(cambio) {
  if (!document.startViewTransition || QUIETO) return cambio()
  document.startViewTransition(() => flushSync(cambio))
}

function leerPedidoGuardado() {
  try {
    const guardado = JSON.parse(localStorage.getItem('sd_pedido') || '[]')
    return Array.isArray(guardado) ? guardado : []
  } catch {
    return []
  }
}

// Título con palabras que suben desde una máscara.
function TituloCinetico({ lineas }) {
  let i = 0
  return (
    <h1 className="portada-titulo" aria-label={lineas.join(' ')}>
      {lineas.map((linea, l) => (
        <span key={l} className="portada-linea" aria-hidden="true">
          {linea.split(' ').map((palabra, p) => (
            <span key={p} className="mascara">
              <span className="sube" style={{ '--d': `${120 + i++ * 90}ms` }}>{palabra}</span>
            </span>
          ))}
        </span>
      ))}
    </h1>
  )
}

export default function App() {
  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [errorCarga, setErrorCarga] = useState(false)
  const [whatsapp, setWhatsapp] = useState('')
  const [items, setItems] = useState(leerPedidoGuardado)
  const [carritoAbierto, setCarritoAbierto] = useState(false)
  const [detalle, setDetalle] = useState(null)
  const [barraOculta, setBarraOculta] = useState(false)
  const botonPedido = useRef(null)
  const menu = SECCIONES.menu

  useEffect(() => {
    api.productos().then(setProductos).catch(() => setErrorCarga(true)).finally(() => setCargando(false))
    api.ajustes().then((a) => setWhatsapp(a.whatsapp)).catch(() => {})
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem('sd_pedido', JSON.stringify(items))
    } catch {
      /* sin almacenamiento disponible */
    }
  }, [items])

  useEffect(() => {
    if (!cargando && !errorCarga) setItems((actual) => actual.filter((i) => productos.some((p) => p.id === i.id)))
  }, [cargando, errorCarga, productos])

  // Apariciones: cada elemento se anima una sola vez al entrar en pantalla.
  useEffect(() => {
    if (QUIETO || !('IntersectionObserver' in window)) return
    document.documentElement.classList.add('animar')
    const obs = new IntersectionObserver(
      (entradas) => entradas.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('visto')
          obs.unobserve(e.target)
        }
      }),
      { rootMargin: '0px 0px -12% 0px' },
    )
    document.querySelectorAll('.aparece, .manifiesto-texto, .historia-foto, .pilar-foto, .pie-marca').forEach((el) => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  // La barra se esconde al bajar y vuelve al subir.
  useEffect(() => {
    let ultimo = window.scrollY
    let cuadro = 0
    function alScroll() {
      if (cuadro) return
      cuadro = requestAnimationFrame(() => {
        const y = window.scrollY
        setBarraOculta(y > 300 && y > ultimo)
        ultimo = y
        cuadro = 0
      })
    }
    window.addEventListener('scroll', alScroll, { passive: true })
    return () => window.removeEventListener('scroll', alScroll)
  }, [])

  const enCarrito = (id) => items.find((i) => i.id === id)?.cantidad ?? 0
  const cantidadTotal = items.reduce((s, i) => s + i.cantidad, 0)

  // Una cuenta vuela desde el botón hasta "Tu pedido".
  function volarCuenta(origen) {
    const destino = botonPedido.current
    if (!origen || !destino || QUIETO || !origen.animate) return
    const a = origen.getBoundingClientRect()
    const b = destino.getBoundingClientRect()
    const cuenta = document.createElement('span')
    cuenta.className = 'cuenta-vuela'
    document.body.appendChild(cuenta)
    const x0 = a.left + a.width / 2, y0 = a.top + a.height / 2
    const x1 = b.left + b.width / 2, y1 = b.top + b.height / 2
    const vuelo = cuenta.animate(
      [
        { transform: `translate(${x0}px, ${y0}px) scale(0.6)`, opacity: 0 },
        { transform: `translate(${(x0 + x1) / 2}px, ${Math.min(y0, y1) - 140}px) scale(1.25)`, opacity: 1, offset: 0.45 },
        { transform: `translate(${x1}px, ${y1}px) scale(0.4)`, opacity: 0.9 },
      ],
      { duration: 750, easing: 'cubic-bezier(.5,0,.3,1)' },
    )
    vuelo.onfinish = () => {
      cuenta.remove()
      destino.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.15)' }, { transform: 'scale(1)' }], { duration: 350 })
    }
  }

  function agregar(pieza, origen) {
    setItems((actual) => {
      const existe = actual.find((i) => i.id === pieza.id)
      if (existe) return actual.map((i) => (i.id === pieza.id ? { ...i, cantidad: Math.min(pieza.stock, i.cantidad + 1) } : i))
      return [...actual, { id: pieza.id, cantidad: 1 }]
    })
    setBarraOculta(false)
    volarCuenta(origen)
  }

  function cambiarCantidad(id, cantidad) {
    setItems((actual) => (cantidad < 1 ? actual.filter((i) => i.id !== id) : actual.map((i) => (i.id === id ? { ...i, cantidad } : i))))
  }

  const verPieza = (pieza) => conTransicion(() => setDetalle(pieza))
  const cerrarDetalle = useCallback(() => conTransicion(() => setDetalle(null)), [])
  const cerrarCarrito = useCallback(() => setCarritoAbierto(false), [])

  const palabras = MANIFIESTO.split(' ')

  return (
    <>
      {/* Hilo: una línea que crece con el scroll (solo transform, muy liviano) */}
      <div className="hilo" aria-hidden="true"><span /></div>

      <header className={`barra ${barraOculta ? 'oculta' : ''}`}>
        <a href="#inicio" className="barra-logo" aria-label={`${MARCA.nombre}, inicio`}>
          <Logo tamano={44} radio={22} />
        </a>
        <nav className="barra-nav" aria-label="Secciones">
          <a href="#agenda">{menu.agenda}</a>
          <a href="#marca">{menu.experiencias}</a>
          <a href="#rediseno">Rediseño</a>
          <a href="#reservar">{menu.reservar}</a>
        </nav>
        <button ref={botonPedido} type="button" className="barra-pedido" onClick={() => setCarritoAbierto(true)}>
          Tu pedido
          <span className={`barra-contador ${cantidadTotal ? 'lleno' : ''}`} aria-label={`${cantidadTotal} piezas`}>{cantidadTotal}</span>
        </button>
      </header>

      <main>
        {/* ── Portada ── */}
        <section id="inicio" className="portada">
          <div className="portada-texto envoltura">
            <p className="portada-marca entra" style={{ '--d': '0ms' }}>
              <span className="portada-palabra">{MARCA.nombre}</span>
              <span className="portada-fonetica">{MARCA.pronunciacion}</span>
            </p>
            <TituloCinetico lineas={PORTADA.titulo} />
            <p className="portada-bajada entra" style={{ '--d': '900ms' }}>{PORTADA.bajada}</p>
            <div className="portada-acciones entra" style={{ '--d': '1050ms' }}>
              <a href="#agenda" className="boton-grande">{PORTADA.botonPrincipal}<span aria-hidden="true">↓</span></a>
              <a href="#rediseno" className="enlace-subrayado">{PORTADA.botonSecundario}</a>
            </div>
          </div>
          <figure className="portada-figura entra" style={{ '--d': '300ms' }}>
            <img
              src={fotoPortada}
              srcSet={`${fotoPortadaChica} 480w, ${fotoPortada} 880w`}
              sizes="(max-width: 1000px) 80vw, 40vw"
              alt="Collar de turquesas hecho a mano, puesto sobre una camisa de lino"
              width="880"
              height="1100"
              fetchPriority="high"
              decoding="async"
            />
            <svg className="portada-sello" viewBox="0 0 200 200" aria-hidden="true">
              <defs>
                <path id="circulo-sello" d="M100 100 m-74 0 a74 74 0 1 1 148 0 a74 74 0 1 1 -148 0" />
              </defs>
              <circle cx="100" cy="100" r="100" />
              <text>
                <textPath href="#circulo-sello" textLength="452" lengthAdjust="spacing">pieza única · hecho a mano en Mendoza · </textPath>
              </text>
              <text x="100" y="114" textAnchor="middle" className="portada-sello-centro">Sd</text>
            </svg>
          </figure>
          <ul className="portada-sellos entra" style={{ '--d': '1300ms' }} aria-label="Lo que define a sdisegno">
            {PORTADA.pastillas.map((p) => <li key={p}>{p}</li>)}
            <li>{MARCA.ciudad}</li>
          </ul>
        </section>

        {/* ── Ventana al taller: el video se abre con el scroll ── */}
        <section className="ventana" aria-labelledby="ventana-titulo">
          <div className="ventana-fija">
            <div className="ventana-marco">
              <VideoFondo src="/media/hero.mp4" poster="/media/hero-poster.webp" className="ventana-video" />
            </div>
            <div className="ventana-texto envoltura">
              <p className="rotulo rotulo-claro">{VENTANA.etiqueta}</p>
              <h2 id="ventana-titulo" className="ventana-titulo">{VENTANA.titulo}</h2>
              <p>{VENTANA.texto}</p>
            </div>
          </div>
        </section>

        {/* ── Manifiesto: las palabras se tiñen al leer ── */}
        <section id="marca" className="manifiesto envoltura">
          <p className="rotulo">{SECCIONES.experiencias.etiqueta}</p>
          <p className="manifiesto-texto">
            {palabras.map((p, i) => <span key={i} className="tinta" style={{ '--i': i }}>{p} </span>)}
          </p>
        </section>

        {/* ── Colección ── */}
        <Coleccion
          productos={productos}
          cargando={cargando}
          error={errorCarga}
          enCarrito={enCarrito}
          onAgregar={agregar}
          onVer={verPieza}
          detalleId={detalle?.id}
        />

        {/* ── Pilares: tarjetas que se apilan ── */}
        <section className="pilares envoltura" aria-labelledby="pilares-titulo">
          <header className="pilares-cabecera aparece">
            <p className="rotulo">Cuatro razones</p>
            <h2 id="pilares-titulo" className="titulo-seccion">{SECCIONES.experiencias.titulo}</h2>
          </header>
          <ol className="pilares-pila">
            {FORMATOS.map((f, i) => (
              <li key={f.id} className={`pilar ${f.destacado ? 'pilar-lima' : ''}`} style={{ '--n': i }}>
                <div className="pilar-texto">
                  <span className="pilar-numero">{String(i + 1).padStart(2, '0')}</span>
                  <h3>{f.nombre}</h3>
                  <p>{f.texto}</p>
                </div>
                <div className="pilar-foto">
                  <img src={f.imagen} alt={f.alt} loading="lazy" decoding="async" width="1600" height="912" />
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* ── Rediseño ── */}
        <section id="rediseno" className="rediseno" aria-labelledby="rediseno-titulo">
          <div className="envoltura rediseno-grilla">
            <div className="rediseno-texto aparece">
              <p className="rotulo rotulo-lima">{DESTACADO.etiqueta}</p>
              <h2 id="rediseno-titulo" className="rediseno-titulo">Segunda<br /><em>vida.</em></h2>
              <p className="rediseno-bajada">{DESTACADO.texto}</p>
              <ol className="rediseno-pasos">
                {PASOS_REDISENO.map((p) => (
                  <li key={p.numero}>
                    <span>{p.numero}</span>
                    <div>
                      <h3>{p.titulo}</h3>
                      <p>{p.texto}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <a href="#reservar" className="boton-grande boton-lima">{DESTACADO.boton}</a>
            </div>
            <div className="rediseno-arco">
              <VideoFondo src={DESTACADO.video} poster={DESTACADO.poster} className="rediseno-video" />
            </div>
          </div>
        </section>

        {/* ── Cinta de frases ── */}
        <section className="cinta" aria-label="Frases de marca">
          <div className="cinta-pista" aria-hidden="true">
            {[...FRASES, ...FRASES].map((f, n) => (
              <span key={n}>{f}<i className="cinta-cuenta" /></span>
            ))}
          </div>
          <p className="sr-only">{FRASES.join('. ')}</p>
        </section>

        {/* ── Cómo comprar ── */}
        <section id="lugares" className="comprar envoltura" aria-labelledby="comprar-titulo">
          <header className="aparece">
            <p className="rotulo">{SECCIONES.lugares.etiqueta}</p>
            <h2 id="comprar-titulo" className="titulo-seccion">{SECCIONES.lugares.titulo}</h2>
          </header>
          <ul className="comprar-lista">
            {LUGARES.map((l, i) => (
              <li key={l.id} className={`comprar-item tono-${l.tono} aparece`} style={{ '--n': i }}>
                <span className="comprar-cuenta" aria-hidden="true" />
                <h3>{l.nombre}</h3>
                <p>{l.texto}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* ── Historia ── */}
        <section className="historia envoltura" aria-labelledby="historia-titulo">
          <figure className="historia-foto">
            <img src={EQUIPO.foto} alt={EQUIPO.alt} loading="lazy" decoding="async" width="1600" height="912" />
          </figure>
          <div className="historia-texto">
            <p className="rotulo">{SECCIONES.historia.etiqueta}</p>
            <h2 id="historia-titulo" className="historia-entrada">
              Sol <span>/sol/</span>
            </h2>
            <p className="historia-tipo">s. diseñadora industrial. Mendoza.</p>
            <ol className="historia-acepciones">
              {EQUIPO.promesas.map((p) => (
                <li key={p.titulo} className="aparece">
                  <strong>{p.titulo}.</strong> {p.texto}
                </li>
              ))}
            </ol>
          </div>
        </section>

        <Reserva whatsapp={whatsapp} />
      </main>

      <footer className="pie">
        <div className="envoltura pie-fila">
          <p>{MARCA.firma} {MARCA.ciudad}.</p>
          <a href={MARCA.instagram.url} target="_blank" rel="noreferrer" className="enlace-subrayado">
            <Icono nombre="instagram" tamano={18} /> {MARCA.instagram.usuario}
          </a>
        </div>
        <p className="pie-marca" aria-hidden="true">
          {MARCA.nombre.split('').map((letra, i) => <span key={i} style={{ '--n': i }}>{letra}</span>)}
        </p>
      </footer>

      {detalle && (
        <Detalle
          pieza={detalle}
          numero={productos.findIndex((p) => p.id === detalle.id) + 1}
          enCarrito={enCarrito}
          onAgregar={agregar}
          onCerrar={cerrarDetalle}
        />
      )}

      <Carrito
        abierto={carritoAbierto}
        onCerrar={cerrarCarrito}
        items={items}
        productos={productos}
        whatsapp={whatsapp}
        onCantidad={cambiarCantidad}
        onVaciar={() => setItems([])}
      />
    </>
  )
}
