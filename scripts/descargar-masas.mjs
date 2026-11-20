#!/usr/bin/env node
// Descarga TODAS las masas de agua dulce con nombre de la España peninsular desde la
// API oficial de hidrografía del IGN/IDEE (https://api-features.idee.es) y genera los
// archivos que usa el visor en public/data/masas/.
//
//   npm run datos            ríos (jerarquías 1ª a 4ª), embalses, lagos, lagunas y balsas
//   npm run datos:arroyos    además, todos los arroyos con nombre (5ª y 6ª jerarquía; descarga MUY grande)
//   npm run datos:construir  solo regenera los archivos del visor con lo ya descargado
//
// Opciones: --reiniciar (borra lo descargado y empieza de cero)
//
// Es reanudable: si se corta, vuelve a ejecutar el mismo comando y continúa donde lo dejó.
// Necesita Node 18 o superior.

import fs from 'node:fs'
import fsp from 'node:fs/promises'
import path from 'node:path'
import readline from 'node:readline'
import { fileURLToPath } from 'node:url'
import { DEMARCACIONES } from '../src/data/demarcaciones.js'
import { MASAS } from '../src/data/masas.js'
import { prepararRegion, regionesDe } from '../src/lib/recorte.js'

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const CACHE = path.join(RAIZ, 'datos-descarga')
const SALIDA = path.join(RAIZ, 'public', 'data', 'masas')
const API = process.env.IDEE_API || 'https://api-features.idee.es'
const PAGINA = Number(process.env.IDEE_PAGINA || 2000)
const TESELA = 0.5 // grados

const args = new Set(process.argv.slice(2))
const dormir = (ms) => new Promise((r) => setTimeout(r, ms))
const r5 = (x) => Math.round(x * 1e5) / 1e5
const r4 = (x) => Math.round(x * 1e4) / 1e4
// identificador compacto y único: ES010HYWCSL0000002571880 -> 010_2571880
const idCorto = (id) => String(id).replace(/^ES/, '').replace(/HY[A-Z]+0*/, '_')

// ───────────────────────── utilidades geométricas ─────────────────────────

/** Douglas-Peucker sobre [lon, lat] (con anillos cerrados) */
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

const igual = (a, b) => a[0] === b[0] && a[1] === b[1]

/** Une líneas que comparten extremos */
export function unirLineas(lineas) {
  const pend = lineas.map((s) => s.slice())
  const res = []
  while (pend.length) {
    let act = pend.shift()
    let cambio = true
    while (cambio) {
      cambio = false
      for (let i = 0; i < pend.length; i++) {
        const s = pend[i]
        const ini = act[0]
        const fin = act[act.length - 1]
        if (igual(fin, s[0])) act = act.concat(s.slice(1))
        else if (igual(fin, s[s.length - 1])) act = act.concat(s.slice(0, -1).reverse())
        else if (igual(ini, s[s.length - 1])) act = s.concat(act.slice(1))
        else if (igual(ini, s[0])) act = s.slice(1).reverse().concat(act)
        else continue
        pend.splice(i, 1)
        cambio = true
        break
      }
    }
    res.push(act)
  }
  return res
}

/** Une líneas cuyos extremos están a menos de `max` grados, de la más cercana a la más lejana */
export function coserTramos(lineas, max) {
  let ls = lineas.map((l) => l.slice())
  const d = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1])
  for (;;) {
    let mejor = null
    for (let i = 0; i < ls.length; i++)
      for (let j = i + 1; j < ls.length; j++) {
        const A = ls[i], B = ls[j]
        const opciones = [
          [d(A[A.length - 1], B[0]), () => A.concat(B)],
          [d(A[A.length - 1], B[B.length - 1]), () => A.concat(B.slice().reverse())],
          [d(A[0], B[B.length - 1]), () => B.concat(A)],
          [d(A[0], B[0]), () => B.slice().reverse().concat(A)],
        ]
        for (const [dist, unir] of opciones) if (dist < max && (!mejor || dist < mejor.dist)) mejor = { dist, i, j, unir }
      }
    if (!mejor) return ls
    const nueva = mejor.unir()
    ls = ls.filter((_, k) => k !== mejor.i && k !== mejor.j).concat([nueva])
  }
}

