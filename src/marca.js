// ─────────────────────────────────────────────────────────────
// sdisegno · datos de la marca
// Textos tomados de la Guía de marca sdisegno (26/11/2026).
// Todo lo que está entre [CORCHETES] es un dato real que falta completar.
// Fotos y videos generados con Magnific.
// ─────────────────────────────────────────────────────────────

import imgPiezaUso from './assets/pieza-uso.webp'
import imgOficio from './assets/oficio.webp'
import imgMateriales from './assets/materiales.webp'
import imgRediseno from './assets/rediseno.webp'
import imgCapsula from './assets/capsula.webp'
import imgTaller from './assets/taller.webp'
import logo from './assets/logo.jpg'

// ── Identidad ────────────────────────────────────────────────
export const MARCA = {
  nombre: 'sdisegno', // siempre en minúsculas y en una sola palabra
  pronunciacion: '/ese·di·sé·gno/',
  iniciales: 'Sd',
  logo, // monograma Sd de la foto de perfil de Instagram (600 px). Cuando esté en vectorial, reemplazar.
  ciudad: 'Mendoza',
  descripcion: 'Accesorios de diseño hechos a mano en Mendoza. Piezas únicas, cápsulas limitadas y rediseño de tus accesorios.',
  firma: 'Accesorios de diseño hechos a mano.',
  instagram: { url: 'https://www.instagram.com/sdisegno.sd/', usuario: '@sdisegno.sd' },
  // El número de WhatsApp se carga en el panel /admin → Ajustes.
}

// ── Colores (Guía de marca, valores aproximados) ─────────────
export const COLORES = {
  primario: '#062553', // Azul sdisegno
  'primario-oscuro': '#03183a',
  fondo: '#f7f7f9', // Papel
  'fondo-claro': '#ffffff',
  acento: '#fcf1b3', // Manteca
  resalte: '#e54d38', // Coral: cápsulas
  terciario: '#c2b71d', // Lima oliva: rediseño
  tinta: '#0b1b3a',
  gris: '#4a5470',
  linea: '#e3e5ee',
  'destacado-fondo': '#062553',
  'destacado-brillo': '#fcf1b3',
  'destacado-etiqueta': '#c2b71d',
}

// ── Portada ──────────────────────────────────────────────────
export const PORTADA = {
  titulo: ['Elegí ese', 'diseño', 'para vos.'],
  bajada: 'Accesorios hechos a mano en Mendoza, con piedras, vidrio y acero quirúrgico. No hay dos piezas iguales.',
  botonPrincipal: 'Ver la cápsula',
  botonSecundario: 'Rediseñá tus accesorios',
  pastillas: ['Piezas únicas', 'Hecho a mano', 'Materiales nobles'],
  // Formato diccionario: recurso propio de la marca
  diccionario: {
    palabra: 'sdisegno',
    pronunciacion: '/ese·di·sé·gno/',
    tipo: 's.',
    definicion: 'Accesorio de diseño hecho a mano que no se repite. Algo que te representa. Algo irrepetible.',
  },
}

// ── Textos de cada sección ───────────────────────────────────
export const SECCIONES = {
  menu: { agenda: 'Cápsula', experiencias: 'La marca', lugares: 'Cómo comprar', reservar: 'Consultas' },
  agenda: {
    etiqueta: 'Cápsula vigente',
    titulo: 'Piezas disponibles',
    bajada: 'Cada pieza se diseña y se arma una sola vez. Cuando se va, no vuelve.',
    vacio: 'Por ahora no hay piezas de este tipo. Escribime y te aviso cuando salga la próxima cápsula.',
    boton: 'Agregar al pedido',
  },
  experiencias: { etiqueta: 'Qué es sdisegno', titulo: 'Cada pieza es única porque cada persona lo es', bajada: 'Detrás de cada accesorio hay una diseñadora industrial, no una reventa.' },
  lugares: { etiqueta: 'Cómo comprar', titulo: 'Cómo llega tu pieza' },
  historia: { etiqueta: 'La historia' },
  reserva: {
    etiqueta: 'Pedí tu pieza',
    titulo: '¿Buscás algo distinto?',
    bajada: 'Si querés ver el catálogo completo, rediseñar un accesorio o buscás un regalo, contame y te armo el mensaje para WhatsApp.',
    pasos: ['Elegís la pieza o me contás tu idea', 'Te paso fotos y detalles', 'Coordinamos el pago', 'Envío en Mendoza'],
    nota: 'Te respondo yo, Sol, por WhatsApp.',
    cantidad: '¿Cuántas piezas?',
    unidad: ['pieza', 'piezas'],
    fecha: '¿Para cuándo la necesitás?',
  },
}

