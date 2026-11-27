// Dónde se guardan los datos y las fotos.
// - En Vercel (hay BLOB_READ_WRITE_TOKEN): Vercel Blob, en un almacén privado.
// - En la compu: archivos en server/datos y server/fotos.
import fs from 'node:fs'
import path from 'node:path'
import { Readable } from 'node:stream'
import { fileURLToPath } from 'node:url'

const AQUI = path.dirname(fileURLToPath(import.meta.url))
const DATOS = path.join(AQUI, 'datos')
const FOTOS = path.join(AQUI, 'fotos')
const EN_BLOB = Boolean(process.env.BLOB_READ_WRITE_TOKEN)

const blob = EN_BLOB ? await import('@vercel/blob') : null

async function leerTexto(stream) {
  let texto = ''
  for await (const parte of Readable.fromWeb(stream)) texto += parte
  return texto
}

export const almacen = EN_BLOB
  ? {
      async leer(nombre, porDefecto) {
        const r = await blob.get(`datos/${nombre}.json`, { access: 'private', useCache: false })
        if (!r || !r.stream) return porDefecto
        return JSON.parse(await leerTexto(r.stream))
      },
      async guardar(nombre, valor) {
        await blob.put(`datos/${nombre}.json`, JSON.stringify(valor), {
          access: 'private',
          addRandomSuffix: false,
          allowOverwrite: true,
          contentType: 'application/json',
          cacheControlMaxAge: 60,
        })
      },
      async guardarFoto(archivo, buffer, tipo) {
        await blob.put(`fotos/${archivo}`, buffer, { access: 'private', addRandomSuffix: false, contentType: tipo })
      },
      async leerFoto(archivo) {
        const r = await blob.get(`fotos/${archivo}`, { access: 'private' })
        if (!r || !r.stream) return null
        return { stream: Readable.fromWeb(r.stream), tipo: r.blob?.contentType || 'image/jpeg' }
      },
      async borrarFoto(archivo) {
        await blob.del(`fotos/${archivo}`).catch(() => {})
      },
    }
  : {
      async leer(nombre, porDefecto) {
        try {
          return JSON.parse(fs.readFileSync(path.join(DATOS, `${nombre}.json`), 'utf8'))
        } catch {
          return porDefecto
        }
      },
      async guardar(nombre, valor) {
        fs.mkdirSync(DATOS, { recursive: true })
        const destino = path.join(DATOS, `${nombre}.json`)
        fs.writeFileSync(`${destino}.tmp`, JSON.stringify(valor, null, 2))
        fs.renameSync(`${destino}.tmp`, destino)
      },
      async guardarFoto(archivo, buffer) {
        fs.mkdirSync(FOTOS, { recursive: true })
        fs.writeFileSync(path.join(FOTOS, archivo), buffer)
      },
      async leerFoto(archivo) {
        const ruta = path.join(FOTOS, archivo)
        if (!fs.existsSync(ruta)) return null
        const tipo = { '.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' }[path.extname(archivo)] || 'image/jpeg'
        return { stream: fs.createReadStream(ruta), tipo }
      },
      async borrarFoto(archivo) {
        fs.rmSync(path.join(FOTOS, archivo), { force: true })
      },
    }