function puntoEnAnillo(x, y, anillo) {
  let dentro = false
  for (let i = 0, j = anillo.length - 1; i < anillo.length; j = i++) {
    const [xi, yi] = anillo[i]
    const [xj, yj] = anillo[j]
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) dentro = !dentro
  }
  return dentro
}

const bboxDe = (coords) => {
  let w = Infinity, s = Infinity, e = -Infinity, n = -Infinity
  for (const [x, y] of coords) {
    if (x < w) w = x
    if (x > e) e = x
    if (y < s) s = y
    if (y > n) n = y
  }
  return [w, s, e, n]
}
const unirBbox = (a, b) => (a ? [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[2], b[2]), Math.max(a[3], b[3])] : b.slice())

class UnionFind {
  constructor(n) { this.p = Array.from({ length: n }, (_, i) => i) }
  find(i) { while (this.p[i] !== i) i = this.p[i] = this.p[this.p[i]]; return i }
  union(a, b) { a = this.find(a); b = this.find(b); if (a !== b) this.p[b] = a }
}

// ───────────────────────── descarga ─────────────────────────

async function pedir(url) {
  for (let intento = 1; intento <= 6; intento++) {
    try {
      const r = await fetch(url, { headers: { Accept: 'application/geo+json, application/json', 'User-Agent': 'DondePica/4.0 (proyecto abierto, uso educativo)' }, signal: AbortSignal.timeout(180000) })
      if (r.ok) return await r.json()
      console.warn(`\n   HTTP ${r.status}; reintento ${intento}/6…`)
    } catch (e) {
      console.warn(`\n   ${e.name === 'TimeoutError' ? 'Tiempo agotado' : e.message}; reintento ${intento}/6…`)
    }
    await dormir(4000 * intento)
  }
  throw new Error(`No se pudo descargar ${url}`)
}

async function leerProgreso() {
  try { return JSON.parse(await fsp.readFile(path.join(CACHE, 'progreso.json'), 'utf8')) } catch { return {} }
}
async function guardarProgreso(p) {
  await fsp.writeFile(path.join(CACHE, 'progreso.json'), JSON.stringify(p, null, 1))
}

const fmt = (n) => n.toLocaleString('es-ES')
function barra(nombre, hecho, total, t0, inicio) {
  const pct = total ? hecho / total : 0
  const ritmo = (hecho - inicio) / Math.max((Date.now() - t0) / 1000, 1) // elementos por segundo
  const resta = ritmo > 0 ? Math.max(1, Math.round((total - hecho) / ritmo / 60)) : '?'
  process.stdout.write(`\r   ${nombre}: ${fmt(Math.min(hecho, total))} / ${fmt(total)} (${(Math.min(pct, 1) * 100).toFixed(1)} %) · quedan ~${resta} min   `)
}

/** Descarga paginada de una colección, procesando cada página con `procesar(feature) -> registros[]` */
async function descargarColeccion({ clave, coleccion, filtro = '', props, archivo, procesar }) {
  const prog = await leerProgreso()
  if (prog[clave]?.terminado) {
    console.log(`✔ ${clave}: ya descargado`)
    return
  }
  let offset = prog[clave]?.offset || 0
  const base = `${API}/collections/${coleccion}/items?f=json&limit=${PAGINA}&properties=${props}${filtro}`
  const total = (await pedir(`${base}&limit=1&skipGeometry=true`)).numberMatched
  console.log(`↓ ${clave}: ${fmt(total)} elementos en el IGN${offset ? ` (continuando desde ${fmt(offset)})` : ''}`)
  const salida = fs.createWriteStream(path.join(CACHE, archivo), { flags: 'a' })
  const t0 = Date.now()
  const offset0 = offset
  while (offset < total) {
    const j = await pedir(`${base}&offset=${offset}`)
    const lineas = []
    for (const f of j.features || []) for (const reg of procesar(f)) lineas.push(JSON.stringify(reg))
    if (lineas.length) await new Promise((ok) => salida.write(lineas.join('\n') + '\n', ok))
    offset += j.numberReturned || (j.features || []).length || PAGINA
    prog[clave] = { offset }
    await guardarProgreso(prog)
    barra(clave, offset, total, t0, offset0)
    if (!j.numberReturned) break
  }
  salida.end()
  prog[clave] = { offset, terminado: true }
  await guardarProgreso(prog)
  console.log(`\n✔ ${clave}: completado`)
}

