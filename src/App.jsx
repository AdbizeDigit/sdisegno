import { useCallback, useEffect, useState } from 'react'
import Icono from './components/Icono.jsx'
import Logo from './components/Logo.jsx'
import Capsula from './components/Capsula.jsx'
import Reserva from './components/Reserva.jsx'
import Carrito from './components/Carrito.jsx'
import { api } from './api.js'
import Reveal from './components/Reveal.jsx'
import VideoFondo from './components/VideoFondo.jsx'
import { MARCA, PORTADA, SECCIONES, FORMATOS, DESTACADO, LUGARES, EQUIPO, FRASES } from './marca.js'
import './App.css'

// Título con palabras que suben una tras otra.
function TituloAnimado({ lineas }) {
  let i = 0
  return (
    <h1 className="titulo-animado" aria-label={lineas.join(' ')}>
      {lineas.map((linea, l) => (
        <span key={l} className="linea" aria-hidden="true">
          {linea.split(' ').map((palabra, p) => (
            <span key={p} className="palabra" style={{ animationDelay: `${150 + i++ * 110}ms` }}>
              {palabra}
            </span>
          ))}
        </span>
      ))}
    </h1>
  )
}

// El pedido en curso se recuerda en este navegador (si se puede).
function leerPedidoGuardado() {
  try {
    const guardado = JSON.parse(localStorage.getItem('sd_pedido') || '[]')
    return Array.isArray(guardado) ? guardado : []
  } catch {
    return []
  }
}

