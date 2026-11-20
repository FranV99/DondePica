import { useState } from 'react'
import { FOTOS } from '../data/fotos.js'

// Silueta genérica para especies sin foto con licencia libre (o si la imagen no carga)
function Silueta({ texto }) {
  return (
    <div className="foto-vacia">
      <svg viewBox="0 0 120 60" aria-hidden>
        <path
          d="M8 30c14-17 40-23 66-12l18-12v48l-18-12C48 53 22 47 8 30Z"
          fill="currentColor"
          opacity="0.35"
        />
        <circle cx="24" cy="27" r="3" fill="currentColor" opacity="0.6" />
      </svg>
      <span>{texto}</span>
    </div>
  )
}

/** Foto de una especie. `credito` muestra autor y licencia debajo. */
export default function FotoEspecie({ especie, credito = false, className = '' }) {
  const foto = FOTOS[especie.id]
  const [error, setError] = useState(false)

  if (!foto || error) {
    return (
      <figure className={`foto ${className}`}>
        <Silueta texto={foto ? 'No se pudo cargar la foto' : 'Sin foto libre disponible'} />
        {credito && !foto && (
          <figcaption>
            <a href={`https://www.inaturalist.org/taxa/search?q=${encodeURIComponent(especie.cientifico)}`} target="_blank" rel="noreferrer">
              Buscar fotos en iNaturalist ↗
            </a>
          </figcaption>
        )}
      </figure>
    )
  }

  return (
    <figure className={`foto ${className}`}>
      {/* la foto se ve entera; los huecos laterales se rellenan con la misma foto desenfocada */}
      <div className="foto-marco">
        <span className="foto-fondo" style={{ backgroundImage: `url("${foto.url}")` }} aria-hidden />
        <img src={foto.url} alt={`${especie.comun} (${especie.cientifico})`} loading="lazy" onError={() => setError(true)} />
      </div>
      {credito && (
        <figcaption>
          Foto: {foto.autor} ·{' '}
          <a href={foto.fuente} target="_blank" rel="noreferrer">
            {foto.licencia}
          </a>
        </figcaption>
      )}
    </figure>
  )
}
