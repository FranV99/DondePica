import { useEffect, useRef } from 'react'
import L from 'leaflet'
import { useMap } from 'react-leaflet'
import { CUENCAS } from '../data/masas.js'
import { masaPorId, todasGeneradas } from '../lib/catalogo.js'
import { TIPOS } from '../lib/util.js'
import { TRAZO_SUAVE } from '../lib/suavizar.js'
import { anilloNivel, lineaNivel, nivelDe } from '../lib/lod.js'
import { dibujarInsignia, TAMANO } from '../lib/iconosMapa.js'
import { TEMA } from '../lib/tema.js'
import { dentro, recortarAnillo, recortarLinea } from '../lib/recorte.js'

// Capa (en canvas, para que sea rápida) con las miles de masas de agua generadas desde el IGN.
//   zoom < 9  : red principal de ríos (general.json) y embalses grandes como puntos
//   zoom ≥ 9  : teselas con todos los ríos, arroyos y contornos de embalses, lagos y balsas
// Cada grupo se construye con el nivel de detalle de su zoom (src/lib/lod.js) y se guarda,
// para que al acercar y alejar no haya que volver a procesar nada.
const ZOOM_DETALLE = 9
const MAX_PUNTOS_ESPECIE = 8000
const MAX_GRUPOS = 90 // grupos de teselas ya construidos que se guardan
const MAX_DATOS = 160 // teselas descargadas que se guardan

// Marcador dibujado en el canvas con el icono de su tipo (embalse, lago, laguna, humedal,
// balsa, arroyo…). Hereda de CircleMarker para conservar el clic y el tooltip.
const MarcadorIcono = L.CircleMarker.extend({
  _updatePath() {
    const r = this._renderer
    if (!r._drawing || this._empty()) return
    const o = this.options
    dibujarInsignia(r._ctx, o.tipo, this._point.x, this._point.y, { tam: o.tam, color: o.fillColor, alfa: o.fillOpacity, sel: o.sel, resaltada: o.resaltada })
  },
})

// los arroyos son muchísimos: su icono solo aparece muy cerca
const ZOOM_ICONO_ARROYO = 12

function grosor(m) {
  if (!m) return 1.5
  if (m.tipo === 'arroyo') return 1.1
  return m.jer === 1 ? 3 : m.jer === 2 ? 2.4 : m.jer === 3 ? 1.9 : 1.5
}

