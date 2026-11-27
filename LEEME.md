# sdisegno · tienda y panel

Web de sdisegno con tienda conectada a WhatsApp y panel para administrar las piezas.
Armada desde la plantilla de marca, con la Guía de marca sdisegno (26/11/2026).

## Cómo se usa

```
npm install
npm run dev      # web en http://localhost:5176 + servidor en el puerto 3001
```

- **Tienda**: http://localhost:5176. Las clientas agregan piezas a "Tu pedido" y tocan "Pedir por WhatsApp": el pedido queda guardado con un número y se abre WhatsApp con el detalle.
- **Panel**: http://localhost:5176/admin. La contraseña está en el archivo `.env` (`ADMIN_PASSWORD`); cambiala ahí y reiniciá.
  - **Piezas**: crear, editar, subir foto, precio, stock, publicar u ocultar, borrar.
  - **Pedidos**: ver los pedidos de la web. Al pasarlos a *Confirmado* se descuenta el stock; si después se cancelan, vuelve.
  - **Ajustes**: el número de WhatsApp que recibe los pedidos.

## Dónde está cada cosa

- Textos, colores y secciones de la web: `src/marca.js`.
- Servidor: `server/index.js`. Guarda los datos en `server/datos/*.json` y las fotos en `server/fotos/`. **Hacé copia de esas dos carpetas**: ahí están tus piezas y pedidos.
- Logo: `src/assets/logo.jpg` (foto de perfil de Instagram, 600 px). Cuando esté en vectorial, reemplazarlo.
- Fotos de la web (`src/assets/`) y videos (`public/media/`): generados con Magnific.

## Publicado en Vercel

- La web es estática (Vite) y la API corre como función de Vercel (`api/index.js`, que usa `server/app.js`).
- Los datos y las fotos se guardan en **Neon Postgres** (plan Free, región São Paulo), en las tablas `sd_datos` y `sd_fotos`. Las fotos se sirven por `/fotos/...` a través de la API y el panel las achica antes de subirlas.
- Variables de entorno en Vercel: `ADMIN_PASSWORD`, `SESSION_SECRET` y `DATABASE_URL` (esta la agrega Vercel al conectar Neon).
- Para cambiar la contraseña del panel: Vercel → proyecto sdisegno → Settings → Environment Variables → `ADMIN_PASSWORD`, y volver a publicar.
- Cada push a `main` en GitHub publica una versión nueva.
- En el primer arranque se cargan 4 piezas de ejemplo (`server/semilla.js`). Editalas o borralas desde el panel.

## Correrlo en otro servidor con Node

```
npm install
npm run build
npm start        # sirve la web y el panel en el mismo puerto (PORT del .env)
```

Sin `DATABASE_URL` guarda todo en `server/datos` y `server/fotos`: hace falta disco persistente y copias de esas carpetas.
