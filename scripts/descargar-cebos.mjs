// Descarga las fotos de cebos y señuelos (Wikimedia Commons) a public/img/cebos/ para que el
// visor funcione sin conexión. Uso: npm run cebos
import { mkdir, writeFile } from 'node:fs/promises'
import { FOTOS_CEBOS } from '../src/data/fotosCebos.js'

const DESTINO = new URL('../public/img/cebos/', import.meta.url)
await mkdir(DESTINO, { recursive: true })

const locales = {}
for (const [clave, f] of Object.entries(FOTOS_CEBOS)) {
  const ext = (decodeURIComponent(f.url).match(/\.(jpe?g|png)$/i)?.[1] || 'jpg').toLowerCase()
  const nombre = `${clave}.${ext}`
  try {
    // Wikimedia pide identificarse con un User-Agent propio
    const r = await fetch(f.url, { headers: { 'User-Agent': 'DondePica/4.0 (proyecto abierto; descarga de fotos con licencia libre)' } })
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
    await writeFile(new URL(nombre, DESTINO), Buffer.from(await r.arrayBuffer()))
    locales[clave] = nombre
    console.log(`✓ ${nombre}`)
  } catch (e) {
    console.log(`✗ ${clave}: ${e.message} (se seguirá cargando desde internet)`)
  }
  await new Promise((res) => setTimeout(res, 300)) // sin saturar el servidor
}
await writeFile(new URL('locales.json', DESTINO), JSON.stringify(locales, null, 1))
console.log(`\n${Object.keys(locales).length} de ${Object.keys(FOTOS_CEBOS).length} fotos guardadas en public/img/cebos/`)