export default function App() {
  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [errorCarga, setErrorCarga] = useState(false)
  const [whatsapp, setWhatsapp] = useState('')
  const [items, setItems] = useState(leerPedidoGuardado)
  const [carritoAbierto, setCarritoAbierto] = useState(false)
  const menu = SECCIONES.menu
  const exp = SECCIONES.experiencias

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

  // Descarta del pedido las piezas que ya no están publicadas.
  useEffect(() => {
    if (!cargando && !errorCarga) setItems((actual) => actual.filter((i) => productos.some((p) => p.id === i.id)))
  }, [cargando, errorCarga, productos])

  const enCarrito = (id) => items.find((i) => i.id === id)?.cantidad ?? 0
  const cantidadTotal = items.reduce((s, i) => s + i.cantidad, 0)

  function agregar(pieza) {
    setItems((actual) => {
      const existe = actual.find((i) => i.id === pieza.id)
      if (existe) return actual.map((i) => (i.id === pieza.id ? { ...i, cantidad: Math.min(pieza.stock, i.cantidad + 1) } : i))
      return [...actual, { id: pieza.id, cantidad: 1 }]
    })
    setCarritoAbierto(true)
  }

  function cambiarCantidad(id, cantidad) {
    setItems((actual) => (cantidad < 1 ? actual.filter((i) => i.id !== id) : actual.map((i) => (i.id === id ? { ...i, cantidad } : i))))
  }

  const cerrarCarrito = useCallback(() => setCarritoAbierto(false), [])

  return (
    <>
      <header className="barra">
        <div className="contenedor barra-interior">
          <a href="#inicio" className="barra-logo" aria-label={`${MARCA.nombre}, inicio`}>
            <Logo tamano={52} radio={26} />
          </a>
          <nav className="barra-nav" aria-label="Secciones">
            <a href="#agenda">{menu.agenda}</a>
            <a href="#experiencias">{menu.experiencias}</a>
            <a href="#lugares">{menu.lugares}</a>
            <a href="#reservar">{menu.reservar}</a>
          </nav>
          <button type="button" className="boton boton-chico" onClick={() => setCarritoAbierto(true)}>
            Tu pedido{cantidadTotal > 0 && <span className="burbuja" aria-label={`${cantidadTotal} piezas`}>{cantidadTotal}</span>}
          </button>
        </div>
      </header>

      <main>
        <section id="inicio" className="hero">
          <VideoFondo src="/media/hero.mp4" poster="/media/hero-poster.webp" className="hero-video" />
          <div className="hero-velo" aria-hidden="true" />
          <div className="contenedor hero-grilla">
            <div className="hero-texto">
              <p className="hero-marca aparece">{MARCA.nombre} <span className="hero-pronuncia">{MARCA.pronunciacion}</span></p>
              <TituloAnimado lineas={PORTADA.titulo} />
              <svg className="subrayado" viewBox="0 0 320 24" aria-hidden="true">
                <path d="M4 16c40-10 90-12 140-8s110 6 172-4" />
              </svg>
              <p className="hero-bajada aparece" style={{ animationDelay: '900ms' }}>{PORTADA.bajada}</p>
              <div className="hero-acciones aparece" style={{ animationDelay: '1050ms' }}>
                <a href="#agenda" className="boton boton-acento">{PORTADA.botonPrincipal}</a>
                <a href="#reservar" className="boton boton-borde">{PORTADA.botonSecundario}</a>
              </div>
              <ul className="pastillas aparece" style={{ animationDelay: '1200ms' }} aria-label="Lo que combinamos">
                {PORTADA.pastillas.map((p) => <li key={p}>{p}</li>)}
                <li className="destacada">{MARCA.ciudad}</li>
              </ul>
            </div>
            <div className="hero-tarjeta aparece" style={{ animationDelay: '600ms' }}>
              <p className="diccionario-palabra">
                {PORTADA.diccionario.palabra} <span>{PORTADA.diccionario.pronunciacion}</span>
              </p>
              <p className="diccionario-tipo">{PORTADA.diccionario.tipo}</p>
              <p className="hero-frase">{PORTADA.diccionario.definicion}</p>
              <p className="diccionario-firma">Hecho a mano por Sol · {MARCA.ciudad}</p>
            </div>
          </div>
          <svg className="onda" viewBox="0 0 1440 60" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0 30c120-30 240-30 360 0s240 30 360 0 240-30 360 0 240 30 360 0v30H0Z" />
          </svg>
        </section>

        <Capsula productos={productos} cargando={cargando} error={errorCarga} enCarrito={enCarrito} onAgregar={agregar} />

        <section id="experiencias" className="seccion">
          <div className="contenedor">
            <Reveal>
              <p className="etiqueta">{exp.etiqueta}</p>
              <h2>{exp.titulo}</h2>
              <p className="seccion-bajada">{exp.bajada}</p>
            </Reveal>
            <div className="formatos">
              {FORMATOS.map((f, n) => (
                <Reveal as="article" key={f.id} delay={n * 120} className={`formato ${f.destacado ? 'formato-destacado' : ''}`}>
                  <div className="formato-foto">
                    <img src={f.imagen} alt={f.alt} loading="lazy" width="1000" height="750" />
                  </div>
                  <div className="formato-cuerpo">
                    <Icono nombre={f.icono} tamano={30} />
                    <h3>{f.nombre}</h3>
                    <p>{f.texto}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="destacado-banda" aria-labelledby="destacado-titulo">
          <VideoFondo src={DESTACADO.video} poster={DESTACADO.poster} className="destacado-video" />
          <div className="destacado-velo" aria-hidden="true" />
          <div className="contenedor destacado-contenido">
            <Reveal>
              <p className="destacado-etiqueta">{DESTACADO.etiqueta}</p>
              <h2 id="destacado-titulo" className="destacado-titulo">{DESTACADO.titulo}</h2>
              <p className="destacado-texto">{DESTACADO.texto}</p>
              <a href="#reservar" className="boton boton-destacado">{DESTACADO.boton}</a>
            </Reveal>
          </div>
        </section>

        <section id="lugares" className="seccion seccion-blanca">
          <div className="contenedor">
            <Reveal>
              <p className="etiqueta">{SECCIONES.lugares.etiqueta}</p>
              <h2>{SECCIONES.lugares.titulo}</h2>
            </Reveal>
            <div className="lugares">
              {LUGARES.map((l, n) => (
                <Reveal as="article" key={l.id} delay={n * 90} className={`lugar tono-${l.tono}`}>
                  <h3>{l.nombre}</h3>
                  <p>{l.texto}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="seccion">
          <div className="contenedor nosotras">
            <Reveal className="nosotras-foto">
              <img src={EQUIPO.foto} alt={EQUIPO.alt} loading="lazy" width="1920" height="1095" />
            </Reveal>
            <div className="promesas">
              <p className="etiqueta promesas-etiqueta">{SECCIONES.historia.etiqueta}</p>
              {EQUIPO.promesas.map((p, n) => (
                <Reveal key={p.titulo} delay={n * 100}>
                  <h3>{p.titulo}</h3>
                  <p>{p.texto}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="cinta" aria-label="Frases de marca">
          <div className="cinta-pista" aria-hidden="true">
            {[...FRASES, ...FRASES].map((f, n) => (
              <span key={n}>
                {f} <Icono nombre="destello" tamano={26} />
              </span>
            ))}
          </div>
          <p className="sr-only">{FRASES.join('. ')}</p>
        </section>

        <Reserva whatsapp={whatsapp} />
      </main>

      <footer className="pie">
        <div className="contenedor pie-interior">
          <Logo tamano={96} radio={48} conTexto className="pie-logo" />
          <p>{MARCA.firma} {MARCA.ciudad}.</p>
          <a href={MARCA.instagram.url} target="_blank" rel="noreferrer" className="pie-ig">
            <Icono nombre="instagram" tamano={22} /> {MARCA.instagram.usuario}
          </a>
        </div>
      </footer>

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
