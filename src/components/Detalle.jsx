import { useEffect, useRef } from 'react'
import { TIPOS_PIEZA } from '../marca.js'
import { precio } from '../api.js'
import { numeroPieza } from './Coleccion.jsx'

const nombreTipo = (id) => TIPOS_PIEZA.find((t) => t.id === id)?.nombre ?? 'Otros'

// Ficha completa de una pieza. La foto viaja desde la galería con View Transitions.
export default function Detalle({ pieza, numero, enCarrito, onAgregar, onCerrar }) {
  const cerrarRef = useRef(null)

  useEffect(() => {
    cerrarRef.current?.focus()
    const alTeclear = (e) => e.key === 'Escape' && onCerrar()
    window.addEventListener('keydown', alTeclear)
    document.documentElement.classList.add('sin-scroll')
    return () => {
      window.removeEventListener('keydown', alTeclear)
      document.documentElement.classList.remove('sin-scroll')
    }
  }, [onCerrar])

  const agotada = pieza.stock < 1
  const cantidad = enCarrito(pieza.id)
  const lleno = cantidad >= pieza.stock

  return (
    <div className="detalle-fondo" onClick={onCerrar}>
      <article className="detalle" role="dialog" aria-modal="true" aria-labelledby="detalle-nombre" onClick={(e) => e.stopPropagation()}>
        <div className="detalle-foto">
          {pieza.imagen && <img src={pieza.imagen} alt={pieza.nombre} style={{ viewTransitionName: `foto-${pieza.id}` }} />}
        </div>
        <div className="detalle-texto">
          <button ref={cerrarRef} type="button" className="detalle-cerrar" onClick={onCerrar} aria-label="Cerrar">×</button>
          <p className="rotulo">{nombreTipo(pieza.tipo)} · {numeroPieza(numero)}</p>
          <h2 id="detalle-nombre" className="detalle-nombre">{pieza.nombre}</h2>
          <p className="detalle-pronuncia">s. pieza única</p>
          {pieza.descripcion && <p className="detalle-descripcion">{pieza.descripcion}</p>}
          <dl className="detalle-datos">
            {pieza.materiales && <div><dt>Materiales</dt><dd>{pieza.materiales}</dd></div>}
            {pieza.medida && <div><dt>Medida</dt><dd>{pieza.medida}</dd></div>}
            <div><dt>Valor</dt><dd>{precio(pieza.precio)}</dd></div>
            <div><dt>Disponibles</dt><dd>{agotada ? 'Vendida' : pieza.stock === 1 ? 'Única' : pieza.stock}</dd></div>
          </dl>
          <button
            type="button"
            className="boton-grande"
            disabled={agotada || lleno}
            onClick={(e) => onAgregar(pieza, e.currentTarget)}
          >
            {agotada ? 'Vendida' : lleno ? 'Ya está en tu pedido' : 'Agregar al pedido'}
          </button>
        </div>
      </article>
    </div>
  )
}
