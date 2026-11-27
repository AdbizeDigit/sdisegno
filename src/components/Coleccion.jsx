import { useState } from 'react'
import { TIPOS_PIEZA, SECCIONES } from '../marca.js'
import { precio } from '../api.js'

const textos = SECCIONES.agenda
const nombreTipo = (id) => TIPOS_PIEZA.find((t) => t.id === id)?.nombre ?? 'Otros'
export const numeroPieza = (n) => `N.º ${String(n).padStart(2, '0')}`

// Galería horizontal: en pantallas grandes se desliza con el scroll vertical (CSS puro).
export default function Coleccion({ productos, cargando, error, enCarrito, onAgregar, onVer, detalleId }) {
  const [filtro, setFiltro] = useState('todas')
  const tipos = TIPOS_PIEZA.filter((t) => productos.some((p) => p.tipo === t.id))
  const visibles = (filtro === 'todas' ? productos : productos.filter((p) => p.tipo === filtro)).map((p) => ({
    ...p,
    numero: productos.indexOf(p) + 1,
  }))

  return (
    <section id="agenda" className="coleccion" style={{ '--piezas': Math.max(visibles.length, 1) }}>
      <div className="coleccion-fija">
        <header className="coleccion-cabecera envoltura">
          <div>
            <p className="rotulo">{textos.etiqueta}</p>
            <h2 className="titulo-seccion">{textos.titulo}</h2>
          </div>
          <div className="coleccion-lado">
            <p className="coleccion-bajada">{textos.bajada}</p>
            {tipos.length > 1 && (
              <div className="chips" role="group" aria-label="Filtrar por tipo de pieza">
                {[{ id: 'todas', nombre: 'Todas' }, ...tipos].map((t) => (
                  <button key={t.id} className={filtro === t.id ? 'activo' : ''} aria-pressed={filtro === t.id} onClick={() => setFiltro(t.id)}>
                    {t.nombre}
                  </button>
                ))}
              </div>
            )}
          </div>
        </header>

        {cargando && <p className="nota-estado envoltura">Cargando piezas…</p>}
        {error && <p className="nota-estado envoltura">No se pudieron cargar las piezas. Probá de nuevo en un rato.</p>}
        {!cargando && !error && visibles.length === 0 && <p className="nota-estado envoltura">{textos.vacio}</p>}

        <div className="coleccion-ventana">
          <ol className="coleccion-pista">
            {visibles.map((pieza) => {
              const agotada = pieza.stock < 1
              const cantidad = enCarrito(pieza.id)
              const lleno = cantidad >= pieza.stock
              return (
                <li key={pieza.id} className={`ficha ${agotada ? 'agotada' : ''}`}>
                  <button type="button" className="ficha-foto" onClick={() => onVer(pieza)} aria-label={`Ver ${pieza.nombre}`}>
                    {pieza.imagen ? (
                      <img src={pieza.imagen} alt="" loading="lazy" decoding="async" style={{ viewTransitionName: detalleId === pieza.id ? 'none' : `foto-${pieza.id}` }} />
                    ) : (
                      <span className="ficha-sin-foto">sdisegno</span>
                    )}
                    <span className="ficha-numero">{numeroPieza(pieza.numero)}</span>
                    {agotada && <span className="ficha-sello">Vendida</span>}
                    <span className="ficha-ver">Ver pieza</span>
                  </button>
                  <div className="ficha-cuerpo">
                    <p className="ficha-tipo">{nombreTipo(pieza.tipo)}</p>
                    <h3 className="ficha-nombre">{pieza.nombre}</h3>
                    {pieza.materiales && <p className="ficha-materiales">{pieza.materiales}</p>}
                    <div className="ficha-pie">
                      <span className="ficha-precio">{precio(pieza.precio)}</span>
                      <button
                        type="button"
                        className="boton-cuenta"
                        disabled={agotada || lleno}
                        onClick={(e) => onAgregar(pieza, e.currentTarget)}
                        aria-label={agotada ? `${pieza.nombre} vendida` : `Agregar ${pieza.nombre} al pedido`}
                      >
                        {agotada ? 'Vendida' : lleno ? 'En tu pedido' : cantidad > 0 ? `+ otra (${cantidad})` : textos.boton}
                      </button>
                    </div>
                  </div>
                </li>
              )
            })}
          </ol>
        </div>
        <div className="coleccion-progreso envoltura" aria-hidden="true"><span /></div>
      </div>
    </section>
  )
}
