// API de sdisegno: productos, pedidos, ajustes y sesión del panel.
// La usan server/index.js (en la compu) y api/index.js (en Vercel).
import express from 'express'
import multer from 'multer'
import crypto from 'node:crypto'
import { almacen } from './almacen.js'
import { PIEZAS_INICIALES } from './semilla.js'

const CLAVE = process.env.ADMIN_PASSWORD
const SECRETO = process.env.SESSION_SECRET

const TIPOS = ['collares', 'pulseras', 'aros', 'otros']
const ESTADOS = ['nuevo', 'confirmado', 'entregado', 'cancelado']
const EXTENSIONES = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' }

// ── Datos ────────────────────────────────────────────────────
async function leerProductos() {
  const productos = await almacen.leer('productos', null)
  if (productos) return productos
  // Primer arranque: carga las piezas de ejemplo.
  const iniciales = PIEZAS_INICIALES.map((p) => ({
    id: crypto.randomUUID(),
    creado: new Date().toISOString(),
    descripcion: '', materiales: '', medida: '', precio: 0, stock: 1, activo: true,
    ...p,
  }))
  await almacen.guardar('productos', iniciales)
  return iniciales
}
const leerPedidos = () => almacen.leer('pedidos', [])
const leerAjustes = () => almacen.leer('ajustes', { whatsapp: '' })

// ── Sesión del panel (cookie firmada) ────────────────────────
const DURACION = 1000 * 60 * 60 * 12 // 12 horas

function firmar(valor) {
  return crypto.createHmac('sha256', SECRETO).update(valor).digest('base64url')
}
function crearSesion() {
  const vence = String(Date.now() + DURACION)
  return `${vence}.${firmar(vence)}`
}
function sesionValida(token = '') {
  const [vence, firma] = token.split('.')
  if (!vence || !firma || !SECRETO) return false
  const esperada = firmar(vence)
  if (firma.length !== esperada.length) return false
  return crypto.timingSafeEqual(Buffer.from(firma), Buffer.from(esperada)) && Number(vence) > Date.now()
}
function leerCookie(req, nombre) {
  const par = (req.headers.cookie || '').split(';').map((c) => c.trim()).find((c) => c.startsWith(`${nombre}=`))
  return par ? decodeURIComponent(par.slice(nombre.length + 1)) : ''
}
function soloAdmin(req, res, next) {
  if (sesionValida(leerCookie(req, 'sd_admin'))) return next()
  res.status(401).json({ error: 'Iniciá sesión de nuevo.' })
}
function igualSeguro(a, b) {
  const ha = crypto.createHash('sha256').update(String(a)).digest()
  const hb = crypto.createHash('sha256').update(String(b)).digest()
  return crypto.timingSafeEqual(ha, hb)
}

// ── Validación ───────────────────────────────────────────────
const texto = (v, max = 300) => String(v ?? '').trim().slice(0, max)
const entero = (v, min = 0, max = 100000000) => {
  const n = Math.round(Number(v))
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : min
}
const imagenValida = (v) => /^\/(fotos|semilla)\/[\w.-]+$/.test(v)

function limpiarProducto(entrada, anterior = {}) {
  const imagen = texto(entrada.imagen ?? anterior.imagen, 200)
  return {
    ...anterior,
    nombre: texto(entrada.nombre ?? anterior.nombre, 80) || 'Sin nombre',
    tipo: TIPOS.includes(entrada.tipo) ? entrada.tipo : anterior.tipo || 'otros',
    descripcion: texto(entrada.descripcion ?? anterior.descripcion, 400),
    materiales: texto(entrada.materiales ?? anterior.materiales, 200),
    medida: texto(entrada.medida ?? anterior.medida, 80),
    precio: entero(entrada.precio ?? anterior.precio),
    stock: entero(entrada.stock ?? anterior.stock ?? 1, 0, 999),
    imagen: imagenValida(imagen) ? imagen : '',
    activo: entrada.activo === undefined ? anterior.activo ?? true : Boolean(entrada.activo),
  }
}

