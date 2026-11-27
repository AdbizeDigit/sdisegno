import { useEffect, useRef, useState } from 'react'

// Video decorativo en loop. Si la persona pidió menos movimiento, queda la imagen fija.
export default function VideoFondo({ src, poster, className = '' }) {
  const ref = useRef(null)
  const [quieto] = useState(() => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)

  useEffect(() => {
    const video = ref.current
    if (!video || quieto) return
    // Solo reproduce cuando se ve, para no gastar batería.
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) video.play().catch(() => {})
      else video.pause()
    })
    obs.observe(video)
    return () => obs.disconnect()
  }, [quieto])

  if (quieto) return <img src={poster} alt="" className={className} aria-hidden="true" />

  return (
    <video
      ref={ref}
      className={className}
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      preload="none"
      aria-hidden="true"
    />
  )
}
