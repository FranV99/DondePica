// Normativa aplicable a una especie en una comunidad autónoma
import { NORMATIVA } from '../data/normativa.js'
import { ESPECIES_POR_ID } from '../data/especies.js'
import { NO_PESCABLE } from '../data/tecnicas.js'
import { masaPorId, masasConEspecie, regionesDeMasa } from './catalogo.js'

const NO_OBJETO = { estado: 'prohibida', resumen: 'No es especie objeto de pesca. Si se captura por accidente, devolverla al agua de inmediato.' }

export const esExotica = (e) => e?.origen === 'exotica' || e?.origen === 'invasora'

/** Regla de una especie en una comunidad, con los tipos de tramo, normas generales y fuentes */
export function reglaEspecie(id, codigo) {
  const c = NORMATIVA[codigo]
  const e = ESPECIES_POR_ID[id]
  if (!c || !e) return null
  let r = c.especies[id]
  let propia = !!r
  if (!r) r = !esExotica(e) && NO_PESCABLE[id] ? NO_OBJETO : esExotica(e) ? c.porDefecto.exotica : c.porDefecto.autoctona
  return { ...r, propia, zonasDetalle: (r.zonas && c.zonas[r.zonas]) || [], generales: c.generales, norma: c.norma }
}

/** Comunidades donde el visor tiene masas de agua con la especie */
export function comunidadesConEspecie(id, regiones) {
  const res = new Set()
  if (!regiones?.length) return res
  const ids = masasConEspecie(id)
  if (!ids) return res
  for (const mid of ids) {
    const m = masaPorId(mid)
    if (!m) continue
    for (const c of regionesDeMasa(m, regiones)) res.add(c)
    if (res.size === regiones.length) break
  }
  return res
}
