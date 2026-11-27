import { useEffect, useRef, useState } from 'react'
import Icono from './Icono.jsx'
import { api, precio, enlaceWhatsapp } from '../api.js'

function armarMensaje(pedido) {
  const lineas = [
    `¡Hola Sol! Soy ${pedido.nombre}. Te hago el pedido N.º ${pedido.numero} desde la web:`,
    '',
    ...pedido.items.map((i) => `• ${i.cantidad} × ${i.nombre}${i.precio > 0 ? ` (${precio(i.precio)})` : ''}`),
    '',
    `Total: ${pedido.total > 0 ? precio(pedido.total) : 'a confirmar'}`,
    `Entrega: ${pedido.entrega === 'retiro' ? 'retiro' : 'envío en Mendoza'}`,
  ]
  if (pedido.nota) lineas.push(`Nota: ${pedido.nota}`)
  return lineas.join('\n')
}

export default function Carrito({ abierto, onCerrar, items, productos, whatsapp, onCantidad, onVaciar }) {
  const [nombre, setNombre] = useState('')
  const [entrega, setEntrega] = useState('envio')
  const [nota, setNota] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')
  const [listo, setListo] = useState(null)
  const panel = useRef(null)

  useEffect(() => {
    if (!abierto) return
    panel.current?.focus()
    const alTeclear = (e) => e.key === 'Escape' && onCerrar()
    window.addEventListener('keydown', alTeclear)
    return () => window.removeEventListener('keydown', alTeclear)
  }, [abierto, onCerrar])

  const lineas = items
    .map((i) => ({ ...i, producto: productos.find((p) => p.id === i.id) }))
    .filter((l) => l.producto)
  const total = lineas.reduce((s, l) => s + l.producto.precio * l.cantidad, 0)
  const hayPrecioAConsultar = lineas.some((l) => !(l.producto.precio > 0))

  async function enviar(e) {
    e.preventDefault()
    setError('')
    if (!nombre.trim()) return setError('Contame tu nombre para el pedido.')
    // Se abre la pestaña antes de esperar al servidor para que el navegador no la bloquee.
    const pestana = whatsapp ? window.open('', '_blank') : null
    setEnviando(true)
    try {
      const pedido = await api.crearPedido({
        nombre: nombre.trim(),
        entrega,
        nota: nota.trim(),
        items: lineas.map((l) => ({ id: l.id, cantidad: l.cantidad })),
      })
      const mensaje = armarMensaje(pedido)
      const enlace = enlaceWhatsapp(whatsapp, mensaje)
      if (pestana && enlace) pestana.location.href = enlace
      setListo({ numero: pedido.numero, mensaje, enlace })
      onVaciar()
    } catch (err) {
      pestana?.close()
      setError(err.message)
    } finally {
      setEnviando(false)
    }
  }

  function cerrar() {
    setListo(null)
    onCerrar()
  }

  return (
    <div className={`carrito-fondo ${abierto ? 'abierto' : ''}`} onClick={cerrar} aria-hidden={!abierto}>
      <aside
        ref={panel}
        className="carrito"
        role="dialog"
        aria-modal="true"
        aria-labelledby="carrito-titulo"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="carrito-cabecera">
          <h2 id="carrito-titulo">Tu pedido</h2>
          <button type="button" className="carrito-cerrar" onClick={cerrar} aria-label="Cerrar pedido">×</button>
        </div>

        {listo ? (
          <div className="carrito-listo">
            <p className="etiqueta">Pedido N.º {listo.numero}</p>
            <h3>¡Listo! Ya está registrado.</h3>
            {listo.enlace ? (
              <>
                <p>Se abrió WhatsApp con el detalle. Si no se abrió, tocá el botón.</p>
                <a className="boton boton-ancho" href={listo.enlace} target="_blank" rel="noreferrer">
                  <Icono nombre="whatsapp" tamano={22} /> Abrir WhatsApp
                </a>
              </>
            ) : (
              <>
                <p>Copiá este mensaje y mandámelo por Instagram:</p>
                <pre className="carrito-mensaje">{listo.mensaje}</pre>
              </>
            )}
          </div>
        ) : lineas.length === 0 ? (
          <p className="carrito-vacio">Todavía no elegiste ninguna pieza.</p>
        ) : (
          <form className="carrito-cuerpo" onSubmit={enviar}>
            <ul className="carrito-lista">
              {lineas.map((l) => (
                <li key={l.id}>
                  {l.producto.imagen && <img src={l.producto.imagen} alt="" width="64" height="64" />}
                  <div>
                    <p className="carrito-nombre">{l.producto.nombre}</p>
                    <p className="carrito-precio">{precio(l.producto.precio)}</p>
                  </div>
                  <div className="contador contador-chico">
                    <button type="button" onClick={() => onCantidad(l.id, l.cantidad - 1)} aria-label={`Quitar una ${l.producto.nombre}`}>−</button>
                    <output>{l.cantidad}</output>
                    <button type="button" disabled={l.cantidad >= l.producto.stock} onClick={() => onCantidad(l.id, l.cantidad + 1)} aria-label={`Sumar una ${l.producto.nombre}`}>+</button>
                  </div>
                </li>
              ))}
            </ul>

            <p className="carrito-total">
              <span>Total</span>
              <strong>{total > 0 ? precio(total) : 'A confirmar'}</strong>
            </p>
            {hayPrecioAConsultar && total > 0 && <p className="aviso-chico">Hay piezas con precio a consultar: te confirmo el total por WhatsApp.</p>}

            <label className="campo">
              Tu nombre
              <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Cómo te llamás" autoComplete="given-name" maxLength={60} />
            </label>

            <fieldset>
              <legend>Entrega</legend>
              <div className="opciones">
                {[['envio', 'Envío en Mendoza'], ['retiro', 'Retiro']].map(([id, texto]) => (
                  <label key={id} className={entrega === id ? 'opcion activa' : 'opcion'}>
                    <input type="radio" name="entrega" value={id} checked={entrega === id} onChange={() => setEntrega(id)} />
                    {texto}
                  </label>
                ))}
              </div>
            </fieldset>

            <label className="campo">
              Nota (opcional)
              <input value={nota} onChange={(e) => setNota(e.target.value)} placeholder="Es para regalo, barrio de envío…" maxLength={300} />
            </label>

            {error && <p className="error" role="alert">{error}</p>}

            <button className="boton boton-ancho" disabled={enviando}>
              <Icono nombre="whatsapp" tamano={22} /> {enviando ? 'Enviando…' : 'Pedir por WhatsApp'}
            </button>
            {!whatsapp && <p className="aviso-chico">Falta cargar el número de WhatsApp en el panel de administración.</p>}
          </form>
        )}
      </aside>
    </div>
  )
}
