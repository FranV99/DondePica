// Iconos de cada tipo de masa de agua. Una sola definición (trazados SVG en una caja de
// 24 × 24) para el mapa (dibujados en canvas), los marcadores de las masas revisadas, la
// leyenda y las listas.
//
// Cada icono es una insignia: una forma de fondo propia de cada tipo, rellena con el color
// de la cuenca, y un dibujo blanco encima.

const onda = (y) => `M3 ${y}c1.5-1.4 3-1.4 4.5 0s3 1.4 4.5 0 3-1.4 4.5 0 3 1.4 4.5 0`

/** Dibujos (trazo) de cada tipo, en una caja de 24 × 24 */
export const DIBUJOS = {
  rio: [onda(9), onda(15)],
  arroyo: [onda(12)],
  embalse: ['M15 4v16M15 4l5 2v14', 'M3 10c1.2-1 2.4-1 3.6 0s2.4 1 3.6 0 2.4-1 3.6 0', 'M3 15c1.2-1 2.4-1 3.6 0s2.4 1 3.6 0 2.4-1 3.6 0'],
  lago: ['M3 12a9 6 0 1 0 18 0a9 6 0 1 0 -18 0', 'M8 12c1.3-.9 2.7-.9 4 0s2.7.9 4 0'],
  laguna: ['M3 13a9 5 0 1 0 18 0a9 5 0 1 0 -18 0', 'M8 13c1.3-.9 2.7-.9 4 0s2.7.9 4 0'],
  humedal: ['M8 17V8M12 17V5M16 17V9', onda(19)],
  balsa: ['M6 6h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z', 'M7 12c1.7-1 3.3-1 5 0s3.3 1 5 0'],
}

/** Forma del fondo de la insignia de cada tipo */
export const FONDOS = {
  rio: 'M12 .8 23.2 12 12 23.2.8 12Z', // rombo
  arroyo: 'M12 .8 23.2 12 12 23.2.8 12Z', // rombo
  embalse: 'M5 1h14a4 4 0 0 1 4 4v14a4 4 0 0 1-4 4H5a4 4 0 0 1-4-4V5a4 4 0 0 1 4-4Z', // cuadrado redondeado
  lago: 'M12 1a11 11 0 1 0 0 22a11 11 0 1 0 0-22Z', // círculo
  laguna: 'M12 1.2c5.2 6 9.3 10.6 9.3 14.2a9.3 9.3 0 0 1-18.6 0c0-3.6 4.1-8.2 9.3-14.2Z', // gota
  humedal: 'M6.5 1.8h11L23 12l-5.5 10.2h-11L1 12Z', // hexágono
  balsa: 'M2.5 2.5h19v19h-19Z', // cuadrado
}

/** Tamaño en píxeles de cada icono en el mapa */
export const TAMANO = { embalse: 22, lago: 20, laguna: 19, humedal: 19, balsa: 17, arroyo: 17, rio: 18 }

// el dibujo ocupa el centro de la insignia
const ESCALA_DIBUJO = 0.68
const DESPL = (24 * (1 - ESCALA_DIBUJO)) / 2

/** SVG de la insignia (para marcadores HTML y la leyenda) */
export function svgInsignia(tipo, color, tam = TAMANO[tipo] || 18) {
  const t = DIBUJOS[tipo] ? tipo : 'lago'
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${tam}" height="${tam}" viewBox="-1.5 -1.5 27 27">` +
    `<path d="${FONDOS[t]}" fill="${color}" stroke="#fff" stroke-width="1.8" stroke-linejoin="round"/>` +
    `<g transform="translate(${DESPL} ${DESPL}) scale(${ESCALA_DIBUJO})" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">` +
    DIBUJOS[t].map((d) => `<path d="${d}"/>`).join('') +
    '</g></svg>'
  )
}

// ───────── dibujo en canvas ─────────
let caminos = null
function caminosDe(tipo) {
  if (!caminos) {
    caminos = {}
    for (const t of Object.keys(DIBUJOS)) caminos[t] = { fondo: new Path2D(FONDOS[t]), dibujo: DIBUJOS[t].map((d) => new Path2D(d)) }
  }
  return caminos[tipo] || caminos.lago
}

/**
 * Dibuja una insignia centrada en (x, y).
 * opciones: { tam, color, alfa, sel (seleccionada), resaltada }
 */
export function dibujarInsignia(ctx, tipo, x, y, { tam, color, alfa = 1, sel = false, resaltada = false }) {
  const c = caminosDe(tipo)
  const k = tam / 24
  ctx.save()
  ctx.globalAlpha = alfa
  ctx.translate(x - tam / 2, y - tam / 2)
  ctx.scale(k, k)
  ctx.lineJoin = 'round'
  ctx.lineCap = 'round'
  if (sel || resaltada) {
    // halo: coral si está seleccionada, oscuro si coincide con el filtro de especie
    ctx.strokeStyle = sel ? '#8f3a28' : 'rgba(38, 53, 43, 0.75)'
    ctx.lineWidth = sel ? 7 : 5
    ctx.stroke(c.fondo)
  } else {
    ctx.strokeStyle = 'rgba(38, 53, 43, 0.35)'
    ctx.lineWidth = 4
    ctx.stroke(c.fondo)
  }
  ctx.fillStyle = color
  ctx.fill(c.fondo)
  ctx.strokeStyle = '#fff'
  ctx.lineWidth = 1.8
  ctx.stroke(c.fondo)
  ctx.translate(DESPL, DESPL)
  ctx.scale(ESCALA_DIBUJO, ESCALA_DIBUJO)
  ctx.lineWidth = 2.6
  for (const d of c.dibujo) ctx.stroke(d)
  ctx.restore()
}