const publico = ({ id, nombre, tipo, descripcion, materiales, medida, precio, stock, imagen }) => ({
  id, nombre, tipo, descripcion, materiales, medida, precio, stock, imagen,
})

// Express 4 no captura errores de funciones async: este envoltorio los pasa al manejador.
const a = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

// ── App ──────────────────────────────────────────────────────
export const app = express()
app.disable('x-powered-by')
app.set('trust proxy', true)
app.use(express.json({ limit: '100kb' }))

app.get('/fotos/:archivo', a(async (req, res) => {
  const archivo = req.params.archivo
  if (!/^[\w-]+\.(jpg|png|webp)$/.test(archivo)) return res.status(404).end()
  const foto = await almacen.leerFoto(archivo)
  if (!foto) return res.status(404).end()
  res.setHeader('Content-Type', foto.tipo)
  res.setHeader('Cache-Control', 'public, max-age=31536000, s-maxage=31536000, immutable')
  foto.stream.pipe(res)
}))

// Tienda (público)
app.get('/api/productos', a(async (req, res) => {
  const productos = (await leerProductos()).filter((p) => p.activo)
  // El CDN de Vercel guarda la lista 60 s: la tienda no espera a la base en cada visita.
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=60, stale-while-revalidate=600')
  res.json(productos.map(publico))
}))

app.get('/api/ajustes', a(async (req, res) => {
  const { whatsapp = '' } = await leerAjustes()
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=60, stale-while-revalidate=600')
  res.json({ whatsapp })
}))

app.post('/api/pedidos', a(async (req, res) => {
  const productos = await leerProductos()
  const items = Array.isArray(req.body.items) ? req.body.items.slice(0, 30) : []
  const lineas = []
  for (const item of items) {
    const producto = productos.find((p) => p.id === item.id && p.activo)
    if (!producto) return res.status(400).json({ error: 'Una de las piezas ya no está disponible.' })
    const cantidad = entero(item.cantidad, 1, 99)
    if (cantidad > producto.stock) {
      return res.status(409).json({ error: `"${producto.nombre}" ya no tiene stock suficiente.` })
    }
    lineas.push({ id: producto.id, nombre: producto.nombre, precio: producto.precio, cantidad })
  }
  if (lineas.length === 0) return res.status(400).json({ error: 'El pedido está vacío.' })

  const nombre = texto(req.body.nombre, 60)
  if (!nombre) return res.status(400).json({ error: 'Falta tu nombre.' })

  const pedidos = await leerPedidos()
  const numero = pedidos.reduce((max, p) => Math.max(max, p.numero), 0) + 1
  const pedido = {
    numero,
    creado: new Date().toISOString(),
    nombre,
    entrega: req.body.entrega === 'retiro' ? 'retiro' : 'envio',
    nota: texto(req.body.nota, 300),
    items: lineas,
    total: lineas.reduce((suma, l) => suma + l.precio * l.cantidad, 0),
    estado: 'nuevo',
  }
  pedidos.push(pedido)
  await almacen.guardar('pedidos', pedidos)
  res.status(201).json(pedido)
}))

// Panel
app.post('/api/admin/entrar', a(async (req, res) => {
  await new Promise((r) => setTimeout(r, 400)) // frena intentos repetidos
  if (!CLAVE || !SECRETO) return res.status(503).json({ error: 'Falta configurar ADMIN_PASSWORD y SESSION_SECRET.' })
  if (!igualSeguro(req.body.clave ?? '', CLAVE)) return res.status(401).json({ error: 'Contraseña incorrecta.' })
  res.setHeader('Set-Cookie', `sd_admin=${crearSesion()}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${DURACION / 1000}${req.secure ? '; Secure' : ''}`)
  res.json({ ok: true })
}))

app.post('/api/admin/salir', (req, res) => {
  res.setHeader('Set-Cookie', 'sd_admin=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0')
  res.json({ ok: true })
})

app.use('/api/admin', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store')
  next()
})

app.get('/api/admin/sesion', soloAdmin, (req, res) => res.json({ ok: true }))

