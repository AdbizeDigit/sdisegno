import { useEffect, useState } from 'react'
import Logo from '../components/Logo.jsx'
import { TIPOS_PIEZA } from '../marca.js'
import { api, precio } from '../api.js'
import './admin.css'

const VACIO = { nombre: '', tipo: 'collares', descripcion: '', materiales: '', medida: '', precio: '', stock: 1, imagen: '', activo: true }
const ESTADOS = [
  { id: 'nuevo', nombre: 'Nuevo' },
  { id: 'confirmado', nombre: 'Confirmado' },
  { id: 'entregado', nombre: 'Entregado' },
  { id: 'cancelado', nombre: 'Cancelado' },
]
const nombreTipo = (id) => TIPOS_PIEZA.find((t) => t.id === id)?.nombre ?? 'Otros'
const fecha = (iso) => new Date(iso).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })

// ── Entrar ───────────────────────────────────────────────────
function Entrar({ onEntrar }) {
  const [clave, setClave] = useState('')
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function enviar(e) {
    e.preventDefault()
    setEnviando(true)
    setError('')
    try {
      await api.entrar(clave)
      onEntrar()
    } catch (err) {
      setError(err.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <main className="adm-entrar">
      <form className="adm-tarjeta" onSubmit={enviar}>
        <Logo tamano={72} radio={36} />
        <h1>Panel de sdisegno</h1>
        <label className="adm-campo">
          Contraseña
          <input type="password" value={clave} onChange={(e) => setClave(e.target.value)} autoComplete="current-password" autoFocus />
        </label>
        {error && <p className="adm-error" role="alert">{error}</p>}
        <button className="adm-boton" disabled={enviando || !clave}>{enviando ? 'Entrando…' : 'Entrar'}</button>
      </form>
    </main>
  )
}

// Achica la foto en el navegador antes de subirla (máx. 1600 px, WebP) para ocupar poco espacio.
async function achicarFoto(archivo, lado = 1600) {
  try {
    const imagen = await createImageBitmap(archivo)
    const escala = Math.min(1, lado / Math.max(imagen.width, imagen.height))
    const lienzo = document.createElement('canvas')
    lienzo.width = Math.round(imagen.width * escala)
    lienzo.height = Math.round(imagen.height * escala)
    lienzo.getContext('2d').drawImage(imagen, 0, 0, lienzo.width, lienzo.height)
    const blob = await new Promise((r) => lienzo.toBlob(r, 'image/webp', 0.82))
    if (!blob || blob.type !== 'image/webp' || blob.size >= archivo.size) return archivo
    return new File([blob], archivo.name.replace(/\.\w+$/, '') + '.webp', { type: 'image/webp' })
  } catch {
    return archivo
  }
}

// ── Formulario de pieza ──────────────────────────────────────
function FormularioPieza({ inicial, onGuardado, onCancelar }) {
  const [pieza, setPieza] = useState(inicial)
  const [subiendo, setSubiendo] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const cambiar = (campo) => (e) => setPieza({ ...pieza, [campo]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })

  useEffect(() => {
    const alTeclear = (e) => e.key === 'Escape' && onCancelar()
    window.addEventListener('keydown', alTeclear)
    return () => window.removeEventListener('keydown', alTeclear)
  }, [onCancelar])

  async function subir(e) {
    const archivo = e.target.files?.[0]
    if (!archivo) return
    setSubiendo(true)
    setError('')
    try {
      const { imagen } = await api.subirFoto(await achicarFoto(archivo))
      setPieza((p) => ({ ...p, imagen }))
    } catch (err) {
      setError(err.message)
    } finally {
      setSubiendo(false)
      e.target.value = ''
    }
  }

  async function guardar(e) {
    e.preventDefault()
    if (!pieza.nombre.trim()) return setError('Poné un nombre a la pieza.')
    setGuardando(true)
    setError('')
    try {
      const datos = { ...pieza, precio: Number(pieza.precio) || 0, stock: Number(pieza.stock) || 0 }
      const guardada = pieza.id ? await api.editarProducto(pieza.id, datos) : await api.crearProducto(datos)
      onGuardado(guardada)
    } catch (err) {
      setError(err.message)
      setGuardando(false)
    }
  }

  return (
    <div className="adm-modal-fondo" onClick={onCancelar}>
      <form className="adm-modal" onSubmit={guardar} onClick={(e) => e.stopPropagation()} aria-label={pieza.id ? 'Editar pieza' : 'Nueva pieza'}>
        <h2>{pieza.id ? 'Editar pieza' : 'Nueva pieza'}</h2>

        <div className="adm-foto-campo">
          <div className="adm-foto-vista">{pieza.imagen ? <img src={pieza.imagen} alt="" /> : <span>Sin foto</span>}</div>
          <label className="adm-boton adm-boton-borde">
            {subiendo ? 'Subiendo…' : pieza.imagen ? 'Cambiar foto' : 'Subir foto'}
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={subir} hidden disabled={subiendo} />
          </label>
        </div>

        <div className="adm-grilla">
          <label className="adm-campo adm-ancho">
            Nombre
            <input value={pieza.nombre} onChange={cambiar('nombre')} maxLength={80} placeholder="Collar turquesa" />
          </label>
          <label className="adm-campo">
            Tipo
            <select value={pieza.tipo} onChange={cambiar('tipo')}>
              {TIPOS_PIEZA.map((t) => <option key={t.id} value={t.id}>{t.nombre}</option>)}
            </select>
          </label>
          <label className="adm-campo">
            Medida
            <input value={pieza.medida} onChange={cambiar('medida')} maxLength={80} placeholder="45 cm" />
          </label>
          <label className="adm-campo adm-ancho">
            Descripción
            <textarea value={pieza.descripcion} onChange={cambiar('descripcion')} maxLength={400} rows={2} placeholder="Qué la hace única, en una o dos frases." />
          </label>
          <label className="adm-campo adm-ancho">
            Materiales
            <input value={pieza.materiales} onChange={cambiar('materiales')} maxLength={200} placeholder="Turquesa, vidrio checo, acero quirúrgico" />
          </label>
          <label className="adm-campo">
            Precio (ARS)
            <input type="number" min="0" step="100" value={pieza.precio} onChange={cambiar('precio')} placeholder="0 = a consultar" />
          </label>
          <label className="adm-campo">
            Stock
            <input type="number" min="0" max="999" value={pieza.stock} onChange={cambiar('stock')} />
          </label>
          <label className="adm-check adm-ancho">
            <input type="checkbox" checked={pieza.activo} onChange={cambiar('activo')} />
            Publicada en la tienda
          </label>
        </div>

        {error && <p className="adm-error" role="alert">{error}</p>}
        <div className="adm-acciones">
          <button type="button" className="adm-boton adm-boton-borde" onClick={onCancelar}>Cancelar</button>
          <button className="adm-boton" disabled={guardando || subiendo}>{guardando ? 'Guardando…' : 'Guardar'}</button>
        </div>
      </form>
    </div>
  )
}

// ── Productos ────────────────────────────────────────────────
function Productos({ onSesionVencida }) {
  const [lista, setLista] = useState(null)
  const [editando, setEditando] = useState(null)
  const [aBorrar, setABorrar] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.adminProductos().then(setLista).catch((e) => (e.status === 401 ? onSesionVencida() : setError(e.message)))
  }, [onSesionVencida])

  function guardado(pieza) {
    setLista((l) => (l.some((p) => p.id === pieza.id) ? l.map((p) => (p.id === pieza.id ? pieza : p)) : [...l, pieza]))
    setEditando(null)
  }

  async function alternar(pieza) {
    try {
      guardado(await api.editarProducto(pieza.id, { activo: !pieza.activo }))
    } catch (e) {
      e.status === 401 ? onSesionVencida() : setError(e.message)
    }
  }

  async function borrar(id) {
    try {
      await api.borrarProducto(id)
      setLista((l) => l.filter((p) => p.id !== id))
      setABorrar(null)
    } catch (e) {
      e.status === 401 ? onSesionVencida() : setError(e.message)
    }
  }

  if (!lista) return <p className="adm-vacio">{error || 'Cargando…'}</p>

  return (
    <section>
      <div className="adm-titulo">
        <div>
          <h2>Piezas</h2>
          <p>{lista.filter((p) => p.activo).length} publicadas · {lista.filter((p) => p.activo && p.stock > 0).length} con stock</p>
        </div>
        <button className="adm-boton" onClick={() => setEditando({ ...VACIO })}>+ Nueva pieza</button>
      </div>
      {error && <p className="adm-error" role="alert">{error}</p>}

      {lista.length === 0 ? (
        <p className="adm-vacio">Todavía no cargaste piezas.</p>
      ) : (
        <ul className="adm-piezas">
          {lista.map((p) => (
            <li key={p.id} className={p.activo ? '' : 'oculta'}>
              <div className="adm-miniatura">{p.imagen ? <img src={p.imagen} alt="" /> : null}</div>
              <div className="adm-pieza-datos">
                <p className="adm-pieza-nombre">{p.nombre}</p>
                <p className="adm-pieza-meta">{nombreTipo(p.tipo)} · {precio(p.precio)}</p>
              </div>
              <span className={`adm-stock ${p.stock < 1 ? 'sin' : ''}`}>{p.stock < 1 ? 'Sin stock' : `Stock ${p.stock}`}</span>
              <button className={`adm-pastilla ${p.activo ? 'on' : ''}`} onClick={() => alternar(p)} aria-pressed={p.activo}>
                {p.activo ? 'Publicada' : 'Oculta'}
              </button>
              <div className="adm-pieza-acciones">
                <button className="adm-boton adm-boton-borde adm-chico" onClick={() => setEditando({ ...p })}>Editar</button>
                {aBorrar === p.id ? (
                  <>
                    <button className="adm-boton adm-peligro adm-chico" onClick={() => borrar(p.id)}>Sí, borrar</button>
                    <button className="adm-enlace" onClick={() => setABorrar(null)}>No</button>
                  </>
                ) : (
                  <button className="adm-enlace" onClick={() => setABorrar(p.id)}>Borrar</button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {editando && <FormularioPieza inicial={editando} onGuardado={guardado} onCancelar={() => setEditando(null)} />}
    </section>
  )
}

// ── Pedidos ──────────────────────────────────────────────────
function Pedidos({ onSesionVencida }) {
  const [lista, setLista] = useState(null)
  const [filtro, setFiltro] = useState('activos')
  const [error, setError] = useState('')

  useEffect(() => {
    api.pedidos().then(setLista).catch((e) => (e.status === 401 ? onSesionVencida() : setError(e.message)))
  }, [onSesionVencida])

  async function cambiar(numero, estado) {
    try {
      const actualizado = await api.cambiarEstado(numero, estado)
      setLista((l) => l.map((p) => (p.numero === numero ? actualizado : p)))
    } catch (e) {
      e.status === 401 ? onSesionVencida() : setError(e.message)
    }
  }

  if (!lista) return <p className="adm-vacio">{error || 'Cargando…'}</p>
  const visibles = lista.filter((p) => (filtro === 'activos' ? ['nuevo', 'confirmado'].includes(p.estado) : true))

  return (
    <section>
      <div className="adm-titulo">
        <div>
          <h2>Pedidos</h2>
          <p>{lista.filter((p) => p.estado === 'nuevo').length} nuevos sin confirmar</p>
        </div>
        <div className="adm-segmento" role="group" aria-label="Filtrar pedidos">
          <button className={filtro === 'activos' ? 'on' : ''} onClick={() => setFiltro('activos')}>Pendientes</button>
          <button className={filtro === 'todos' ? 'on' : ''} onClick={() => setFiltro('todos')}>Todos</button>
        </div>
      </div>
      {error && <p className="adm-error" role="alert">{error}</p>}
      <p className="adm-ayuda">Al confirmar un pedido se descuenta el stock. Si después lo cancelás, el stock vuelve.</p>

      {visibles.length === 0 ? (
        <p className="adm-vacio">No hay pedidos {filtro === 'activos' ? 'pendientes' : 'todavía'}.</p>
      ) : (
        <ul className="adm-pedidos">
          {visibles.map((p) => (
            <li key={p.numero} className={`estado-${p.estado}`}>
              <div className="adm-pedido-cabecera">
                <p><strong>N.º {p.numero}</strong> · {p.nombre}</p>
                <select value={p.estado} onChange={(e) => cambiar(p.numero, e.target.value)} aria-label={`Estado del pedido ${p.numero}`}>
                  {ESTADOS.map((e) => <option key={e.id} value={e.id}>{e.nombre}</option>)}
                </select>
              </div>
              <ul className="adm-pedido-items">
                {p.items.map((i) => <li key={i.id}>{i.cantidad} × {i.nombre} <span>{precio(i.precio * i.cantidad)}</span></li>)}
              </ul>
              <p className="adm-pedido-pie">
                {fecha(p.creado)} · {p.entrega === 'retiro' ? 'Retiro' : 'Envío'} · Total <strong>{p.total > 0 ? precio(p.total) : 'a confirmar'}</strong>
              </p>
              {p.nota && <p className="adm-pedido-nota">“{p.nota}”</p>}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

// ── Ajustes ──────────────────────────────────────────────────
function Ajustes({ onSesionVencida }) {
  const [whatsapp, setWhatsapp] = useState('')
  const [estado, setEstado] = useState('')

  useEffect(() => {
    api.adminAjustes().then((a) => setWhatsapp(a.whatsapp || '')).catch((e) => e.status === 401 && onSesionVencida())
  }, [onSesionVencida])

  async function guardar(e) {
    e.preventDefault()
    try {
      const a = await api.guardarAjustes({ whatsapp })
      setWhatsapp(a.whatsapp)
      setEstado('Guardado.')
    } catch (err) {
      err.status === 401 ? onSesionVencida() : setEstado(err.message)
    }
  }

  return (
    <section>
      <div className="adm-titulo"><h2>Ajustes</h2></div>
      <form className="adm-tarjeta adm-ajustes" onSubmit={guardar}>
        <label className="adm-campo">
          Número de WhatsApp que recibe los pedidos
          <input inputMode="numeric" value={whatsapp} onChange={(e) => { setWhatsapp(e.target.value); setEstado('') }} placeholder="5492611234567" />
        </label>
        <p className="adm-ayuda">Con código de país y de área, sin 0 ni 15. Ejemplo para Mendoza: 549 261 1234567.</p>
        <div className="adm-acciones">
          {whatsapp && <a className="adm-enlace" href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer">Probar el número</a>}
          <button className="adm-boton">Guardar</button>
        </div>
        {estado && <p className="adm-ayuda" role="status">{estado}</p>}
      </form>
    </section>
  )
}

// ── Panel ────────────────────────────────────────────────────
const SECCIONES = [
  { id: 'productos', nombre: 'Piezas', Componente: Productos },
  { id: 'pedidos', nombre: 'Pedidos', Componente: Pedidos },
  { id: 'ajustes', nombre: 'Ajustes', Componente: Ajustes },
]

export default function Admin() {
  const [sesion, setSesion] = useState(null) // null = comprobando
  const [seccion, setSeccion] = useState('productos')

  useEffect(() => {
    document.title = 'Panel · sdisegno'
    api.sesion().then(() => setSesion(true)).catch(() => setSesion(false))
  }, [])

  const vencida = useState(() => () => setSesion(false))[0]

  async function salir() {
    await api.salir().catch(() => {})
    setSesion(false)
  }

  if (sesion === null) return <p className="adm-vacio">Cargando…</p>
  if (!sesion) return <Entrar onEntrar={() => setSesion(true)} />

  const { Componente } = SECCIONES.find((s) => s.id === seccion)
  return (
    <div className="adm">
      <header className="adm-barra">
        <div className="adm-marca">
          <Logo tamano={40} radio={20} />
          <span>Panel</span>
        </div>
        <nav className="adm-tabs" aria-label="Secciones del panel">
          {SECCIONES.map((s) => (
            <button key={s.id} className={seccion === s.id ? 'on' : ''} aria-current={seccion === s.id ? 'page' : undefined} onClick={() => setSeccion(s.id)}>
              {s.nombre}
            </button>
          ))}
        </nav>
        <div className="adm-barra-fin">
          <a href="/" className="adm-enlace" target="_blank" rel="noreferrer">Ver tienda</a>
          <button className="adm-enlace" onClick={salir}>Salir</button>
        </div>
      </header>
      <main className="adm-contenido">
        <Componente onSesionVencida={vencida} />
      </main>
    </div>
  )
}
