// Suavizado de líneas y contornos con el algoritmo de Chaikin ("corte de esquinas"):
// cada vértice se sustituye por dos puntos al 25 % y 75 % de sus segmentos, de modo que
// los ángulos rectos se convierten en curvas. Funciona con [lat, lon] o [lon, lat].

/** Suaviza una línea abierta (conserva el primer y el último punto). */
export function suavizarLinea(pts, iteraciones = 2) {
  let p = pts
  for (let k = 0; k < iteraciones && p.length > 2; k++) {
    const q = [p[0]]
    for (let i = 0; i < p.length - 1; i++) {
      const [ax, ay] = p[i]
      const [bx, by] = p[i + 1]
      if (i > 0) q.push([0.75 * ax + 0.25 * bx, 0.75 * ay + 0.25 * by])
      if (i < p.length - 2) q.push([0.25 * ax + 0.75 * bx, 0.25 * ay + 0.75 * by])
    }
    q.push(p[p.length - 1])
    p = q
  }
  return p
}

/** Suaviza un anillo cerrado (contorno de embalse o lago). */
export function suavizarAnillo(pts, iteraciones = 2) {
  let p = pts.length > 1 && pts[0][0] === pts[pts.length - 1][0] && pts[0][1] === pts[pts.length - 1][1] ? pts.slice(0, -1) : pts
  if (p.length < 3) return pts
  for (let k = 0; k < iteraciones; k++) {
    const q = []
    for (let i = 0; i < p.length; i++) {
      const [ax, ay] = p[i]
      const [bx, by] = p[(i + 1) % p.length]
      q.push([0.75 * ax + 0.25 * bx, 0.75 * ay + 0.25 * by], [0.25 * ax + 0.75 * bx, 0.25 * ay + 0.75 * by])
    }
    p = q
  }
  return p
}

// Opciones comunes de dibujo: uniones y extremos redondeados, y sin re-simplificar
// las líneas al dibujarlas (smoothFactor bajo), que es lo que vuelve a crear picos.
export const TRAZO_SUAVE = { lineJoin: 'round', lineCap: 'round', smoothFactor: 0.25 }
