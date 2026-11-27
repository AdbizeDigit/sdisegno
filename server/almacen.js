// Dónde se guardan los datos y las fotos.
// - Con DATABASE_URL (Vercel + Neon): en Postgres.
// - Sin DATABASE_URL (en la compu): archivos en server/datos y server/fotos.
import fs from 'node:fs'
import path from 'node:path'
import { Readable } from 'node:stream'
import { fileURLToPath } from 'node:url'

const AQUI = path.dirname(fileURLToPath(import.meta.url))
const DATOS = path.join(AQUI, 'datos')
const FOTOS = path.join(AQUI, 'fotos')

async function conectarPostgres(url) {
  const { neon } = await import('@neondatabase/serverless')
  const sql = neon(url)
  // Dos tablas simples: una para los datos (productos, pedidos, ajustes) y otra para las fotos.
  let listo = null
  const preparar = () =>
    (listo ??= Promise.all([
      sql`CREATE TABLE IF NOT EXISTS sd_datos (clave TEXT PRIMARY KEY, valor JSONB NOT NULL, actualizado TIMESTAMPTZ NOT NULL DEFAULT now())`,
      sql`CREATE TABLE IF NOT EXISTS sd_fotos (archivo TEXT PRIMARY KEY, tipo TEXT NOT NULL, datos TEXT NOT NULL, creado TIMESTAMPTZ NOT NULL DEFAULT now())`,
    ]).catch((err) => {
      listo = null
      throw err
    }))

  return {
    async leer(nombre, porDefecto) {
      await preparar()
      const filas = await sql`SELECT valor FROM sd_datos WHERE clave = ${nombre}`
      return filas.length ? filas[0].valor : porDefecto
    },
    async guardar(nombre, valor) {
      await preparar()
      await sql`INSERT INTO sd_datos (clave, valor) VALUES (${nombre}, ${JSON.stringify(valor)}::jsonb)
                ON CONFLICT (clave) DO UPDATE SET valor = EXCLUDED.valor, actualizado = now()`
    },
    async guardarFoto(archivo, buffer, tipo) {
      await preparar()
      await sql`INSERT INTO sd_fotos (archivo, tipo, datos) VALUES (${archivo}, ${tipo}, ${buffer.toString('base64')})`
    },
    async leerFoto(archivo) {
      await preparar()
      const filas = await sql`SELECT tipo, datos FROM sd_fotos WHERE archivo = ${archivo}`
      if (!filas.length) return null
      return { stream: Readable.from(Buffer.from(filas[0].datos, 'base64')), tipo: filas[0].tipo }
    },
    async borrarFoto(archivo) {
      await preparar()
      await sql`DELETE FROM sd_fotos WHERE archivo = ${archivo}`
    },
  }
}

const enArchivos = {
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

export const almacen = process.env.DATABASE_URL ? await conectarPostgres(process.env.DATABASE_URL) : enArchivos
