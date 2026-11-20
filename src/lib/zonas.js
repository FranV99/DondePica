// Zonas de pesca (refugios, tramos libres o sin muerte y zonas controladas) generadas con
// "npm run zonas" a partir de los datos abiertos de cada comunidad autónoma.
import { norm } from './util.js'

export const COLOR_ZONA = { r: '#b3362b', l: '#4c7d3a', c: '#d0921c' }
export const ORDEN_ZONA = ['r', 'l', 'c']
export const CATEGORIAS_ZONA = {
  r: { nombre: 'Refugio o reserva', corto: 'Refugio', desc: 'Pesca prohibida' },
  l: { nombre: 'Zona libre o sin muerte', corto: 'Libre / sin muerte', desc: 'Sin permiso especial; en muchas hay que devolver el pez' },
  c: { nombre: 'Zona controlada o acotada', corto: 'Controlada', desc: 'Cotos y tramos con permiso, cupos o normas propias' },
}

const base = () => import.meta.env.BASE_URL
let promesaIndice = null
let indice = null

/** Carga (una sola vez) el índice de zonas. Devuelve null si aún no se han descargado. */
export function cargarZonas() {
  if (!promesaIndice)
    promesaIndice = fetch(`${base()}data/zonas/indice.json`)
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (!j || !Array.isArray(j.zonas)) return null
        for (const z of j.zonas) z.k = [claveNombre(z.rio), claveNombre(z.nom)].filter(Boolean)
        indice = { ...j, porId: new Map(j.zonas.map((z) => [z.id, z])) }
        return indice
      })
      .catch(() => null)
  return promesaIndice
}
export const zonasCargadas = () => indice

const geoCache = new Map()
/** Trazado de las zonas de una comunidad: Map id → { t, c: [[ [lat, lng], … ], …] } */
export function cargarGeoZonas(cc) {
  if (!geoCache.has(cc))
    geoCache.set(
      cc,
      fetch(`${base()}data/zonas/${cc}.json`)
        .then((r) => (r.ok ? r.json() : {}))
        .then((j) => new Map(Object.entries(j).map(([id, g]) => [id, decodificar(g)])))
        .catch(() => new Map()),
    )
  return geoCache.get(cc)
}

// [t, [[x0, y0, dx, dy, …], …]] en cienmilésimas de grado → { t, c } en [lat, lng]
function decodificar([t, lineas]) {
  return {
    t,
    c: lineas.map((l) => {
      const r = new Array(l.length / 2)
      let x = 0
      let y = 0
      for (let i = 0; i < l.length; i += 2) {
        x += l[i]
        y += l[i + 1]
        r[i / 2] = [y / 1e5, x / 1e5]
      }
      return r
    }),
  }
}

// ───────── relación entre zonas y masas de agua ─────────
// "el Riu de la Noguera Ribagorçana" → "noguera ribagorcana"
const PREFIJOS =
  /^(el|la|els|les|los|las|l|lo|riu|rio|riera|rierol|torrent|arroyo|arroio|regato|reguero|barranco|barranc|bco|garganta|rambla|canal|embalse|embassament|pantano|panta|presa|lago|llac|estany|laguna|lagunas|charca|tramo|coto|vedado|refugio|refugi|aguas|captura y suelta|de|del|d|en|y)\s+/
export function claveNombre(t) {
  if (!t) return ''
  let s = norm(String(t))
    .replace(/["'’`´().,;:«»“”]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  let antes
  do {
    antes = s
    s = s.replace(PREFIJOS, '')
  } while (s !== antes)
  return s.length >= 3 ? s : ''
}
const contienePalabras = (texto, clave) => ` ${texto} `.includes(` ${clave} `)
const solapan = (a, b, m = 0.01) => a[0] - m <= b[2] && a[2] + m >= b[0] && a[1] - m <= b[3] && a[3] + m >= b[1]

/** ¿La zona corresponde a la masa? Toca su recuadro y nombra el mismo río o embalse. */
function coincide(z, clave, caja) {
  return !!clave && !!caja && solapan(z.b, caja) && z.k.some((k) => contienePalabras(k, clave) || contienePalabras(clave, k))
}

/** Zonas de pesca de una masa de agua. caja = [oeste, sur, este, norte]. */
export function zonasDeMasa(idx, masa, caja) {
  if (!idx || !masa || !caja) return []
  const clave = claveNombre(masa.nombre)
  return idx.zonas
    .filter((z) => coincide(z, clave, caja))
    .sort((a, b) => ORDEN_ZONA.indexOf(a.cat) - ORDEN_ZONA.indexOf(b.cat) || (a.nom || '').localeCompare(b.nom || '', 'es'))
}

/**
 * Masa de agua a la que pertenece una zona (o null si no está en el catálogo). Entre varias
 * candidatas gana la revisada, después la de nombre idéntico y después la que más se solapa.
 */
export function masaDeZona(z, masas, cajaDe) {
  let mejor = null
  let puntos = -Infinity
  for (const m of masas) {
    const clave = claveNombre(m.nombre)
    if (!clave || !z.k.some((k) => k.includes(clave) || clave.includes(k))) continue // filtro rápido
    const caja = cajaDe(m)
    if (!coincide(z, clave, caja)) continue
    const solape =
      Math.max(0, Math.min(z.b[2], caja[2]) - Math.max(z.b[0], caja[0])) * Math.max(0, Math.min(z.b[3], caja[3]) - Math.max(z.b[1], caja[1]))
    const p = (m.revisada ? 4 : 0) + (z.k.includes(clave) ? 2 : 0) + Math.min(1, solape * 100)
    if (p > puntos) {
      puntos = p
      mejor = m
    }
  }
  return mejor
}

/** Comunidades con datos cuyo recuadro toca la caja dada */
export function fuentesEnCaja(idx, caja) {
  if (!idx) return []
  return Object.entries(idx.fuentes || {})
    .filter(([, f]) => f.b && solapan(f.b, caja, 0))
    .map(([cc]) => cc)
}
