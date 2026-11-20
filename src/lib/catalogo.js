// Catálogo completo de masas de agua: las 66 revisadas (src/data/masas.js) más las
// generadas con "npm run datos" a partir de la hidrografía del IGN (public/data/masas/).
import { MASAS } from '../data/masas.js'
import { ESPECIES_POR_ID } from '../data/especies.js'
import { DEMARCACIONES } from '../data/demarcaciones.js'
import { especiesAuto } from './reglas.js'
import { especieIds, norm } from './util.js'
import { dentro, regionesDe } from './recorte.js'

const TIPOS_COD = { r: 'rio', a: 'arroyo', e: 'embalse', l: 'lago', g: 'laguna', b: 'balsa', h: 'humedal' }
const PERSIST = { P: 'permanente', E: 'estacional', I: 'intermitente' }

export const REVISADAS = MASAS.map((m) => ({ ...m, revisada: true, n: norm(m.nombre) }))
const REV_POR_ID = new Map(REVISADAS.map((m) => [m.id, m]))

let generadas = []
let genPorId = new Map()

/** Carga el índice generado (si existe). Devuelve el nº de masas cargadas. */
export async function cargarIndice() {
  try {
    const r = await fetch(`${import.meta.env.BASE_URL}data/masas/indice.json`)
    if (!r.ok) return { total: 0 }
    const j = await r.json()
    const dem = j.demarcaciones.map((c) => DEMARCACIONES[c])
    generadas = j.filas.map((f) => {
      const [id, nombre, t, d, s, lat, lon, zmin, zmax, jer, tam, per, w, so, e, n, mascara] = f
      const tipo = TIPOS_COD[t] || 'rio'
      const esCurso = tipo === 'rio' || tipo === 'arroyo'
      return {
        id, nombre, tipo, cuenca: dem[d], subcuenca: s >= 0 ? j.subcuencas[s] : null,
        punto: [lat, lon], zmin, zmax, elev: esCurso ? undefined : zmin, jer, persist: PERSIST[per] || null,
        longitud: esCurso ? tam : null, area: esCurso ? null : tam,
        bbox: [w, so, e, n], auto: true, n: norm(nombre),
        cc: mascara != null && j.ccaa ? j.ccaa.filter((_, i) => mascara & (1 << i)) : null,
      }
    })
    genPorId = new Map(generadas.map((m) => [m.id, m]))
    cacheEspecie.clear()
    return { total: generadas.length, generado: j.generado }
  } catch {
    return { total: 0 }
  }
}

export const todasGeneradas = () => generadas
export const masaPorId = (id) => REV_POR_ID.get(id) || genPorId.get(id) || null

/** Especies de una masa: [{...ficha, notaLocal}] y avisos */
const cacheAuto = new Map()
export function especiesDeMasa(m) {
  if (!m) return { especies: [], avisos: [] }
  if (m.revisada) {
    const especies = m.especies
      .map((e) => {
        const id = typeof e === 'string' ? e : e.id
        const f = ESPECIES_POR_ID[id]
        return f ? { ...f, notaLocal: typeof e === 'string' ? null : e.nota } : null
      })
      .filter(Boolean)
    return { especies, avisos: [] }
  }
  if (!cacheAuto.has(m.id)) {
    const { especies, avisos } = especiesAuto(m)
    cacheAuto.set(m.id, { especies: especies.map((e) => ({ ...ESPECIES_POR_ID[e.id], notaLocal: e.nota })), avisos })
    if (cacheAuto.size > 5000) cacheAuto.delete(cacheAuto.keys().next().value)
  }
  return cacheAuto.get(m.id)
}

/** Ids de las especies de una masa (rápido, para filtrar) */
function idsEspecies(m) {
  return m.revisada ? especieIds(m) : especiesAuto(m).especies.map((e) => e.id)
}

/** Índice especie -> Set(ids de masas), calculado de una vez para todo el catálogo */
let porEspecie = null
function indexarEspecies() {
  if (porEspecie) return porEspecie
  porEspecie = new Map()
  const add = (esp, id) => {
    if (!porEspecie.has(esp)) porEspecie.set(esp, new Set())
    porEspecie.get(esp).add(id)
  }
  for (const m of REVISADAS) for (const e of idsEspecies(m)) add(e, m.id)
  for (const m of generadas) for (const e of idsEspecies(m)) add(e, m.id)
  return porEspecie
}
const cacheEspecie = { clear: () => ((porEspecie = null), cacheConteoRegion?.clear()) }

/** Conjunto de ids de masas (revisadas y generadas) donde vive una especie */
export function masasConEspecie(especie) {
  if (!especie) return null
  return indexarEspecies().get(especie) || new Set()
}

/** Nº de masas de agua por especie */
export function conteoEspecies() {
  const idx = indexarEspecies()
  return Object.fromEntries([...idx].map(([k, v]) => [k, v.size]))
}

