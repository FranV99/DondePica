// Niveles de detalle para dibujar miles de ríos y embalses sin que el mapa se vuelva lento.
//
// Leaflet vuelve a proyectar todos los vértices en cada cambio de zoom, así que lo que más
// cuesta es la cantidad de puntos. Para cada nivel de zoom se simplifica la geometría
// (Douglas-Peucker) hasta una tolerancia menor que un píxel y después se suaviza (Chaikin):
// a la vista queda igual, pero con muchos menos puntos cuando el mapa está alejado.
import { suavizarAnillo, suavizarLinea } from './suavizar.js'

/** Nivel de detalle que corresponde a un zoom (cada nivel cubre dos zooms). */
export function nivelDe(z) {
  if (z <= 6) return 6
  if (z <= 8) return 8
  if (z <= 10) return 10
  if (z <= 12) return 12
  if (z <= 14) return 14
  return 16
}

// medio píxel (en grados) en el zoom más cercano del nivel, teniendo en cuenta que en la
// latitud de España un grado de longitud ocupa menos que uno de latitud en Mercator
const pixel = (z) => (360 / (256 * 2 ** z)) * 0.78
const tolerancia = (nivel) => 0.55 * pixel(nivel)
// tras suavizar se quitan los puntos que se desvían menos de ~0,2 px: en los tramos casi rectos
// o en curvas diminutas el suavizado solo añade puntos que no se ven
const toleranciaFinal = (nivel) => 0.2 * pixel(nivel)
// pasadas de suavizado: con el mapa alejado apenas se aprecian, así que se ahorran puntos
const pasadasLinea = (nivel) => (nivel <= 8 ? 2 : 3)
const pasadasAnillo = (nivel) => (nivel <= 6 ? 2 : nivel <= 10 ? 3 : 4)

/** Douglas-Peucker iterativo sobre [x, y] (conserva extremos). Antes se descartan los puntos
 *  más cerca del anterior que la tolerancia, que es mucho más rápido y deja menos trabajo. */
export function simplificar(entrada, tol) {
  if (tol <= 0 || entrada.length < 3) return entrada
  const t2 = tol * tol
  const pts = [entrada[0]]
  let [px0, py0] = entrada[0]
  for (let i = 1; i < entrada.length - 1; i++) {
    const [x, y] = entrada[i]
    if ((x - px0) * (x - px0) + (y - py0) * (y - py0) > t2) {
      pts.push(entrada[i])
      px0 = x
      py0 = y
    }
  }
  pts.push(entrada[entrada.length - 1])
  const n = pts.length
  if (n < 3) return pts
  const marca = new Uint8Array(n)
  marca[0] = marca[n - 1] = 1
  const pila = [0, n - 1]
  while (pila.length) {
    const b = pila.pop()
    const a = pila.pop()
    const [ax, ay] = pts[a]
    const dx = pts[b][0] - ax
    const dy = pts[b][1] - ay
    const l2 = dx * dx + dy * dy
    let max = -1
    let idx = -1
    for (let i = a + 1; i < b; i++) {
      let px = pts[i][0] - ax
      let py = pts[i][1] - ay
      if (l2 > 0) {
        const t = Math.max(0, Math.min(1, (px * dx + py * dy) / l2))
        px -= t * dx
        py -= t * dy
      }
      const d = px * px + py * py
      if (d > max) {
        max = d
        idx = i
      }
    }
    if (max > t2) {
      marca[idx] = 1
      pila.push(a, idx, idx, b)
    }
  }
  const res = []
  for (let i = 0; i < n; i++) if (marca[i]) res.push(pts[i])
  return res
}

const aLatLng = (l) => l.map(([x, y]) => [y, x])

/** Línea [lon, lat] -> [lat, lon] simplificada y suavizada para un nivel */
export function lineaNivel(l, nivel) {
  return simplificar(suavizarLinea(aLatLng(simplificar(l, tolerancia(nivel))), pasadasLinea(nivel)), toleranciaFinal(nivel))
}

/** Anillo [lon, lat] -> [lat, lon] simplificado y suavizado; null si a ese zoom no se vería */
export function anilloNivel(a, nivel) {
  const tol = tolerancia(nivel)
  {
    // contornos de menos de ~1,5 píxeles: no merece la pena dibujarlos (ya hay un punto)
    let w = Infinity, s = Infinity, e = -Infinity, n = -Infinity
    for (const [x, y] of a) {
      if (x < w) w = x
      if (x > e) e = x
      if (y < s) s = y
      if (y > n) n = y
    }
    if (e - w < tol * 3 && n - s < tol * 3) return null
  }
  let p = simplificar(a, tol)
  if (p.length < 4) p = a // un anillo demasiado simplificado se deforma
  const r = suavizarAnillo(aLatLng(p), pasadasAnillo(nivel))
  r.push(r[0]) // cerrado, para que la simplificación final conserve el cierre
  const f = simplificar(r, toleranciaFinal(nivel))
  return f.length >= 4 ? f : r
}
