import { useState } from 'react'
import { TIPOS_PIEZA, SECCIONES, IMAGEN_CAPSULA } from '../marca.js'
import { precio } from '../api.js'
import Reveal from './Reveal.jsx'

const textos = SECCIONES.agenda
const nombreTipo = (id) => TIPOS_PIEZA.find((t) => t.id === id)?.nombre ?? 'Otros'

export default function Capsula({ productos, cargando, error, enCarrito, onAgregar }) {
  const [filtro, setFiltro] = useState('todas')
  const visibles = filtro === 'todas' ? productos : productos.filter((p) => p.tipo === filtro)
  const tipos = TIPOS_PIEZA.filter((t) => productos.some((p) => p.tipo === t.id))

  return (
    <section id="agenda" className="seccion">
      <div className="contenedor">
        <div className="capsula-cabecera">
          <Reveal>
            <p className="etiqueta">{textos.etiqueta}</p>
            <h2>{textos.titulo}</h2>
            <p className="seccion-bajada">{textos.bajada}</p>
          </Reveal>
          <Reveal className="capsula-foto" delay={120}>
            <img src={IMAGEN_CAPSULA.src} alt={IMAGEN_CAPSULA.alt} loading="lazy" width="1600" height="900" />
          </Reveal>
        </div>

        {tipos.length > 1 && (
          <div className="filtros" role="group" aria-label="Filtrar por tipo de pieza">
            <button className={filtro === 'todas' ? 'activo' : ''} aria-pressed={filtro === 'todas'} onClick={() => setFiltro('todas')}>
              Todas
            </button>
            {tipos.map((t) => (
              <button key={t.id} className={filtro === t.id ? 'activo' : ''} aria-pressed={filtro === t.id} onClick={() => setFiltro(t.id)}>
                {t.nombre}
              </button>
            ))}
          </div>
        )}

        {cargando && <p className="vacio">Cargando piezas…</p>}
        {error && <p className="vacio">No se pudieron cargar las piezas. Probá de nuevo en un rato.</p>}

        <div className="fechas piezas">
          {visibles.map((pieza) => {
            const agotada = pieza.stock < 1
            const cantidad = enCarrito(pieza.id)
            const lleno = cantidad >= pieza.stock
            return (
              <article key={`${filtro}-${pieza.id}`} className={`fecha pieza entra ${agotada ? 'agotada' : ''}`}>
                {pieza.imagen && (
                  <div className="pieza-foto">
                    <img src={pieza.imagen} alt={pieza.nombre} loading="lazy" />
                    {agotada && <span className="pieza-sello">Vendida</span>}
                  </div>
                )}
                <div className="fecha-titulo">
                  <span className="fecha-lugar">{nombreTipo(pieza.tipo)}</span>
                  <h3>{pieza.nombre}</h3>
                </div>
                {pieza.descripcion && <p className="fecha-texto">{pieza.descripcion}</p>}
                <dl className="fecha-datos">
                  {pieza.materiales && <div><dt>Materiales</dt><dd>{pieza.materiales}</dd></div>}
                  {pieza.medida && <div><dt>Medida</dt><dd>{pieza.medida}</dd></div>}
                  <div><dt>Valor</dt><dd>{precio(pieza.precio)}</dd></div>
                </dl>
                <button className="boton" disabled={agotada || lleno} onClick={() => onAgregar(pieza)}>
                  {agotada ? 'Vendida' : cantidad > 0 ? (lleno ? 'En tu pedido' : `En tu pedido (${cantidad}) · sumar otra`) : textos.boton}
                </button>
              </article>
            )
          })}
          {!cargando && !error && visibles.length === 0 && <p className="vacio">{textos.vacio}</p>}
        </div>
      </div>
    </section>
  )
}
