import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import { useMap } from 'react-leaflet'
import { cargarGeoZonas, CATEGORIAS_ZONA, COLOR_ZONA, fuentesEnCaja } from '../lib/zonas.js'
import { TEMA } from '../lib/tema.js'

// Capa (en canvas) con las zonas de pesca: refugios en rojo, tramos libres o sin muerte en verde
// y zonas controladas en ámbar. El trazado de cada comunidad se descarga solo cuando se ve.
export const ZOOM_ZONAS = 7

const escapar = (t) => String(t ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])

// El dibujo va en un canvas que no recibe el ratón (si no, taparía los clics a las masas de agua,
// que están en otro canvas por debajo); para pulsar las zonas hay una línea invisible en SVG,
// que solo capta el ratón justo encima del trazo.
function capaDeZona(z, g, renderer, clic) {
  const color = COLOR_ZONA[z.cat]
  const grupo = L.featureGroup()
  if (g.t === 'p') {
    L.polygon(g.c, { renderer, color, weight: 2, opacity: 0.95, fillColor: color, fillOpacity: 0.18, dashArray: z.cat === 'r' ? '6 4' : null, interactive: false }).addTo(grupo)
    L.polygon(g.c, { renderer: clic, weight: 6, opacity: 0, fillOpacity: 0 }).addTo(grupo)
  } else {
    // contorno oscuro + halo claro: se distingue sobre el río (aunque esté seleccionado) y sobre cualquier mapa base
    L.polyline(g.c, { renderer, color: '#2b2a22', weight: 10, opacity: 0.55, lineCap: 'round', lineJoin: 'round', interactive: false }).addTo(grupo)
    L.polyline(g.c, { renderer, color: '#fffaf0', weight: 8, opacity: 1, lineCap: 'round', lineJoin: 'round', interactive: false }).addTo(grupo)
    L.polyline(g.c, { renderer, color, weight: 5, opacity: 1, lineCap: 'round', lineJoin: 'round', interactive: false }).addTo(grupo)
    // los refugios llevan además unas marcas blancas, como una barrera
    if (z.cat === 'r') L.polyline(g.c, { renderer, color: '#fffaf0', weight: 2.5, opacity: 1, dashArray: '3 7', lineCap: 'butt', interactive: false }).addTo(grupo)
    // línea ancha invisible: más fácil de pulsar
    L.polyline(g.c, { renderer: clic, color: '#000', weight: 16, opacity: 0, lineCap: 'round', lineJoin: 'round' }).addTo(grupo)
  }
  return grupo
}

