// Descarga las zonas de pesca (refugios, tramos libres / sin muerte y zonas controladas)
// que publican como datos abiertos las comunidades autónomas y las guarda, normalizadas, en
//
//   public/data/zonas/indice.json   datos y normas de cada zona (sin geometría)
//   public/data/zonas/<CC>.json     trazado de las zonas de cada comunidad (se carga al verlas)
//
//   npm run zonas            todas las comunidades
//   npm run zonas -- CT MD   solo algunas (las demás se conservan de la descarga anterior)
//
// Si el servicio de una comunidad falla, se mantienen los datos que ya hubiera de ella.

import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { CATEGORIAS, FUENTES, codificar, normalizarCapa } from './zonas/normalizar.mjs'

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..')
const DIR = join(RAIZ, 'public', 'data', 'zonas')
const INDICE = join(DIR, 'indice.json')
const UA = 'DondePica/4.0 (mapa abierto de la pesca en España)'
const TOLERANCIA = 0.0001 // ≈10 m

const pedidas = process.argv.slice(2).map((s) => s.toUpperCase())
const fuentes = pedidas.length ? FUENTES.filter((f) => pedidas.includes(f.cc)) : FUENTES
if (!fuentes.length) {
  console.error(`No conozco esas comunidades. Disponibles: ${FUENTES.map((f) => f.cc).join(', ')}`)
  process.exit(1)
}

async function json(url, intentos = 3) {
  for (let i = 1; ; i++) {
    try {
      const r = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json' }, signal: AbortSignal.timeout(180000) })
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      const t = await r.text()
      if (!t.trimStart().startsWith('{')) throw new Error(`respuesta no JSON: ${t.slice(0, 160).replace(/\s+/g, ' ')}`)
      return JSON.parse(t)
    } catch (e) {
      if (i >= intentos) throw e
      await new Promise((ok) => setTimeout(ok, 2500 * i))
    }
  }
}

const kb = (n) => `${(n / 1024).toFixed(0)} KB`

let previo = null
try {
  previo = JSON.parse(await readFile(INDICE, 'utf8'))
} catch {
  /* primera descarga */
}
const zonasPrevias = new Map()
for (const z of previo?.zonas || []) {
  if (!zonasPrevias.has(z.cc)) zonasPrevias.set(z.cc, [])
  zonasPrevias.get(z.cc).push(z)
}
const infoFuentes = { ...(previo?.fuentes || {}) }
const nuevas = new Map()

await mkdir(DIR, { recursive: true })

for (const f of fuentes) {
  console.log(`\n${f.nombre} (${f.cc})`)
  const zonas = []
  let fallo = false
  for (const capa of f.capas) {
    process.stdout.write(`  · ${capa.id} … `)
    try {
      const fc = await json(capa.url)
      const z = normalizarCapa(f, capa, fc, TOLERANCIA)
      zonas.push(...z)
      console.log(`${z.length} zonas (de ${fc.features?.length ?? 0} elementos)`)
    } catch (e) {
      fallo = true
      console.log(`ERROR: ${e.message}`)
    }
  }
  if (fallo && zonasPrevias.has(f.cc)) {
    console.log(`  ! Ha fallado algún servicio: se conservan las ${zonasPrevias.get(f.cc).length} zonas anteriores`)
    continue
  }
  if (!zonas.length) {
    console.log('  ! Sin zonas: no se guarda nada de esta comunidad')
    continue
  }
  // ids únicos aunque el servicio repita elementos
  const vistos = new Map()
  for (const z of zonas) {
    const n = vistos.get(z.id) || 0
    vistos.set(z.id, n + 1)
    if (n) z.id = `${z.id}-${n}`
  }
  const geo = Object.fromEntries(zonas.map((z) => [z.id, codificar(z.g)]))
  const texto = JSON.stringify(geo)
  await writeFile(join(DIR, `${f.cc}.json`), texto)
  console.log(`  → zonas/${f.cc}.json (${kb(texto.length)})`)
  nuevas.set(
    f.cc,
    zonas.map(({ g, ...resto }) => ({ ...resto, t: g.t })),
  )
  const cajas = zonas.map((z) => z.b)
  infoFuentes[f.cc] = {
    nombre: f.nombre,
    organismo: f.organismo,
    web: f.web,
    licencia: f.licencia,
    fecha: new Date().toISOString().slice(0, 10),
    b: [Math.min(...cajas.map((b) => b[0])), Math.min(...cajas.map((b) => b[1])), Math.max(...cajas.map((b) => b[2])), Math.max(...cajas.map((b) => b[3]))],
  }
}

const porCc = new Map([...zonasPrevias, ...nuevas])
const todas = [...porCc.values()].flat()
const indice = { generado: new Date().toISOString(), categorias: CATEGORIAS, fuentes: infoFuentes, zonas: todas }
const texto = JSON.stringify(indice)
await writeFile(INDICE, texto)

const cuenta = (cc, cat) => todas.filter((z) => z.cc === cc && (!cat || z.cat === cat)).length
console.log('\nResumen')
for (const cc of porCc.keys()) console.log(`  ${cc}: ${cuenta(cc)} zonas · ${cuenta(cc, 'r')} refugios · ${cuenta(cc, 'l')} libres · ${cuenta(cc, 'c')} controladas`)
console.log(`\nÍndice guardado en public/data/zonas/indice.json (${kb(texto.length)})`)
