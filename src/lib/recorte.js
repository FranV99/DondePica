// Recorte de geometrías por los límites de una comunidad autónoma.
// Funciona con coordenadas [lon, lat]. Se usa en el visor y en scripts/descargar-masas.mjs.
//
// Para que sea rápido con miles de ríos, cada región se prepara con una rejilla:
// las celdas totalmente dentro o fuera se resuelven al instante y solo en las celdas
// por las que pasa el límite se hacen los cálculos exactos.

import polygonClipping from './vendor/polygon-clipping.js'

const CELDA = 0.05 // grados

/** Prepara una región: { codigo, nombre, bbox, poligonos: [[anilloExterior, ...huecos], ...] } */
export function prepararRegion(r) {
  const anillos = r.poligonos.flat() // regla par-impar: los huecos también son anillos
  const [w, s, e, n] = r.bbox
  const nx = Math.ceil((e - w) / CELDA) + 1
  const ny = Math.ceil((n - s) / CELDA) + 1
  const bordes = new Map() // celda -> índices de aristas
  const aristas = []
  for (const a of anillos)
    for (let i = 0; i < a.length - 1; i++) {
      const p = a[i]
      const q = a[i + 1]
      const k = aristas.length
      aristas.push([p[0], p[1], q[0], q[1]])
      // celdas que toca la arista (recorriéndola en pasos pequeños)
      const pasos = Math.max(1, Math.ceil(Math.hypot(q[0] - p[0], q[1] - p[1]) / (CELDA / 3)))
      for (let t = 0; t <= pasos; t++) {
        const x = p[0] + ((q[0] - p[0]) * t) / pasos
        const y = p[1] + ((q[1] - p[1]) * t) / pasos
        for (const [dx, dy] of [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const cx = Math.floor((x - w) / CELDA) + dx
          const cy = Math.floor((y - s) / CELDA) + dy
          if (cx < 0 || cy < 0 || cx >= nx || cy >= ny) continue
          const c = cy * nx + cx
          if (!bordes.has(c)) bordes.set(c, new Set())
          bordes.get(c).add(k)
        }
      }
    }
  const reg = { ...r, anillos, aristas, bordes, nx, ny, estado: new Int8Array(nx * ny) }
  // estado de cada celda sin límite: 1 dentro, -1 fuera (por su centro). Se calcula por filas:
  // se buscan una sola vez los cruces del límite con la línea central de la fila y las celdas
  // quedan dentro o fuera según cuántos cruces tengan a su derecha (regla par-impar).
  for (let cy = 0; cy < ny; cy++) {
    const y = s + (cy + 0.5) * CELDA
    const xs = []
    for (const a of anillos)
      for (let i = 0, j = a.length - 1; i < a.length; j = i++) {
        const [xi, yi] = a[i]
        const [xj, yj] = a[j]
        if (yi > y !== yj > y) xs.push(((xj - xi) * (y - yi)) / (yj - yi) + xi)
      }
    xs.sort((p, q) => p - q)
    let k = 0 // cruces a la izquierda del centro de la celda
    for (let cx = 0; cx < nx; cx++) {
      const x = w + (cx + 0.5) * CELDA
      while (k < xs.length && xs[k] <= x) k++
      const c = cy * nx + cx
      if (bordes.has(c)) continue
      reg.estado[c] = (xs.length - k) % 2 === 1 ? 1 : -1
    }
  }
  return reg
}

function dentroExacto(reg, x, y) {
  let dentro = false
  for (const a of reg.anillos)
    for (let i = 0, j = a.length - 1; i < a.length; j = i++) {
      const [xi, yi] = a[i]
      const [xj, yj] = a[j]
      if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) dentro = !dentro
    }
  return dentro
}

/** ¿Está el punto [lon, lat] dentro de la región? */
export function dentro(reg, x, y) {
  const [w, s, e, n] = reg.bbox
  if (x < w || x > e || y < s || y > n) return false
  const c = Math.floor((y - s) / CELDA) * reg.nx + Math.floor((x - w) / CELDA)
  const st = reg.estado[c]
  if (st === 1) return true
  if (st === -1) return false
  return dentroExacto(reg, x, y)
}

