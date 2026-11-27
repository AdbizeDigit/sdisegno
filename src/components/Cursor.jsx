import { useEffect, useRef } from 'react'

// Cursor en forma de cuenta: sigue al puntero con suavidad y crece sobre lo que se puede tocar.
// Solo con mouse y si la persona no pidió menos movimiento.
export default function Cursor() {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    const fino = window.matchMedia('(pointer: fine)').matches
    const quieto = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!el || !fino || quieto) return

    document.documentElement.classList.add('con-cursor')
    let x = -100, y = -100, cx = x, cy = y, cuadro = 0

    function bucle() {
      cx += (x - cx) * 0.2
      cy += (y - cy) * 0.2
      el.style.transform = `translate3d(${cx}px, ${cy}px, 0)`
      cuadro = Math.abs(x - cx) + Math.abs(y - cy) > 0.1 ? requestAnimationFrame(bucle) : 0
    }
    function mover(e) {
      x = e.clientX
      y = e.clientY
      const activo = e.target.closest?.('a, button, label, [role="button"]')
      el.classList.toggle('sobre', Boolean(activo))
      el.classList.toggle('foto', Boolean(e.target.closest?.('.ficha-foto')))
      if (!cuadro) cuadro = requestAnimationFrame(bucle)
    }
    const salir = () => el.classList.add('oculto')
    const entrar = () => el.classList.remove('oculto')

    window.addEventListener('pointermove', mover, { passive: true })
    document.addEventListener('pointerleave', salir)
    document.addEventListener('pointerenter', entrar)
    return () => {
      window.removeEventListener('pointermove', mover)
      document.removeEventListener('pointerleave', salir)
      document.removeEventListener('pointerenter', entrar)
      cancelAnimationFrame(cuadro)
      document.documentElement.classList.remove('con-cursor')
    }
  }, [])

  return (
    <div ref={ref} className="cursor" aria-hidden="true" style={{ transform: 'translate3d(-100px, -100px, 0)' }}>
      <span>Ver</span>
    </div>
  )
}
