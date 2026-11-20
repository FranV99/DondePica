// Búsqueda de localidades y municipios con el geocodificador de CartoCiudad (IGN), pensado
// para autocompletar. Primero se piden candidatos (sin coordenadas) y, al elegir uno, su
// geometría para encuadrarlo en el mapa.
const API = 'https://www.cartociudad.es/geocoder/api/geocoder'
const SIN = 'callejero,carretera,portal,refcatastral,expendeduria,ngbe,toponimo,punto_recarga_electrica'

const limpiar = (s) => (s || '').split('/')[0].trim()

/** Localidades y municipios cuyo nombre empieza o contiene el texto */
export async function buscarLocalidades(texto, signal) {
  const url = `${API}/candidates?q=${encodeURIComponent(texto)}&limit=15&no_process=${SIN}`
  const r = await fetch(url, { signal })
  if (!r.ok) throw new Error(`CartoCiudad ${r.status}`)
  const lista = await r.json()
  const res = []
  const vistos = new Set()
  // primero los núcleos de población, después los municipios que no estén ya
  for (const tipo of ['poblacion', 'Municipio']) {
    for (const c of lista) {
      if (c.type !== tipo) continue
      const nombre = tipo === 'poblacion' ? c.poblacion || c.address?.split(',')[0] : c.muni
      const provincia = limpiar(c.province)
      const clave = `${nombre}|${provincia}`.toLowerCase()
      if (!nombre || vistos.has(clave)) continue
      vistos.add(clave)
      const muni = c.muni && c.muni !== nombre ? `Municipio de ${c.muni} · ` : tipo === 'Municipio' ? 'Municipio · ' : ''
      res.push({ id: c.id, tipo, nombre, detalle: `${muni}${provincia}`, ccaa: limpiar(c.comunidadAutonoma) })
    }
  }
  return res.slice(0, 6)
}

/** Coordenadas y extensión de una localidad elegida: { nombre, lat, lng, bbox: [s, w, n, e] } */
export async function ubicarLocalidad(l) {
  const r = await fetch(`${API}/find?q=${encodeURIComponent(l.nombre)}&type=${l.tipo}&id=${encodeURIComponent(l.id)}`)
  if (!r.ok) throw new Error(`CartoCiudad ${r.status}`)
  const d = await r.json()
  let bbox = null
  if (d.geom) {
    // la geometría viene en WKT (lon lat): basta con recorrer sus números de dos en dos
    const nums = d.geom.match(/-?\d+(\.\d+)?/g)?.map(Number) || []
    let s = 90, w = 180, n = -90, e = -180
    for (let i = 0; i + 1 < nums.length; i += 2) {
      const [x, y] = [nums[i], nums[i + 1]]
      if (x < w) w = x
      if (x > e) e = x
      if (y < s) s = y
      if (y > n) n = y
    }
    if (n >= s && e >= w) bbox = [s, w, n, e]
  }
  const lat = d.lat || (bbox ? (bbox[0] + bbox[2]) / 2 : null)
  const lng = d.lng || (bbox ? (bbox[1] + bbox[3]) / 2 : null)
  if (lat == null || lng == null) throw new Error('Sin coordenadas')
  return { nombre: l.nombre, detalle: l.detalle, lat, lng, bbox }
}
