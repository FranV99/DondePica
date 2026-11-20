#!/usr/bin/env node
// Descarga el trazado detallado de ríos y el contorno de embalses/lagos desde OpenStreetMap
// (API Overpass) y lo fusiona en public/data/geometria.json.
//
// Uso:  npm run geo:osm            (todas las masas)
//       npm run geo:osm -- ebro sau (solo las indicadas)
//
// Lo que no se encuentre en OSM conserva la geometría actual (Natural Earth) o el marcador.
// Requiere Node 18+ y conexión a internet. Tarda unos minutos: hace una consulta cada pocos
// segundos para respetar los límites del servidor público de Overpass.

import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { RIOS, AGUAS } from './consultas-osm.mjs'

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SALIDA = path.join(RAIZ, 'public', 'data', 'geometria.json')
const OVERPASS = process.env.OVERPASS_URL || 'https://overpass-api.de/api/interpreter'
const PAUSA_MS = Number(process.env.OVERPASS_PAUSA_MS ?? 3000)
const TOL_RIO = 0.002 // grados (~200 m)
const TOL_AGUA = 0.0005 // grados (~50 m)

const dormir = (ms) => new Promise((r) => setTimeout(r, ms))
const r4 = (x) => Math.round(x * 1e4) / 1e4

// Douglas-Peucker sobre [lon, lat]
export function simplificar(p, eps) {
  if (p.length < 3) return p
  let dmax = 0
  let idx = 0
  const [ax, ay] = p[0]
  const [bx, by] = p[p.length - 1]
  const dx = bx - ax
  const dy = by - ay
  const L = Math.hypot(dx, dy)
  for (let i = 1; i < p.length - 1; i++) {
    // en anillos cerrados (extremos iguales) se usa la distancia al extremo
    const d = L < 1e-12 ? Math.hypot(p[i][0] - ax, p[i][1] - ay) : Math.abs(dy * p[i][0] - dx * p[i][1] + bx * ay - by * ax) / L
    if (d > dmax) {
      dmax = d
      idx = i
    }
  }
  if (dmax > eps) {
    const a = simplificar(p.slice(0, idx + 1), eps)
    const b = simplificar(p.slice(idx), eps)
    return a.slice(0, -1).concat(b)
  }
  return [p[0], p[p.length - 1]]
}

const geomA = (g) => g.map((q) => [q.lon, q.lat])
const igual = (a, b) => a[0] === b[0] && a[1] === b[1]

// Une segmentos que comparten extremos (para formar anillos o líneas más largas)
export function unir(segmentos, cerrar = false) {
  const pend = segmentos.map((s) => s.slice())
  const res = []
  while (pend.length) {
    let actual = pend.shift()
    let cambiado = true
    while (cambiado) {
      cambiado = false
      for (let i = 0; i < pend.length; i++) {
        const s = pend[i]
        const ini = actual[0]
        const fin = actual[actual.length - 1]
        if (igual(fin, s[0])) actual = actual.concat(s.slice(1))
        else if (igual(fin, s[s.length - 1])) actual = actual.concat(s.slice(0, -1).reverse())
        else if (igual(ini, s[s.length - 1])) actual = s.concat(actual.slice(1))
        else if (igual(ini, s[0])) actual = s.slice(1).reverse().concat(actual)
        else continue
        pend.splice(i, 1)
        cambiado = true
        break
      }
    }
    if (cerrar) {
      if (actual.length >= 4 && igual(actual[0], actual[actual.length - 1])) res.push(actual)
    } else res.push(actual)
  }
  return res
}

const redondear = (l) => l.map(([x, y]) => [r4(x), r4(y)])

export function procesarRio(json) {
  const els = json.elements || []
  const rels = els.filter((e) => e.type === 'relation').sort((a, b) => (b.members?.length || 0) - (a.members?.length || 0))
  let segs = []
  let fuente = ''
  if (rels.length) {
    const r = rels[0]
    fuente = `relation/${r.id} ${r.tags?.name}`
    segs = r.members
      .filter((m) => m.type === 'way' && m.geometry && !/tributary|spring|mouth|side_stream/.test(m.role || ''))
      .map((m) => geomA(m.geometry))
  } else {
    const ways = els.filter((e) => e.type === 'way' && e.geometry)
    fuente = `${ways.length} ways`
    segs = ways.map((w) => geomA(w.geometry))
  }
  if (!segs.length) return { fuente, geom: null }
  const lineas = unir(segs).map((l) => redondear(simplificar(l, TOL_RIO)))
  return { fuente, geom: { type: 'MultiLineString', coordinates: lineas } }
}