// ───────────────────────── procesado de cada elemento ─────────────────────────

const PENINSULA = Object.keys(DEMARCACIONES)

function lineasDe(g) {
  if (!g) return []
  if (g.type === 'LineString') return [g.coordinates]
  if (g.type === 'MultiLineString') return g.coordinates
  return []
}
function poligonosDe(g) {
  if (!g) return []
  if (g.type === 'Polygon') return [g.coordinates]
  if (g.type === 'MultiPolygon') return g.coordinates
  return []
}

function procesarCurso(f) {
  const p = f.properties || {}
  if (!p.nombre || !PENINSULA.includes(p.id_demarc)) return []
  const out = []
  let zmin = Infinity
  let zmax = -Infinity
  for (const l of lineasDe(f.geometry)) {
    for (const c of l) {
      const z = c[2]
      if (typeof z === 'number' && z > -100 && z < 4000) {
        if (z < zmin) zmin = z
        if (z > zmax) zmax = z
      }
    }
  }
  for (const l of lineasDe(f.geometry)) {
    const g = simplificar(l.map((c) => [r5(c[0]), r5(c[1])]), 0.0003)
    if (g.length < 2) continue
    out.push({
      i: idCorto(f.id),
      n: p.nombre.trim(),
      d: p.id_demarc,
      j: Number(String(p.jerarquia || '19004').slice(-1)) || 4,
      p: (p.persistd || '').charAt(0), // P(ermanente) E(stacional) I(ntermitente)
      l: Math.round(p.longitud || 0),
      z: Number.isFinite(zmin) ? [Math.round(zmin), Math.round(zmax)] : null,
      g,
    })
  }
  return out
}

function tipoAgua(tipo, nombre) {
  if (tipo === 'Embalse') return 'embalse'
  const n = nombre.toLowerCase()
  if (/^(balsa|bassa|basa|depósito|deposito)\b/.test(n)) return 'balsa'
  if (/^(charca|charco|poza)\b/.test(n)) return 'balsa'
  if (/^(embalse|pantano|encoro|embassament|pantà|azud|presa)\b/.test(n)) return 'embalse'
  if (/^(laguna|lagunas|llacuna|lagoa|lucio|lavajo|navajo|bodón)\b/.test(n)) return 'laguna'
  if (/^(marisma|marjal|tabla|tablas|aiguamoll|humedal|ullal)\b/.test(n)) return 'humedal'
  return 'lago'
}

function procesarAgua(f) {
  const p = f.properties || {}
  if (!p.nombre || !PENINSULA.includes(p.id_demarc)) return []
  const anillos = []
  for (const pol of poligonosDe(f.geometry)) {
    const ext = simplificar(pol[0].map((c) => [r5(c[0]), r5(c[1])]), 0.0002)
    if (ext.length >= 4) anillos.push(ext)
  }
  if (!anillos.length) return []
  return [{ i: idCorto(f.id), n: p.nombre.trim(), d: p.id_demarc, t: tipoAgua(p.tipo_aestd, p.nombre.trim()), e: p.elevacion ?? null, a: Math.round(p.area || 0), g: anillos }]
}

