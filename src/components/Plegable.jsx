import { useState } from 'react'

/**
 * Contenido que se despliega y se pliega con una transición suave de altura y opacidad.
 * El contenido solo se monta la primera vez que se abre (para no dibujar listas largas
 * que nunca se ven) y se mantiene montado para poder animar el cierre.
 */
export default function Plegable({ abierto, className = '', children }) {
  const [montado, setMontado] = useState(abierto)
  if (abierto && !montado) setMontado(true) // se abre por primera vez
  return (
    <div className={`plegable ${abierto ? 'abierto' : ''} ${className}`} aria-hidden={!abierto} inert={!abierto}>
      <div className="plegable-dentro">{(montado || abierto) && children}</div>
    </div>
  )
}