export function procesarAgua(json, multiple = false) {
  const area = (e) => (e.bounds ? (e.bounds.maxlat - e.bounds.minlat) * (e.bounds.maxlon - e.bounds.minlon) : 0)
  const els = (json.elements || []).filter((e) => e.type !== 'node').sort((a, b) => area(b) - area(a))
  const elegidos = multiple ? els : els.slice(0, 1)
  const poligonos = []
  const fuentes = []
  for (const e of elegidos) {
    fuentes.push(`${e.type}/${e.id} ${e.tags?.name}`)
    if (e.type === 'way' && e.geometry) {
      const anillo = geomA(e.geometry)
      if (anillo.length >= 4) poligonos.push([anillo])
    } else if (e.type === 'relation') {
      const outer = e.members.filter((m) => m.type === 'way' && m.geometry && m.role !== 'inner').map((m) => geomA(m.geometry))
      const inner = e.members.filter((m) => m.type === 'way' && m.geometry && m.role === 'inner').map((m) => geomA(m.geometry))
      const anillosInner = unir(inner, true)
      for (const o of unir(outer, true)) poligonos.push([o, ...anillosInner])
    }
  }
  if (!poligonos.length) return { fuente: fuentes.join('; '), geom: null }
  const simpl = poligonos
    .map((p) => p.map((r) => redondear(simplificar(r, TOL_AGUA))).filter((r) => r.length >= 4))
    .filter((p) => p.length)
  return {
    fuente: fuentes.join('; '),
    geom: simpl.length === 1 ? { type: 'Polygon', coordinates: simpl[0] } : { type: 'MultiPolygon', coordinates: simpl },
  }
}

async function overpass(ql) {
  for (let intento = 1; intento <= 4; intento++) {
    try {
      const r = await fetch(OVERPASS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'DondePica/4.0' },
        body: 'data=' + encodeURIComponent(ql),
      })
      if (r.ok) return await r.json()
      console.warn(`   HTTP ${r.status}, reintento ${intento}…`)
    } catch (e) {
      console.warn(`   ${e.message}, reintento ${intento}…`)
    }
    await dormir(5000 * intento)
  }
  return null
}

async function main() {
  const filtro = new Set(process.argv.slice(2))
  const usar = (id) => !filtro.size || filtro.has(id)
  const geo = JSON.parse(await fs.readFile(SALIDA, 'utf8').catch(() => '{}'))
  let ok = 0
  let fallos = []

  for (const [id, bbox, re] of RIOS.filter(([id]) => usar(id))) {
    const rx = `^(R[ií]o |Riu |R[ií]u |el |l')?(${re})( ibaia)?$`
    const bb = bbox.join(',')
    process.stdout.write(`Río ${id}… `)
    let json = await overpass(`[out:json][timeout:180];relation["waterway"="river"]["name"~"${rx}",i](${bb});out geom;`)
    let res = json && procesarRio(json)
    if (!res?.geom) {
      await dormir(PAUSA_MS)
      json = await overpass(`[out:json][timeout:180];way["waterway"="river"]["name"~"${rx}",i](${bb});out geom;`)
      res = json && procesarRio(json)
    }
    if (res?.geom) {
      geo[id] = res.geom
      ok++
      console.log(`OK (${res.fuente}, ${res.geom.coordinates.length} tramos)`)
    } else {
      fallos.push(id)
      console.log('sin datos, se conserva la geometría actual')
    }
    await dormir(PAUSA_MS)
  }

  for (const [id, bbox, re] of AGUAS.filter(([id]) => usar(id))) {
    process.stdout.write(`Agua ${id}… `)
    const json = await overpass(`[out:json][timeout:180];nwr["natural"="water"]["name"~"${re}",i](${bbox.join(',')});out geom;`)
    const res = json && procesarAgua(json, id === 'ruidera')
    if (res?.geom) {
      geo[id] = res.geom
      ok++
      console.log(`OK (${res.fuente})`)
    } else {
      fallos.push(id)
      console.log('sin datos, se conserva el marcador')
    }
    await dormir(PAUSA_MS)
  }

  await fs.writeFile(SALIDA, JSON.stringify(geo))
  console.log(`\nGuardado ${path.relative(RAIZ, SALIDA)}: ${ok} geometrías actualizadas.`)
  if (fallos.length) console.log(`Sin resultado en OSM: ${fallos.join(', ')} (revisa el nombre o el bbox en scripts/consultas-osm.mjs)`)
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main()
