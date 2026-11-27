// Servidor local: la API y, si existe, la web compilada (npm start).
import express from 'express'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { app } from './app.js'

const DIST = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist')
const PUERTO = Number(process.env.PORT) || 3001

if (!process.env.ADMIN_PASSWORD || !process.env.SESSION_SECRET) {
  console.error('Faltan ADMIN_PASSWORD y SESSION_SECRET en el archivo .env (ver .env.example).')
  process.exit(1)
}

const servidor = express()
servidor.use(app)
if (fs.existsSync(DIST)) {
  servidor.use(express.static(DIST))
  servidor.get('*', (req, res) => res.sendFile(path.join(DIST, 'index.html')))
}
servidor.listen(PUERTO, () => console.log(`Servidor de sdisegno en http://localhost:${PUERTO}`))