export default function CapaZonas({ tipos, idx, resaltadas, seleccionada, onEstado, onZona }) {
  const activo = tipos.size > 0
  const claveTipos = [...tipos].sort().join('')
  const map = useMap()
  const [vista, setVista] = useState(null)
  const [cargadas, setCargadas] = useState(() => new Map()) // cc → Map(id → geo)
  const grupos = useRef(new Map()) // `${cc}|${categoría}` → L.LayerGroup
  const resalte = useRef(null)
  const marcaSel = useRef(null)
  const renderer = useRef(null)
  const rendererSel = useRef(null)
  const clic = useRef(null)
  const onZonaRef = useRef(onZona)
  useEffect(() => {
    onZonaRef.current = onZona
  }, [onZona])

  // panel propio por encima de las masas de agua y por debajo de los marcadores
  if (!renderer.current) {
    if (!map.getPane('zonas-pesca')) map.createPane('zonas-pesca').style.zIndex = 450
    // el tramo seleccionado se marca por debajo de las zonas, como un halo del color de selección
    if (!map.getPane('zonas-pesca-sel')) map.createPane('zonas-pesca-sel').style.zIndex = 448
    rendererSel.current = L.canvas({ pane: 'zonas-pesca-sel', padding: 0.4 })
    renderer.current = L.canvas({ pane: 'zonas-pesca', padding: 0.4 })
    if (!map.getPane('zonas-pesca-clic')) map.createPane('zonas-pesca-clic').style.zIndex = 455
    clic.current = L.svg({ pane: 'zonas-pesca-clic', padding: 0.4 })
  }

  useEffect(() => {
    const leer = () => {
      const b = map.getBounds()
      setVista({ caja: [b.getWest(), b.getSouth(), b.getEast(), b.getNorth()], zoom: map.getZoom() })
    }
    leer()
    map.on('moveend', leer)
    return () => map.off('moveend', leer)
  }, [map])

  const visible = activo && idx && vista && vista.zoom >= ZOOM_ZONAS
  const ccVista = visible ? fuentesEnCaja(idx, vista.caja) : []
  const claveVista = ccVista.join(',')

  // descarga el trazado de las comunidades que se ven
  useEffect(() => {
    if (!claveVista) return
    let vivo = true
    for (const cc of claveVista.split(',')) {
      if (cargadas.has(cc)) continue
      cargarGeoZonas(cc).then((geo) => {
        if (vivo) setCargadas((m) => (m.has(cc) ? m : new Map(m).set(cc, geo)))
      })
    }
    return () => {
      vivo = false
    }
  }, [claveVista, cargadas])

  // estado para la leyenda: zoom insuficiente, cargando, etc.
  const pendientes = ccVista.filter((cc) => !cargadas.has(cc)).length
  const estado = !activo ? 'apagada' : !idx ? 'sin-datos' : !vista || vista.zoom < ZOOM_ZONAS ? 'lejos' : pendientes ? 'cargando' : ccVista.length ? 'ok' : 'fuera'
  useEffect(() => {
    onEstado?.(estado)
  }, [estado, onEstado])

  // construye (una vez) los grupos de cada comunidad, uno por tipo de zona, y muestra los elegidos
  useEffect(() => {
    if (!idx) return
    const enVista = new Set(visible ? ccVista : [])
    for (const [cc, geo] of cargadas) {
      if (!grupos.current.has(`${cc}|r`) && enVista.has(cc)) {
        const porCat = { r: L.layerGroup(), l: L.layerGroup(), c: L.layerGroup() }
        for (const z of idx.zonas) {
          if (z.cc !== cc || !porCat[z.cat]) continue
          const g = geo.get(z.id)
          if (!g) continue
          const capa = capaDeZona(z, g, renderer.current, clic.current)
          capa.bindTooltip(`<b>${escapar(z.nom || z.rio)}</b><br><small>${escapar(CATEGORIAS_ZONA[z.cat].corto)} · ${escapar(z.sub)}</small>`, { sticky: true, className: 'tt-oscuro' })
          // al pulsarla se abre el panel derecho con el agua a la que pertenece
          capa.on('click', (e) => {
            L.DomEvent.stopPropagation(e)
            capa.closeTooltip()
            onZonaRef.current?.(z, e.latlng)
          })
          capa.addTo(porCat[z.cat])
        }
        for (const [cat, grupo] of Object.entries(porCat)) grupos.current.set(`${cc}|${cat}`, grupo)
      }
      for (const cat of Object.keys(CATEGORIAS_ZONA)) {
        const grupo = grupos.current.get(`${cc}|${cat}`)
        if (!grupo) continue
        const ver = enVista.has(cc) && claveTipos.includes(cat)
        if (ver && !map.hasLayer(grupo)) grupo.addTo(map)
        if (!ver && map.hasLayer(grupo)) map.removeLayer(grupo)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, cargadas, visible, claveVista, claveTipos, map])

  // resalta las zonas de la masa de agua seleccionada
  const claveResalte = activo && resaltadas?.length ? resaltadas.filter((id) => claveTipos.includes(idx?.porId.get(id)?.cat)).join('|') : ''
  useEffect(() => {
    if (resalte.current) {
      map.removeLayer(resalte.current)
      resalte.current = null
    }
    if (!claveResalte || !idx) return
    const grupo = L.layerGroup()
    for (const id of claveResalte.split('|')) {
      const z = idx.porId.get(id)
      const g = z && cargadas.get(z.cc)?.get(id)
      if (!g) continue
      const opc = { renderer: renderer.current, color: COLOR_ZONA[z.cat], weight: 14, opacity: 0.28, lineCap: 'round', lineJoin: 'round', interactive: false, fill: false }
      ;(g.t === 'p' ? L.polygon(g.c, opc) : L.polyline(g.c, opc)).addTo(grupo)
    }
    grupo.addTo(map)
    resalte.current = grupo
  }, [claveResalte, idx, cargadas, map])

  // tramo seleccionado (pulsado en el mapa o desplegado en el panel): halo marcado
  const zSel = seleccionada && idx ? idx.porId.get(seleccionada) : null
  const geoSel = zSel ? cargadas.get(zSel.cc)?.get(zSel.id) : null
  useEffect(() => {
    // si la comunidad aún no está descargada (capa apagada o fuera de vista), se descarga
    if (!zSel || cargadas.has(zSel.cc)) return
    let vivo = true
    cargarGeoZonas(zSel.cc).then((geo) => {
      if (vivo) setCargadas((m) => (m.has(zSel.cc) ? m : new Map(m).set(zSel.cc, geo)))
    })
    return () => {
      vivo = false
    }
  }, [zSel, cargadas])
  useEffect(() => {
    if (marcaSel.current) {
      map.removeLayer(marcaSel.current)
      marcaSel.current = null
    }
    if (!geoSel) return
    const r = rendererSel.current
    const grupo = L.layerGroup()
    const base = { renderer: r, lineCap: 'round', lineJoin: 'round', interactive: false }
    if (geoSel.t === 'p') {
      L.polygon(geoSel.c, { ...base, color: TEMA.seleccion, weight: 5, opacity: 1, fillColor: TEMA.seleccion, fillOpacity: 0.12 }).addTo(grupo)
    } else {
      L.polyline(geoSel.c, { ...base, color: '#fffaf0', weight: 26, opacity: 0.9 }).addTo(grupo)
      L.polyline(geoSel.c, { ...base, color: TEMA.seleccion, weight: 20, opacity: 0.95 }).addTo(grupo)
      // si la capa de ese tipo está apagada, se dibuja también la zona para que se vea qué es
      if (!claveTipos.includes(zSel.cat)) L.polyline(geoSel.c, { ...base, color: COLOR_ZONA[zSel.cat], weight: 6, opacity: 1 }).addTo(grupo)
    }
    grupo.addTo(map)
    marcaSel.current = grupo
  }, [geoSel, zSel, claveTipos, map])

  // al desmontar, fuera todo
  useEffect(
    () => () => {
      for (const g of grupos.current.values()) map.removeLayer(g)
      if (resalte.current) map.removeLayer(resalte.current)
      if (marcaSel.current) map.removeLayer(marcaSel.current)
    },
    [map],
  )

  return null
}