export default function CapaMasas({ general, teselas, filtrados, conEspecie, region, seleccion, setSeleccion, listo }) {
  const map = useMap()
  const st = useRef(null)
  if (!st.current) {
    st.current = {
      renderer: L.canvas({ padding: 0.3, tolerance: 5 }),
      capas: new Map(), // id -> Set(layer)
      generales: new Map(), // nivel -> layerGroup (red general)
      grupos: new Map(), // "tesela|nivel" -> layerGroup
      datos: new Map(), // tesela -> datos descargados
      recortes: new Map(), // tesela o "general" -> geometría ya recortada a la comunidad
      pedidas: new Set(),
      puntos: L.layerGroup(),
      marcadores: new Map(), // id -> circleMarker
      nivel: null,
    }
  }
  const props = useRef({})
  props.current = { filtrados, conEspecie, seleccion, setSeleccion, region }

  // estilo de cada elemento según filtros y selección
  const estilo = (id, tipo) => {
    const { filtrados: f, conEspecie: ce, seleccion: sel } = props.current
    const m = masaPorId(id)
    const color = CUENCAS[m?.cuenca] || '#4a7fb5'
    const apagado = (f && !f.has(id)) || (ce && !ce.has(id))
    const destacado = ce && ce.has(id)
    if (tipo === 'punto') {
      const t = m?.tipo || 'lago'
      const base = TAMANO[t] || 18
      const tam = id === sel ? base + 8 : destacado ? base + 4 : base
      return { tipo: t, tam, radius: tam / 2, fillColor: color, fillOpacity: id === sel ? 1 : apagado ? 0.1 : 1, sel: id === sel, resaltada: !!destacado && id !== sel }
    }
    if (tipo === 'poligono') {
      if (id === sel) return { color: TEMA.seleccion, weight: 3, fillColor: color, fillOpacity: 0.6, opacity: 1 }
      return { color, weight: 1, fillColor: color, fillOpacity: apagado ? 0.03 : 0.45, opacity: apagado ? 0.07 : 0.9 }
    }
    const w = grosor(m)
    if (id === sel) return { color: TEMA.seleccion, weight: w + 4, opacity: 1 }
    return { color, weight: destacado ? w + 1.5 : w, opacity: apagado ? 0.05 : m?.tipo === 'arroyo' ? 0.7 : 0.9 }
  }

  const registrar = (id, capa, tipo) => {
    capa._vp = { id, tipo }
    const s = st.current
    if (!s.capas.has(id)) s.capas.set(id, new Set())
    s.capas.get(id).add(capa)
    capa.on('click', (e) => {
      L.DomEvent.stopPropagation(e)
      props.current.setSeleccion(id, e.latlng)
    })
    const m = masaPorId(id)
    if (m) capa.bindTooltip(`${m.nombre}<br><small>${TIPOS[m.tipo]?.singular || ''} · ${m.cuenca}</small>`, { sticky: tipo !== 'punto', direction: 'top', className: 'tt-oscuro' })
    return capa
  }
  const olvidarCapa = (c) => {
    const set = st.current.capas.get(c._vp?.id)
    if (set) {
      set.delete(c)
      if (!set.size) st.current.capas.delete(c._vp.id)
    }
  }
  const olvidar = (grupo) => grupo.eachLayer(olvidarCapa)

  // geometría de las masas generadas, recortada a la comunidad elegida (se calcula una vez)
  const recortada = (clave, d) => {
    const s = st.current
    if (s.recortes.has(clave)) return s.recortes.get(clave)
    const r = props.current.region
    const l = []
    const p = []
    for (const [id, lineas] of Object.entries(d.l || {})) {
      if (!masaPorId(id)?.auto) continue // las revisadas las dibuja su propia capa
      const ls = r ? lineas.flatMap((x) => recortarLinea(r, x)) : lineas
      if (ls.length) l.push([id, ls])
    }
    for (const [id, anillos] of Object.entries(d.p || {})) {
      if (!masaPorId(id)?.auto) continue
      const as = r ? anillos.flatMap((a) => recortarAnillo(r, a)) : anillos
      if (as.length) p.push([id, as])
    }
    const res = { l, p }
    s.recortes.set(clave, res)
    return res
  }

  // grupo de capas con el detalle de un nivel de zoom
  const construir = (clave, d, nivel) => {
    const s = st.current
    const { l, p } = recortada(clave, d)
    const g = L.layerGroup()
    for (const [id, lineas] of l) {
      const ls = lineas.map((x) => lineaNivel(x, nivel))
      g.addLayer(registrar(id, L.polyline(ls, { renderer: s.renderer, ...TRAZO_SUAVE, ...estilo(id, 'linea') }), 'linea'))
    }
    for (const [id, anillos] of p) {
      const as = anillos.map((a) => anilloNivel(a, nivel)).filter(Boolean)
      if (as.length) g.addLayer(registrar(id, L.polygon(as, { renderer: s.renderer, ...TRAZO_SUAVE, ...estilo(id, 'poligono') }), 'poligono'))
    }
    return g
  }

  // al cambiar de comunidad se descarta todo lo construido (los datos descargados se conservan)
  useEffect(() => {
    const s = st.current
    for (const g of [...s.generales.values(), ...s.grupos.values()]) {
      olvidar(g)
      map.removeLayer(g)
    }
    s.generales.clear()
    s.grupos.clear()
    s.recortes.clear()
    s.nivel = null
    if (listo) actualizar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [general, listo, region])

  // líneas y contornos según el zoom y la vista
  const actualizarCapas = () => {
    const s = st.current
    const z = map.getZoom()
    const nivel = nivelDe(z)
    const detalle = z >= ZOOM_DETALLE
    let nuevos = false // si se añaden líneas, los iconos deben volver a quedar encima
    s.nivel = nivel
    s.detalle = detalle

    // red general (zoom bajo)
    for (const [n, g] of s.generales) if (detalle || n !== nivel) map.removeLayer(g)
    if (!detalle && general) {
      if (!s.generales.has(nivel)) s.generales.set(nivel, construir('general', general, nivel))
      if (!map.hasLayer(s.generales.get(nivel))) nuevos = true
      map.addLayer(s.generales.get(nivel))
    }

    // teselas (zoom alto)
    const visibles = new Set()
    if (teselas && detalle) {
      const b = map.getBounds().pad(0.15)
      if (teselas.ext) {
        // cada tesela sabe hasta dónde llega lo que contiene (un embalse alargado puede
        // tener su centro en una tesela y extenderse por las vecinas)
        const [w, so, e, n] = [b.getWest(), b.getSouth(), b.getEast(), b.getNorth()]
        for (const [k, x] of Object.entries(teselas.ext)) if (x[0] <= e && x[2] >= w && x[1] <= n && x[3] >= so) visibles.add(k)
      } else {
        // datos generados con una versión anterior: margen de media tesela alrededor de la vista
        const t = teselas.tamano
        const m = t / 2
        const x0 = Math.floor((b.getWest() - m + 10) / t), x1 = Math.floor((b.getEast() + m + 10) / t)
        const y0 = Math.floor((b.getSouth() - m - 35) / t), y1 = Math.floor((b.getNorth() + m - 35) / t)
        for (let x = x0; x <= x1; x++) for (let y = y0; y <= y1; y++) if (teselas.set.has(`${x}_${y}`)) visibles.add(`${x}_${y}`)
      }
      for (const k of visibles) {
        if (s.datos.has(k)) {
          const clave = `${k}|${nivel}`
          if (!s.grupos.has(clave)) s.grupos.set(clave, construir(k, s.datos.get(k), nivel))
          if (!map.hasLayer(s.grupos.get(clave))) nuevos = true
          map.addLayer(s.grupos.get(clave))
          continue
        }
        if (s.pedidas.has(k)) continue
        s.pedidas.add(k)
        fetch(`${import.meta.env.BASE_URL}data/masas/t/${k}.json`)
          .then((r) => r.json())
          .then((d) => {
            s.datos.set(k, d)
            s.pedidas.delete(k)
            actualizarCapas()
          })
          .catch(() => s.pedidas.delete(k))
      }
    }
    for (const [clave, g] of s.grupos) {
      const [k, n] = clave.split('|')
      if (!visibles.has(k) || +n !== nivel) map.removeLayer(g)
    }
    if (nuevos) s.puntos.eachLayer((c) => c._map && c.bringToFront())
    // liberar memoria: primero los grupos que no se ven
    if (s.grupos.size > MAX_GRUPOS) {
      for (const [clave, g] of s.grupos) {
        if (map.hasLayer(g)) continue
        olvidar(g)
        s.grupos.delete(clave)
        if (s.grupos.size <= MAX_GRUPOS * 0.7) break
      }
    }
    if (s.datos.size > MAX_DATOS) {
      for (const k of s.datos.keys()) {
        if (visibles.has(k)) continue
        s.datos.delete(k)
        s.recortes.delete(k)
        if (s.datos.size <= MAX_DATOS * 0.7) break
      }
    }
  }

  // puntos de embalses, lagos, lagunas y balsas (y, con filtro de especie, de todo lo que coincide).
  // Solo se añaden y quitan los que cambian; los que siguen en pantalla se reutilizan.
  const actualizarPuntos = () => {
    const s = st.current
    const z = map.getZoom()
    const b = map.getBounds().pad(0.15)
    const { conEspecie: ce, seleccion: sel, region: r } = props.current
    const quiero = new Set()
    let n = 0
    for (const m of todasGeneradas()) {
      const curso = m.tipo === 'rio' || m.tipo === 'arroyo'
      let mostrar
      if (ce && z < ZOOM_DETALLE) mostrar = ce.has(m.id) && (n < MAX_PUNTOS_ESPECIE || m.tipo === 'rio' || m.tipo === 'embalse')
      else if (m.tipo === 'arroyo') mostrar = z >= ZOOM_ICONO_ARROYO
      else if (curso) mostrar = false
      else if (z >= ZOOM_DETALLE) mostrar = true
      else if (z >= 7) mostrar = m.tipo === 'embalse' && m.area >= 20
      else mostrar = m.tipo === 'embalse' && m.area >= 300
      if (m.id === sel) mostrar = true
      if (!mostrar || !b.contains(m.punto)) continue
      if (r && !dentro(r, m.punto[1], m.punto[0])) continue
      n++
      quiero.add(m.id)
    }
    for (const [id, c] of s.marcadores) {
      if (quiero.has(id)) continue
      s.puntos.removeLayer(c)
      olvidarCapa(c)
      s.marcadores.delete(id)
    }
    for (const id of quiero) {
      if (s.marcadores.has(id)) continue
      const m = masaPorId(id)
      const c = registrar(id, new MarcadorIcono(m.punto, { renderer: s.renderer, ...estilo(id, 'punto') }), 'punto')
      s.marcadores.set(id, c)
      s.puntos.addLayer(c)
    }
    map.addLayer(s.puntos)
  }

  const actualizar = () => {
    actualizarCapas()
    actualizarPuntos()
  }

  useEffect(() => {
    if (!listo) return
    // Al cruzar a otro nivel de detalle, los grupos del nivel anterior se quitan en el evento
    // "zoom", justo antes de que Leaflet reproyecte las capas (así no se proyecta en balde su
    // geometría); los del nivel nuevo se añaden al terminar el movimiento. Durante un vuelo
    // animado o un pellizco se espera a que termine.
    const alZoom = (e) => {
      if (e.flyTo || e.pinch) return
      const s = st.current
      const z = map.getZoom()
      const nivel = nivelDe(z)
      const detalle = z >= ZOOM_DETALLE
      if (nivel === s.nivel && detalle === s.detalle) return
      for (const [n, g] of s.generales) if (detalle || n !== nivel) map.removeLayer(g)
      for (const [clave, g] of s.grupos) if (!detalle || +clave.split('|')[1] !== nivel) map.removeLayer(g)
    }
    map.on('zoom', alZoom)
    map.on('moveend', actualizar)
    actualizar()
    return () => {
      map.off('zoom', alZoom)
      map.off('moveend', actualizar)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, teselas, listo])

  // reestilar al cambiar filtros o selección
  useEffect(() => {
    const s = st.current
    for (const [id, set] of s.capas)
      for (const c of set) {
        c.setStyle(estilo(id, c._vp.tipo))
        if (id === seleccion && c.bringToFront && c._map) c.bringToFront()
      }
    if (listo) actualizarPuntos()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtrados, conEspecie, seleccion])

  useEffect(
    () => () => {
      const s = st.current
      map.removeLayer(s.puntos)
      for (const g of [...s.generales.values(), ...s.grupos.values()]) map.removeLayer(g)
    },
    [map],
  )

  return null
}