/** Aristas del límite cercanas a un segmento */
function aristasCerca(reg, p, q) {
  const [w, s] = reg.bbox
  const res = new Set()
  const pasos = Math.max(1, Math.ceil(Math.hypot(q[0] - p[0], q[1] - p[1]) / (CELDA / 3)))
  for (let t = 0; t <= pasos; t++) {
    const x = p[0] + ((q[0] - p[0]) * t) / pasos
    const y = p[1] + ((q[1] - p[1]) * t) / pasos
    const c = Math.floor((y - s) / CELDA) * reg.nx + Math.floor((x - w) / CELDA)
    const b = reg.bordes.get(c)
    if (b) for (const k of b) res.add(k)
  }
  return res
}

/** Recorta una línea: devuelve los trozos que quedan dentro de la región */
export function recortarLinea(reg, pts) {
  const [w, s, e, n] = reg.bbox
  const trozos = []
  let actual = null
  const cerrar = () => {
    if (actual && actual.length > 1) trozos.push(actual)
    actual = null
  }
  for (let i = 0; i < pts.length - 1; i++) {
    const p = pts[i]
    const q = pts[i + 1]
    // segmento completamente fuera del rectángulo de la región
    if (Math.max(p[0], q[0]) < w || Math.min(p[0], q[0]) > e || Math.max(p[1], q[1]) < s || Math.min(p[1], q[1]) > n) {
      cerrar()
      continue
    }
    // cortes del segmento con el límite
    const ts = [0, 1]
    for (const k of aristasCerca(reg, p, q)) {
      const [ax, ay, bx, by] = reg.aristas[k]
      const d = (q[0] - p[0]) * (by - ay) - (q[1] - p[1]) * (bx - ax)
      if (Math.abs(d) < 1e-15) continue
      const t = ((ax - p[0]) * (by - ay) - (ay - p[1]) * (bx - ax)) / d
      const u = ((ax - p[0]) * (q[1] - p[1]) - (ay - p[1]) * (q[0] - p[0])) / d
      if (t > 0 && t < 1 && u >= 0 && u <= 1) ts.push(t)
    }
    ts.sort((a, b) => a - b)
    for (let j = 0; j < ts.length - 1; j++) {
      const t0 = ts[j]
      const t1 = ts[j + 1]
      if (t1 - t0 < 1e-12) continue
      const a = [p[0] + (q[0] - p[0]) * t0, p[1] + (q[1] - p[1]) * t0]
      const b = [p[0] + (q[0] - p[0]) * t1, p[1] + (q[1] - p[1]) * t1]
      const m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]
      if (dentro(reg, m[0], m[1])) {
        if (!actual) actual = [a]
        actual.push(b)
      } else cerrar()
    }
  }
  cerrar()
  return trozos
}

/**
 * Recorta un polígono (anillo exterior [lon, lat]) con la región.
 * Si está entero dentro se devuelve tal cual; si cruza el límite se calcula la intersección exacta.
 * Devuelve una lista de anillos.
 */
export function recortarAnillo(reg, anillo) {
  const fuera = []
  let algunoDentro = false
  for (const [x, y] of anillo) {
    if (dentro(reg, x, y)) algunoDentro = true
    else fuera.push(1)
  }
  const cruza = recortarLinea(reg, anillo).length !== 1 || fuera.length > 0
  if (!cruza) return [anillo]
  if (!algunoDentro && !recortarLinea(reg, anillo).length) return []
  try {
    const res = polygonClipping.intersection([anillo], reg.poligonos)
    return res.map((pol) => pol[0])
  } catch {
    return recortarLinea(reg, anillo).map((t) => [...t, t[0]])
  }
}

/** Comunidades (códigos) por las que pasa una geometría (lista de líneas o anillos) */
export function regionesDe(regiones, lineas) {
  const res = []
  for (const reg of regiones) {
    const [w, s, e, n] = reg.bbox
    let toca = false
    for (const l of lineas) {
      for (const [x, y] of l) {
        if (x < w || x > e || y < s || y > n) continue
        if (dentro(reg, x, y)) {
          toca = true
          break
        }
      }
      if (toca) break
    }
    if (toca) res.push(reg.codigo)
  }
  return res
}