// ───────── comunidades autónomas ─────────
let geoRevisadas = {}
/** Geometría de las masas revisadas (para saber por qué comunidades pasan) */
export function setGeoRevisadas(geo) {
  geoRevisadas = geo || {}
  cacheRegion.clear()
  cacheCaja.clear()
}
function lineasGeo(g) {
  if (!g) return null
  if (g.type === 'LineString') return [g.coordinates]
  if (g.type === 'MultiLineString') return g.coordinates
  if (g.type === 'Polygon') return [g.coordinates[0]]
  if (g.type === 'MultiPolygon') return g.coordinates.map((p) => p[0])
  return null
}
/** Recuadro [oeste, sur, este, norte] de una masa (índice, trazado o, si no, su punto) */
const cacheCaja = new Map()
export function cajaMasa(m) {
  if (!m) return null
  if (m.bbox) return m.bbox
  if (!cacheCaja.has(m.id)) {
    const lineas = lineasGeo(geoRevisadas[m.id])
    let caja = null
    if (lineas) {
      caja = [Infinity, Infinity, -Infinity, -Infinity]
      for (const l of lineas)
        for (const [x, y] of l) {
          if (x < caja[0]) caja[0] = x
          if (y < caja[1]) caja[1] = y
          if (x > caja[2]) caja[2] = x
          if (y > caja[3]) caja[3] = y
        }
    } else if (m.punto) caja = [m.punto[1] - 0.05, m.punto[0] - 0.05, m.punto[1] + 0.05, m.punto[0] + 0.05]
    if (lineas || caja) cacheCaja.set(m.id, caja)
    return caja
  }
  return cacheCaja.get(m.id)
}

const cacheRegion = new Map()
/** Comunidades por las que pasa una masa de agua (lista de códigos) */
export function regionesDeMasa(m, regiones) {
  if (m.cc) return m.cc
  const k = m.id
  if (!cacheRegion.has(k)) {
    const lineas = lineasGeo(geoRevisadas[m.id]) || (m.punto ? [[[m.punto[1], m.punto[0]]]] : [])
    cacheRegion.set(k, regionesDe(regiones, lineas))
  }
  return cacheRegion.get(k)
}
/** ¿Pasa la masa por la región (preparada con prepararRegion)? */
export function enRegion(m, region) {
  if (!region) return true
  if (m.cc) return m.cc.includes(region.codigo)
  if (m.auto) return dentro(region, m.punto[1], m.punto[0]) // índice generado con una versión anterior
  const k = `${region.codigo}|${m.id}`
  if (!cacheRegion.has(k)) {
    const lineas = lineasGeo(geoRevisadas[m.id]) || (m.punto ? [[[m.punto[1], m.punto[0]]]] : [])
    cacheRegion.set(k, regionesDe([region], lineas).length > 0)
  }
  return cacheRegion.get(k)
}

/** Búsqueda por nombre en todo el catálogo */
export function buscar(texto, { tipos, cuenca, especie, region, limite = 200 } = {}) {
  const q = norm(texto.trim())
  const conEsp = masasConEspecie(especie)
  const ok = (m) =>
    (!q || m.n.includes(q)) && (!tipos?.size || tipos.has(m.tipo)) && (!cuenca || m.cuenca === cuenca) && (!conEsp || conEsp.has(m.id)) && enRegion(m, region)
  const res = []
  let total = 0
  for (const m of REVISADAS) if (ok(m)) { total++; if (res.length < limite) res.push(m) }
  // primero las que empiezan por el texto
  const empiezan = []
  const resto = []
  for (const m of generadas) {
    if (!ok(m)) continue
    total++
    if (res.length + empiezan.length >= limite) continue
    const core = m.n.replace(/^(rio|arroyo|embalse de|laguna de|lago de|balsa de|barranco de|rambla de|regato de|riu|riera de) /, '')
    if (q && core.startsWith(q)) empiezan.push(m)
    else if (resto.length < limite) resto.push(m)
  }
  const orden = (a, b) => (a.tipo === 'rio' ? 0 : a.tipo === 'embalse' ? 1 : 2) - (b.tipo === 'rio' ? 0 : b.tipo === 'embalse' ? 1 : 2) || (b.longitud || b.area || 0) - (a.longitud || a.area || 0)
  empiezan.sort(orden)
  resto.sort(orden)
  return { res: [...res, ...empiezan, ...resto].slice(0, limite), total }
}

/** Ids de masas que cumplen los filtros (para atenuar el resto en el mapa); null = sin filtros */
export function idsFiltrados({ tipos, cuenca, texto, especie, region }) {
  if (!tipos.size && !cuenca && !texto.trim() && !especie && !region) return null
  const q = norm(texto.trim())
  const conEsp = masasConEspecie(especie)
  const s = new Set()
  const ok = (m) => (!q || m.n.includes(q)) && (!tipos.size || tipos.has(m.tipo)) && (!cuenca || m.cuenca === cuenca) && (!conEsp || conEsp.has(m.id)) && enRegion(m, region)
  for (const m of REVISADAS) if (ok(m)) s.add(m.id)
  for (const m of generadas) if (ok(m)) s.add(m.id)
  return s
}

/** Nº de masas de agua por especie dentro de una comunidad autónoma (solo especies presentes) */
const cacheConteoRegion = new Map()
export function conteoEspeciesEnRegion(region) {
  if (!region) return null
  if (cacheConteoRegion.has(region.codigo)) return cacheConteoRegion.get(region.codigo)
  const enLaRegion = idsFiltrados({ tipos: new Set(), cuenca: '', texto: '', especie: null, region })
  const res = {}
  for (const [esp, ids] of indexarEspecies()) {
    let n = 0
    for (const id of ids) if (enLaRegion.has(id)) n++
    if (n) res[esp] = n
  }
  cacheConteoRegion.set(region.codigo, res)
  return res
}