app.get('/api/admin/productos', soloAdmin, a(async (req, res) => res.json(await leerProductos())))

app.post('/api/admin/productos', soloAdmin, a(async (req, res) => {
  const productos = await leerProductos()
  const producto = { id: crypto.randomUUID(), creado: new Date().toISOString(), ...limpiarProducto(req.body) }
  productos.push(producto)
  await almacen.guardar('productos', productos)
  res.status(201).json(producto)
}))

app.put('/api/admin/productos/:id', soloAdmin, a(async (req, res) => {
  const productos = await leerProductos()
  const i = productos.findIndex((p) => p.id === req.params.id)
  if (i === -1) return res.status(404).json({ error: 'No existe ese producto.' })
  productos[i] = limpiarProducto(req.body, productos[i])
  await almacen.guardar('productos', productos)
  res.json(productos[i])
}))

app.delete('/api/admin/productos/:id', soloAdmin, a(async (req, res) => {
  const productos = await leerProductos()
  const producto = productos.find((p) => p.id === req.params.id)
  if (!producto) return res.status(404).json({ error: 'No existe ese producto.' })
  await almacen.guardar('productos', productos.filter((p) => p.id !== req.params.id))
  if (producto.imagen.startsWith('/fotos/')) await almacen.borrarFoto(producto.imagen.slice('/fotos/'.length))
  res.json({ ok: true })
}))

// Vercel acepta cuerpos de hasta 4,5 MB, por eso el límite de 4 MB.
const subida = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 4 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, cb) => cb(null, Boolean(EXTENSIONES[file.mimetype])),
})

app.post('/api/admin/fotos', soloAdmin, subida.single('foto'), a(async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Subí una foto JPG, PNG o WebP de hasta 4 MB.' })
  const archivo = `${crypto.randomUUID()}${EXTENSIONES[req.file.mimetype]}`
  await almacen.guardarFoto(archivo, req.file.buffer, req.file.mimetype)
  res.status(201).json({ imagen: `/fotos/${archivo}` })
}))

app.get('/api/admin/pedidos', soloAdmin, a(async (req, res) => {
  res.json((await leerPedidos()).sort((x, y) => y.numero - x.numero))
}))

// Confirmar un pedido descuenta el stock; cancelarlo después de confirmado lo devuelve.
app.put('/api/admin/pedidos/:numero', soloAdmin, a(async (req, res) => {
  const estado = req.body.estado
  if (!ESTADOS.includes(estado)) return res.status(400).json({ error: 'Estado inválido.' })
  const pedidos = await leerPedidos()
  const pedido = pedidos.find((p) => p.numero === Number(req.params.numero))
  if (!pedido) return res.status(404).json({ error: 'No existe ese pedido.' })

  const descontado = ['confirmado', 'entregado'].includes(pedido.estado)
  const descontar = ['confirmado', 'entregado'].includes(estado)
  if (descontado !== descontar) {
    const productos = await leerProductos()
    for (const item of pedido.items) {
      const producto = productos.find((p) => p.id === item.id)
      if (producto) producto.stock = Math.max(0, producto.stock + (descontar ? -item.cantidad : item.cantidad))
    }
    await almacen.guardar('productos', productos)
  }
  pedido.estado = estado
  await almacen.guardar('pedidos', pedidos)
  res.json(pedido)
}))

app.get('/api/admin/ajustes', soloAdmin, a(async (req, res) => res.json(await leerAjustes())))

app.put('/api/admin/ajustes', soloAdmin, a(async (req, res) => {
  const whatsapp = String(req.body.whatsapp ?? '').replace(/\D/g, '').slice(0, 15)
  await almacen.guardar('ajustes', { ...(await leerAjustes()), whatsapp })
  res.json({ whatsapp })
}))

app.use('/api', (req, res) => res.status(404).json({ error: 'No encontrado.' }))

app.use((err, req, res, next) => {
  console.error(err)
  const grande = err.code === 'LIMIT_FILE_SIZE'
  res.status(grande ? 413 : 500).json({ error: grande ? 'La foto supera los 4 MB.' : 'Algo salió mal.' })
})