// ── Pilares de la marca ──────────────────────────────────────
export const FORMATOS = [
  { id: 'unica', nombre: 'Pieza única', icono: 'destello', imagen: imgPiezaUso, alt: 'Collar de turquesas y vidrio puesto sobre una camisa de lino', texto: 'Cada accesorio se diseña y se arma una sola vez.' },
  { id: 'oficio', nombre: 'Hecho a mano', icono: 'pincel', imagen: imgOficio, alt: 'Manos enhebrando piedras en un collar sobre una mesa de trabajo', texto: 'Diseño industrial aplicado a cada cuenta, cada cierre y cada largo.' },
  { id: 'materiales', nombre: 'Materiales nobles', icono: 'paleta', imagen: imgMateriales, alt: 'Piedras, vidrio y acero quirúrgico sobre lino crudo', texto: 'Piedras, vidrio y acero quirúrgico. Cada placa nombra sus materiales.' },
  { id: 'rediseno', nombre: 'Segunda vida', icono: 'corazon', imagen: imgRediseno, alt: 'Un collar viejo y las piezas nuevas armadas con sus cuentas', texto: 'Rediseño tus accesorios con tus propias cuentas.', destacado: true },
]

// Banda del rediseño (video en public/media/rediseno.mp4)
export const DESTACADO = {
  etiqueta: 'Servicio de rediseño',
  titulo: 'Rediseño',
  texto: 'Traé ese collar que ya no usás. Darles una segunda vida útil. De eso se trata.',
  boton: 'Quiero rediseñar',
  video: '/media/rediseno.mp4',
  poster: '/media/rediseno-poster.webp',
}

// ── Cómo comprar ─────────────────────────────────────────────
// tono: 'resalte' (coral) = cápsula · 'terciario' (lima) = rediseño · 'primario' y 'acento' = el resto
export const LUGARES = [
  { id: 'capsula', nombre: 'Cápsulas', tono: 'resalte', texto: 'Colecciones cortas de piezas únicas. Pedí el catálogo de la cápsula vigente.' },
  { id: 'rediseno', nombre: 'Rediseño', tono: 'terciario', texto: 'Traés tus accesorios y los convertimos en una pieza nueva.' },
  { id: 'regalo', nombre: 'Para regalar', tono: 'primario', texto: 'Un regalo con significado, con tarjeta y los cuidados de la pieza.' },
  { id: 'envios', nombre: 'Envíos en Mendoza', tono: 'acento', texto: 'Coordinamos la entrega por WhatsApp.' },
]

// ── Cápsula vigente ──────────────────────────────────────────
export const TIPOS_PIEZA = [
  { id: 'collares', nombre: 'Collares' },
  { id: 'pulseras', nombre: 'Pulseras' },
  { id: 'aros', nombre: 'Aros' },
  { id: 'otros', nombre: 'Otros' },
]

// Las piezas se cargan desde el panel /admin.
export const IMAGEN_CAPSULA = { src: imgCapsula, alt: 'Tres collares únicos colgados de una rama sobre papel blanco' }

// ── La historia ──────────────────────────────────────────────
export const EQUIPO = {
  foto: imgTaller,
  alt: 'El taller de sdisegno con collares colgados y frascos de piedras',
  promesas: [
    { titulo: 'Historia', texto: 'De chica jugaba a ser diseñadora armando collares y pulseras. Hoy soy diseñadora industrial y sdisegno une ese juego con mi profesión.' },
    { titulo: 'Propósito', texto: 'Que encuentres un accesorio que te represente y te haga sentir vos misma.' },
    { titulo: 'Promesa', texto: 'No hay dos piezas iguales.' },
    { titulo: 'Materiales', texto: 'Piedras, vidrio y acero quirúrgico, elegidos pieza por pieza.' },
  ],
}

// Frases que pasan en la cinta animada (frases que la marca ya usa).
export const FRASES = ['Elegí ese diseño para vos', 'No hay dos piezas iguales', 'Darles una segunda vida útil', 'Algo que te represente. Algo irrepetible']

// ── Formulario de pedido ─────────────────────────────────────
export const TIPOS_RESERVA = [
  { id: 'catalogo', nombre: 'Ver el catálogo', mensaje: 'Quiero ver el catálogo de la cápsula vigente' },
  { id: 'rediseno', nombre: 'Rediseñar un accesorio', mensaje: 'Quiero rediseñar un accesorio que tengo' },
  { id: 'regalo', nombre: 'Un regalo', mensaje: 'Estoy buscando un regalo' },
]

// ── Rediseño 2026: textos de las secciones nuevas ────────────
export const MANIFIESTO =
  'Cada pieza es única porque cada persona lo es. Elijo cada piedra, cada vidrio y cada cierre de acero para que encuentres algo que te represente. Algo irrepetible.'

export const VENTANA = {
  etiqueta: 'El taller',
  titulo: 'Hecho a mano, una sola vez.',
  texto: 'Diseño industrial aplicado a cada cuenta, cada cierre y cada largo.',
}

export const PASOS_REDISENO = [
  { numero: '01', titulo: 'Traés', texto: 'Ese collar que ya no usás, la pulsera rota, las cuentas sueltas.' },
  { numero: '02', titulo: 'Desarmo', texto: 'Separo las piezas y elijo cuáles merecen una segunda vida.' },
  { numero: '03', titulo: 'Rediseño', texto: 'Armo una pieza nueva, tuya, que no existía.' },
]
