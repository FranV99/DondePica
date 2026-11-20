// Fotos de cebos y señuelos (Wikimedia Commons, licencias libres) y búsqueda de la foto que
// corresponde a cada texto de src/data/tecnicas.js.
import { useEffect, useState } from 'react'
import { norm } from '../lib/util.js'
import { FOTOS_CEBOS } from '../data/fotosCebos.js'

// fotos descargadas con "npm run cebos" (public/img/cebos/locales.json): se usan antes que las de internet
let locales = null
const cargarLocales = fetch(`${import.meta.env.BASE_URL}img/cebos/locales.json`)
  .then((r) => (r.ok ? r.json() : {}))
  .catch(() => ({}))
  .then((j) => (locales = j))
function useLocales() {
  const [l, setL] = useState(locales)
  useEffect(() => {
    if (!l) cargarLocales.then(setL)
  }, [l])
  return l
}
const urlDe = (tipo, l) => (l?.[tipo] ? `${import.meta.env.BASE_URL}img/cebos/${l[tipo]}` : FOTOS_CEBOS[tipo]?.url)

// palabra clave del texto -> ilustración (el orden importa: lo más concreto primero)
const REGLAS = [
  [/canutillo/, 'canutillo'],
  [/^mosca seca/, 'mosca_seca'],
  [/hormiga/, 'hormiga'],
  [/rana/, 'rana'],
  [/popper|superficie|stickbait/, 'popper'],
  [/spinnerbait/, 'spinnerbait'],
  [/crankbait/, 'crankbait'],
  [/ondulante/, 'ondulante'],
  [/cucharilla|cuchara/, 'cucharilla'],
  [/devon/, 'devon'],
  [/vinilo|texas|carolina|drop shot/, 'vinilo'],
  [/jig|cabeza plomada/, 'jig'],
  [/jerkbait|pez artificial|pececillo|minnow|imitacion/, 'minnow'],
  [/ninfa/, 'ninfa'],
  [/ahogada/, 'mosca_ahogada'],
  [/streamer|woolly|mosca.*(salmon|tubo|pelo|clasica)/, 'streamer'],
  [/mosca|efemera|tricoptero/, 'mosca_seca'],
  [/saltamontes|grillo/, 'saltamontes'],
  [/gusarapa/, 'gusarapa'],
  [/gusana/, 'gusana'],
  [/lombri/, 'lombriz'],
  [/masilla/, 'masa'],
  [/asticot|pinkies/, 'asticot'],
  [/maiz/, 'maiz'],
  [/tigernut/, 'tigernut'],
  [/boilie/, 'boilie'],
  [/pellet/, 'pellets'],
  [/fruta|cereza|higo/, 'fruta'],
  [/quisquilla|gamba/, 'quisquilla'],
  [/calamar/, 'calamar'],
  [/^pan\b|pan o masa/, 'pan'],
  [/masa/, 'masa'],
]

/** Ilustración para un texto de cebo o señuelo (o null si no hay ninguna) */
function cebo(texto) {
  const t = norm(texto)
  const r = REGLAS.find(([re]) => re.test(t))
  return r ? r[1] : null
}

/** Nombre corto (sin los detalles entre paréntesis) y detalle */
function partes(texto) {
  const m = texto.match(/^([^(]+?)\s*(\((.+)\))?$/)
  return m ? [m[1], m[3] || ''] : [texto, '']
}

/** Cuadrícula de cebos o señuelos con su foto */
export function GaleriaCebos({ textos }) {
  const l = useLocales()
  return (
    <ul className="cebos">
      {textos.map((t) => {
        const tipo = cebo(t)
        const foto = tipo && FOTOS_CEBOS[tipo]
        const [nombre, detalle] = partes(t)
        return (
          <li key={t} title={foto ? `${t}\nFoto: ${foto.autor} · ${foto.licencia} (Wikimedia Commons)` : t}>
            <div className="cebo-marco">
              {foto ? <FotoCebo src={urlDe(tipo, l)} alt={nombre} /> : <span className="cebo-sin">Sin foto</span>}
            </div>
            <span className="cebo-nombre">{nombre}</span>
            {detalle && <span className="cebo-detalle">{detalle}</span>}
          </li>
        )
      })}
    </ul>
  )
}

function FotoCebo({ src, alt }) {
  const [error, setError] = useState(false)
  if (error) return <span className="cebo-sin">No se pudo cargar la foto</span>
  // la foto se ve entera; los huecos se rellenan con la misma foto desenfocada (sin bandas)
  return (
    <>
      <span className="cebo-fondo" style={{ backgroundImage: `url("${src}")` }} aria-hidden />
      <img className="cebo-foto" src={src} alt={alt} loading="lazy" onError={() => setError(true)} />
    </>
  )
}

/** Créditos de las fotos de cebos que aparecen en una lista de modalidades */
export function CreditosCebos({ modalidades }) {
  const tipos = [...new Set(modalidades.flatMap((m) => [...(m.senuelos || []), ...(m.cebos || [])]).map(cebo).filter(Boolean))]
  if (!tipos.length) return null
  return (
    <details className="cebos-creditos">
      <summary>Créditos de las fotos de cebos y señuelos</summary>
      <ul>
        {tipos.map((k) => {
          const f = FOTOS_CEBOS[k]
          return (
            <li key={k}>
              <a href={f.fuente} target="_blank" rel="noreferrer">
                {k.replace('_', ' ')}
              </a>
              : {f.autor} · {f.licencia}
            </li>
          )
        })}
      </ul>
    </details>
  )
}
