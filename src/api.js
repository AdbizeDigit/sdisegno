// Llamadas al servidor de sdisegno.
async function pedir(ruta, opciones = {}) {
  const esArchivo = opciones.body instanceof FormData
  const res = await fetch(ruta, {
    credentials: 'same-origin',
    ...opciones,
    headers: esArchivo || !opciones.body ? opciones.headers : { 'Content-Type': 'application/json', ...opciones.headers },
    body: esArchivo || !opciones.body ? opciones.body : JSON.stringify(opciones.body),
  })
  const datos = await res.json().catch(() => ({}))
  if (!res.ok) {
    const error = new Error(datos.error || 'No se pudo conectar con el servidor.')
    error.status = res.status
    throw error
  }
  return datos
}

export const api = {
  productos: () => pedir('/api/productos'),
  ajustes: () => pedir('/api/ajustes'),
  crearPedido: (pedido) => pedir('/api/pedidos', { method: 'POST', body: pedido }),

  entrar: (clave) => pedir('/api/admin/entrar', { method: 'POST', body: { clave } }),
  salir: () => pedir('/api/admin/salir', { method: 'POST' }),
  sesion: () => pedir('/api/admin/sesion'),
  adminProductos: () => pedir('/api/admin/productos'),
  crearProducto: (p) => pedir('/api/admin/productos', { method: 'POST', body: p }),
  editarProducto: (id, p) => pedir(`/api/admin/productos/${id}`, { method: 'PUT', body: p }),
  borrarProducto: (id) => pedir(`/api/admin/productos/${id}`, { method: 'DELETE' }),
  subirFoto: (archivo) => {
    const datos = new FormData()
    datos.append('foto', archivo)
    return pedir('/api/admin/fotos', { method: 'POST', body: datos })
  },
  pedidos: () => pedir('/api/admin/pedidos'),
  cambiarEstado: (numero, estado) => pedir(`/api/admin/pedidos/${numero}`, { method: 'PUT', body: { estado } }),
  adminAjustes: () => pedir('/api/admin/ajustes'),
  guardarAjustes: (a) => pedir('/api/admin/ajustes', { method: 'PUT', body: a }),
}

const pesos = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })
export const precio = (n) => (n > 0 ? pesos.format(n) : 'Precio a consultar')

export function enlaceWhatsapp(numero, mensaje) {
  return numero ? `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}` : null
}