async function descargarCuencas() {
  const destino = path.join(CACHE, 'cuencas.json')
  if (fs.existsSync(destino)) return console.log('✔ cuencas: ya descargado')
  console.log('↓ cuencas hidrográficas (límites de subcuencas)…')
  const feats = []
  for (let offset = 0; ; offset += 20) {
    const j = await pedir(`${API}/collections/riverbasin/items?f=json&limit=20&offset=${offset}&properties=nombre,id_demarc`)
    feats.push(...(j.features || []))
    process.stdout.write(`\r   ${feats.length} / ${j.numberMatched}   `)
    if (!j.numberReturned || feats.length >= j.numberMatched) break
  }
  const cuencas = []
  for (const f of feats) {
    if (!f.properties.nombre || !PENINSULA.includes(f.properties.id_demarc)) continue
    const anillos = poligonosDe(f.geometry).map((pol) => simplificar(pol[0].map((c) => [r4(c[0]), r4(c[1])]), 0.002))
    cuencas.push({ n: f.properties.nombre, d: f.properties.id_demarc, b: bboxDe(anillos.flat()), g: anillos })
  }
  await fsp.writeFile(destino, JSON.stringify(cuencas))
  console.log(`✔ cuencas: ${cuencas.length} subcuencas con nombre`)
}

// ───────────────────────── construcción de los archivos del visor ─────────────────────────

