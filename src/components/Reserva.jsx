import { useState } from 'react'
import Icono from './Icono.jsx'
import { SECCIONES, TIPOS_RESERVA as TIPOS } from '../marca.js'
import { enlaceWhatsapp } from '../api.js'

const textos = SECCIONES.reserva

function armarMensaje({ tipo, nombre, cuando: fechaIso }) {
  const cuando = fechaIso ? fechaIso.split('-').reverse().join('/') : ''
  const elegido = TIPOS.find((t) => t.id === tipo)
  const saludo = nombre ? `¡Hola Sol! Soy ${nombre}.` : '¡Hola Sol!'
  return `${saludo} ${elegido.mensaje}${cuando ? ` para el ${cuando}` : ''}.`
}

// Consultas que no son una compra directa: catálogo, rediseño, regalos.
export default function Reserva({ whatsapp }) {
  const [tipo, setTipo] = useState(TIPOS[0].id)
  const [nombre, setNombre] = useState('')
  const [cuando, setCuando] = useState('')
  const [copiado, setCopiado] = useState(false)

  const mensaje = armarMensaje({ tipo, nombre: nombre.trim(), cuando })
  const enlace = enlaceWhatsapp(whatsapp, mensaje)

  async function copiar() {
    try {
      await navigator.clipboard.writeText(mensaje)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch {
      /* el portapapeles puede no estar disponible */
    }
  }

  return (
    <section id="reservar" className="seccion reserva">
      <div className="contenedor reserva-grilla">
        <div>
          <p className="etiqueta etiqueta-clara">{textos.etiqueta}</p>
          <h2>{textos.titulo}</h2>
          <p className="reserva-bajada">{textos.bajada}</p>
          <ol className="pasos">
            {textos.pasos.map((p) => <li key={p}>{p}</li>)}
          </ol>
          <p className="reserva-nota">{textos.nota}</p>
        </div>

        <form className="formulario" onSubmit={(e) => e.preventDefault()}>
          <fieldset>
            <legend>¿Qué estás buscando?</legend>
            <div className="opciones">
              {TIPOS.map((t) => (
                <label key={t.id} className={tipo === t.id ? 'opcion activa' : 'opcion'}>
                  <input type="radio" name="tipo" value={t.id} checked={tipo === t.id} onChange={() => setTipo(t.id)} />
                  {t.nombre}
                </label>
              ))}
            </div>
          </fieldset>

          <label className="campo">
            Tu nombre
            <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Cómo te llamás" autoComplete="given-name" />
          </label>

          <label className="campo">
            {textos.fecha}
            <input type="date" value={cuando} onChange={(e) => setCuando(e.target.value)} />
          </label>

          <div className="vista-previa">
            <p className="etiqueta">Tu mensaje</p>
            <p>{mensaje}</p>
          </div>

          {enlace ? (
            <a className="boton boton-ancho" href={enlace} target="_blank" rel="noreferrer">
              <Icono nombre="whatsapp" tamano={22} /> Enviar por WhatsApp
            </a>
          ) : (
            <>
              <button type="button" className="boton boton-ancho" onClick={copiar}>
                {copiado ? '¡Copiado!' : 'Copiar mensaje'}
              </button>
              <p className="aviso">Falta cargar el número de WhatsApp en el panel de administración.</p>
            </>
          )}
        </form>
      </div>
    </section>
  )
}
