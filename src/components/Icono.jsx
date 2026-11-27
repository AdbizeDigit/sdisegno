// Ilustración de línea del manual: trazo parejo, puntas redondas, sin relleno, un solo color.
const TRAZOS = {
  copa: (
    <>
      <path d="M8 3h8l-.5 6a3.5 3.5 0 0 1-7 0L8 3Z" />
      <path d="M12 12.5V20M8.5 20.5h7" />
    </>
  ),
  pincel: (
    <>
      <path d="M19 4 10.5 12.5" />
      <path d="M10.5 12.5c-2 0-3.5 1.5-3.5 3.5 0 1.7-1 3-3 3.5 3 1.5 7.5 1 8.5-2.5.4-1.5-.2-3.2-2-4.5Z" />
    </>
  ),
  atril: (
    <>
      <rect x="6" y="3" width="12" height="10" rx="1.5" />
      <path d="M12 13v3M8 21l2.5-8M16 21l-2.5-8" />
    </>
  ),
  paleta: (
    <>
      <path d="M12 3a9 9 0 1 0 0 18c1.3 0 2-1 1.6-2.1-.5-1.3.4-2.4 1.7-2.4H18a3 3 0 0 0 3-3c0-5-4-10.5-9-10.5Z" />
      <circle cx="7.5" cy="11" r="1" />
      <circle cx="10" cy="7" r="1" />
      <circle cx="15" cy="7.5" r="1" />
    </>
  ),
  corazon: <path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10Z" />,
  destello: (
    <>
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4" />
      <path d="m6 6 2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18" />
    </>
  ),
  whatsapp: (
    <>
      <path d="M4 20l1.3-4A8 8 0 1 1 8 18.8L4 20Z" />
      <path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1-1.5-2-1-1 1c-1 0-2.5-1.5-2.5-2.5l1-1-1-2L9 9.5Z" />
    </>
  ),
  instagram: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17" cy="7" r=".6" />
    </>
  ),
}

export default function Icono({ nombre, tamano = 28 }) {
  return (
    <svg
      width={tamano}
      height={tamano}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {TRAZOS[nombre]}
    </svg>
  )
}