const quitarTildes = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
const PREFIJOS = /^(rio|riu|rio de|riu de|rego|regato|arroyo|embalse del?|pantano del?|encoro d[eo]|embassament d[e']|panta d[e']|presa d[e']|lago d[e']|laguna d[e']|lagunas d[e']|estany d[e']|estanh d[e']|lac d[e']|l'|el|la|les|los|las)\s*/
export function nucleo(nombre) {
  let n = quitarTildes(nombre).replace(/[’`]/g, "'").trim()
  for (let k = 0; k < 3; k++) n = n.replace(PREFIJOS, '')
  return n.replace(/[^a-z0-9]+/g, ' ').trim()
}
const clase = (tipo) => (tipo === 'rio' || tipo === 'arroyo' ? 'curso' : tipo === 'embalse' ? 'embalse' : 'lago')

async function* leerNdjson(archivo) {
  const ruta = path.join(CACHE, archivo)
  if (!fs.existsSync(ruta)) return
  const rl = readline.createInterface({ input: fs.createReadStream(ruta), crlfDelay: Infinity })
  for await (const linea of rl) if (linea) yield JSON.parse(linea)
}

async function construir() {
  console.log('⚙ Construyendo los archivos del visor…')
  const cuencas = fs.existsSync(path.join(CACHE, 'cuencas.json')) ? JSON.parse(await fsp.readFile(path.join(CACHE, 'cuencas.json'), 'utf8')) : []
  const subcuencaDe = (lon, lat, d) => {
    for (const c of cuencas) {
      if (c.d !== d || lon < c.b[0] || lon > c.b[2] || lat < c.b[1] || lat > c.b[3]) continue
      if (c.g.some((a) => puntoEnAnillo(lon, lat, a))) return c.n
    }
    return null
  }

  // masas revisadas, para no duplicarlas y para darles la geometría detallada
  const revisadas = new Map()
  for (const m of MASAS) {
    const d = Object.entries(DEMARCACIONES).find(([, v]) => v === m.cuenca)?.[0]
    for (const nom of [m.nombre, ...(m.alias || [])]) revisadas.set(`${clase(m.tipo)}|${d}|${nucleo(nom)}`, m.id)
  }

  const entidades = [] // { id, nombre, tipo, d, sub, punto, zmin, zmax, jer, tam, per, bbox, lineas?, anillos?, rev }

  // ── cursos de agua ──
  const grupos = new Map()
  let nseg = 0
  for (const archivo of ['rios.ndjson', 'arroyos.ndjson']) {
    for await (const s of leerNdjson(archivo)) {
      const k = `${s.n}|${s.d}`
      if (!grupos.has(k)) grupos.set(k, [])
      grupos.get(k).push(s)
      nseg++
    }
  }
  console.log(`   ${fmt(nseg)} tramos de ríos y arroyos con nombre`)
  for (const segs of grupos.values()) {
    // tramos con el mismo nombre que no se tocan son ríos distintos
    const uf = new UnionFind(segs.length)
    const extremo = new Map()
    segs.forEach((s, i) => {
      for (const c of [s.g[0], s.g[s.g.length - 1]]) {
        const k = `${r4(c[0])},${r4(c[1])}`
        if (extremo.has(k)) uf.union(extremo.get(k), i)
        else extremo.set(k, i)
      }
    })
    const comp = new Map()
    segs.forEach((s, i) => {
      const r = uf.find(i)
      if (!comp.has(r)) comp.set(r, [])
      comp.get(r).push(s)
    })
    for (const partes of comp.values()) {
      let zmin = Infinity, zmax = -Infinity, jer = 4, lon = 0, perm = false, est = false, bbox = null, mayor = partes[0]
      for (const s of partes) {
        if (s.z) { zmin = Math.min(zmin, s.z[0]); zmax = Math.max(zmax, s.z[1]) }
        jer = Math.min(jer, s.j)
        lon += s.l
        if (s.p === 'P') perm = true
        if (s.p === 'E') est = true
        bbox = unirBbox(bbox, bboxDe(s.g))
        if (s.l > mayor.l) mayor = s
      }
      const medio = mayor.g[Math.floor(mayor.g.length / 2)]
      const km = lon / 1000
      const tipo = jer <= 3 || km >= 15 ? 'rio' : 'arroyo'
      const nombre = partes[0].n
      entidades.push({
        id: 'c' + mayor.i,
        nombre, tipo, d: partes[0].d,
        sub: subcuencaDe(medio[0], medio[1], partes[0].d),
        punto: [medio[1], medio[0]],
        zmin: Number.isFinite(zmin) ? zmin : null, zmax: Number.isFinite(zmax) ? zmax : null,
        jer, tam: Math.round(km * 10) / 10,
        per: perm ? 'P' : est ? 'E' : 'I',
        bbox, lineas: partes.map((s) => s.g),
        // solo ríos de cierta entidad pueden ser una masa revisada (evita confundir el Miño con un «Arroyo Miño»)
        rev: jer <= 3 ? revisadas.get(`curso|${partes[0].d}|${nucleo(nombre)}`) || null : null,
      })
    }
  }
  grupos.clear()

  // ── aguas estancadas ──
  const gAguas = new Map()
  for await (const a of leerNdjson('aguas.ndjson')) {
    const k = `${a.n}|${a.d}`
    if (!gAguas.has(k)) gAguas.set(k, [])
    gAguas.get(k).push({ ...a, b: bboxDe(a.g.flat()) })
  }
  for (const lista of gAguas.values()) {
    // polígonos con el mismo nombre y muy próximos forman una sola masa
    const uf = new UnionFind(lista.length)
    const m = 0.01
    for (let i = 0; i < lista.length; i++)
      for (let k = i + 1; k < lista.length; k++) {
        const A = lista[i].b, B = lista[k].b
        if (A[0] - m <= B[2] && B[0] - m <= A[2] && A[1] - m <= B[3] && B[1] - m <= A[3]) uf.union(i, k)
      }
    const comp = new Map()
    lista.forEach((a, i) => {
      const r = uf.find(i)
      if (!comp.has(r)) comp.set(r, [])
      comp.get(r).push(a)
    })
    for (const partes of comp.values()) {
      partes.sort((x, y) => y.a - x.a)
      const principal = partes[0]
      const anillos = partes.flatMap((p) => p.g)
      const ext = principal.g[0]
      const cx = ext.reduce((s, c) => s + c[0], 0) / ext.length
      const cy = ext.reduce((s, c) => s + c[1], 0) / ext.length
      const elevs = partes.map((p) => p.e).filter((e) => typeof e === 'number')
      const elev = elevs.length ? Math.min(...elevs) : null
      entidades.push({
        id: 'a' + principal.i,
        nombre: principal.n, tipo: principal.t, d: principal.d,
        sub: subcuencaDe(cx, cy, principal.d),
        punto: [r5(cy), r5(cx)],
        zmin: elev, zmax: elev, jer: 0,
        tam: Math.round(partes.reduce((s, p) => s + p.a, 0) / 1000) / 10, // hectáreas
        per: '', bbox: anillos.reduce((b, a) => unirBbox(b, bboxDe(a)), null), anillos,
        rev: revisadas.get(`${clase(principal.t)}|${principal.d}|${nucleo(principal.n)}`) || null,
      })
    }
  }
  gAguas.clear()
  console.log(`   ${fmt(entidades.length)} masas de agua (${fmt(entidades.filter((e) => e.rev).length)} coinciden con masas revisadas)`)

  // ── escritura ──
  await fsp.rm(SALIDA, { recursive: true, force: true })
  await fsp.mkdir(path.join(SALIDA, 't'), { recursive: true })

  const codigos = Object.keys(DEMARCACIONES)
  const subs = [...new Set(entidades.map((e) => e.sub).filter(Boolean))].sort()
  const TIPO = { rio: 'r', arroyo: 'a', embalse: 'e', lago: 'l', laguna: 'g', balsa: 'b', humedal: 'h' }
  // comunidades autónomas por las que pasa cada masa (máscara de bits según el orden de ccaa.json)
  const ccaa = JSON.parse(await fsp.readFile(path.join(RAIZ, 'public', 'data', 'ccaa.json'), 'utf8')).map(prepararRegion)
  const codigosCcaa = ccaa.map((r) => r.codigo)
  const mascara = (e) => regionesDe(ccaa, e.lineas || e.anillos).reduce((m, c) => m | (1 << codigosCcaa.indexOf(c)), 0)
  console.log('   asignando comunidades autónomas…')
  const filas = entidades
    .filter((e) => !e.rev)
    .map((e) => [e.id, e.nombre, TIPO[e.tipo], codigos.indexOf(e.d), e.sub ? subs.indexOf(e.sub) : -1, r4(e.punto[0]), r4(e.punto[1]), e.zmin, e.zmax, e.jer, e.tam, e.per, ...e.bbox.map((v) => Math.round(v * 1000) / 1000), mascara(e)])
  await fsp.writeFile(
    path.join(SALIDA, 'indice.json'),
    JSON.stringify({ generado: new Date().toISOString(), fuente: 'IGN · Hidrografía (api-features.idee.es)', demarcaciones: codigos, subcuencas: subs, ccaa: codigosCcaa, filas }),
  )

  // teselas de geometría
  const teselas = new Map()
  const tes = (lon, lat) => `${Math.floor((lon + 10) / TESELA)}_${Math.floor((lat - 35) / TESELA)}`
  const extension = new Map() // clave -> bbox real de lo que contiene (los contornos pueden salirse de la tesela)
  const anadir = (k, tipo, id, geom) => {
    if (!teselas.has(k)) teselas.set(k, { l: {}, p: {} })
    const t = teselas.get(k)[tipo]
    ;(t[id] ||= []).push(geom)
    extension.set(k, unirBbox(extension.get(k), bboxDe(geom)))
  }
  const general = { l: {}, p: {} }
  for (const e of entidades) {
    const id = e.rev || e.id
    if (e.lineas) {
      const porTesela = new Map()
      for (const l of e.lineas) {
        const c = l[Math.floor(l.length / 2)]
        const k = tes(c[0], c[1])
        if (!porTesela.has(k)) porTesela.set(k, [])
        porTesela.get(k).push(l.map(([x, y]) => [r4(x), r4(y)]))
      }
      for (const [k, ls] of porTesela) for (const l of unirLineas(ls)) anadir(k, 'l', id, l)
      if (e.jer <= 2 || e.rev) {
        // las masas revisadas (p. ej. el Miño) pueden venir en varios tramos: se acumulan todos,
        // y con más detalle porque son las que se ven a cualquier zoom
        const tol = e.rev ? 0.0006 : 0.003
        const ls = unirLineas(e.lineas.map((l) => l.map(([x, y]) => [r4(x), r4(y)]))).map((l) => simplificar(l, tol)).filter((l) => l.length > 1)
        general.l[id] = (general.l[id] || []).concat(ls)
      }
    } else if (e.anillos) {
      const k = tes(e.punto[1], e.punto[0])
      for (const a of e.anillos) anadir(k, 'p', id, a.map(([x, y]) => [r4(x), r4(y)]))
      if ((e.tipo === 'embalse' && e.tam >= 50) || e.rev) {
        const as = e.anillos.map((a) => simplificar(a.map(([x, y]) => [r4(x), r4(y)]), e.rev ? 0.0003 : 0.001)).filter((a) => a.length >= 4)
        general.p[id] = (general.p[id] || []).concat(as)
      }
    }
  }
  // los ríos revisados (p. ej. el Miño) suelen venir cortados donde atraviesan embalses:
  // se unen los tramos cuyos extremos están a menos de ~15 km para que se vea el río entero
  const revIds = new Set(MASAS.map((m) => m.id))
  for (const [id, lineas] of Object.entries(general.l)) if (revIds.has(id) && lineas.length > 1) general.l[id] = coserTramos(lineas, 0.15)

  for (const [k, t] of teselas) await fsp.writeFile(path.join(SALIDA, 't', `${k}.json`), JSON.stringify(t))
  await fsp.writeFile(path.join(SALIDA, 'general.json'), JSON.stringify(general))
  await fsp.writeFile(path.join(SALIDA, 'teselas.json'), JSON.stringify({ tamano: TESELA, teselas: [...teselas.keys()], ext: Object.fromEntries([...extension].map(([k, b]) => [k, b.map((v) => Math.round(v * 1000) / 1000)])) }))

  const n = (t) => fmt(entidades.filter((e) => e.tipo === t).length)
  console.log(`✔ Listo: ${n('rio')} ríos, ${n('arroyo')} arroyos, ${n('embalse')} embalses, ${n('lago')} lagos, ${n('laguna')} lagunas, ${n('humedal')} humedales y ${n('balsa')} balsas.`)
  console.log('  Arranca el visor con "npm.cmd run dev" (o recarga la página si ya estaba abierto).')
}

// ───────────────────────── principal ─────────────────────────

async function main() {
  if (args.has('--reiniciar')) await fsp.rm(CACHE, { recursive: true, force: true })
  await fsp.mkdir(CACHE, { recursive: true })

  if (!args.has('--solo-construir')) {
    console.log(`Fuente: ${API} (Instituto Geográfico Nacional)\n`)
    await descargarCuencas()
    await descargarColeccion({ clave: 'embalses y lagos', coleccion: 'standingwater', props: 'nombre,tipo_aestd,elevacion,area,id_demarc', archivo: 'aguas.ndjson', procesar: procesarAgua })
    for (const [j, nombre] of [['19001', 'ríos de 1ª jerarquía'], ['19002', 'ríos de 2ª jerarquía'], ['19003', 'ríos de 3ª y 4ª jerarquía']])
      await descargarColeccion({ clave: nombre, coleccion: 'watercourse', filtro: `&jerarquia=${j}`, props: 'nombre,id_demarc,jerarquia,persistd,longitud', archivo: 'rios.ndjson', procesar: procesarCurso })
    if (args.has('--arroyos'))
      await descargarColeccion({ clave: 'arroyos (5ª y 6ª jerarquía)', coleccion: 'watercourse', filtro: '&jerarquia=19004', props: 'nombre,id_demarc,jerarquia,persistd,longitud', archivo: 'arroyos.ndjson', procesar: procesarCurso })
  }
  await construir()
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((e) => {
    console.error('\n✖ Error:', e.message)
    console.error('  Vuelve a ejecutar el mismo comando para continuar donde se quedó.')
    process.exit(1)
  })
}
