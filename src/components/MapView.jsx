import { useEffect, useMemo, useState } from 'react'
import L from 'leaflet'
import { MapContainer, TileLayer, LayerGroup, Polyline, Polygon, Marker, Tooltip, useMap, ScaleControl, Pane } from 'react-leaflet'
import { MASAS, CUENCAS } from '../data/masas.js'
import { TIPOS } from '../lib/util.js'
import { CENTRO, MAPAS_BASE } from '../lib/mapas.js'
import { masaPorId } from '../lib/catalogo.js'
import CapaMasas from './CapaMasas.jsx'
import CapaZonas from './CapaZonas.jsx'
import { suavizarAnillo, suavizarLinea, TRAZO_SUAVE } from '../lib/suavizar.js'
import { dentro, recortarAnillo, recortarLinea } from '../lib/recorte.js'
import { anilloNivel, lineaNivel, nivelDe } from '../lib/lod.js'
import { svgInsignia, TAMANO } from '../lib/iconosMapa.js'
import { FOTOS } from '../data/fotos.js'
import { ESPECIES_POR_ID } from '../data/especies.js'
import { TEMA } from '../lib/tema.js'

// Color de cada comunidad autónoma (las vecinas tienen colores bien distintos; se evita el
// coral, reservado para la comunidad seleccionada)
const COLOR_CCAA = {
  GA: '#1e88e5', AS: '#43a047', CB: '#8e24aa', PV: '#5c6bc0', NA: '#00897b',
  RI: '#c0ca33', CL: '#8d6e63', AR: '#3949ab', CT: '#7b1fa2', VC: '#00acc1',
  MC: '#7cb342', CM: '#ab47bc', MD: '#00838f', EX: '#26a69a', AN: '#1565c0',
}

const LIMITES = [
  [34.5, -11.5],
  [45.0, 5.5],
]

// GeoJSON -> posiciones Leaflet [lat, lon]
const aLatLng = (c) => [c[1], c[0]]
// se guardan por geometría, comunidad y nivel: al volver a un zoom ya visitado no se recalcula
const cachePos = new WeakMap()
function posiciones(g, region, nivel = 16) {
  if (!g) return null
  if (!cachePos.has(g)) cachePos.set(g, new Map())
  const c = cachePos.get(g)
  const k = `${region?.codigo || ''}|${nivel}`
  if (!c.has(k)) c.set(k, calcularPosiciones(g, region, nivel))
  return c.get(k)
}
function calcularPosiciones(g, region, nivel) {
  // los trazados se suavizan para que el agua no tenga ángulos rectos. Los del IGN son muy
  // detallados: se simplifican según el zoom (nivel de detalle) para que el mapa vaya fluido.
  const linea = g.ign ? (l) => lineaNivel(l, nivel) : (l) => suavizarLinea(l.map(aLatLng), 4)
  const anillo = g.ign ? (r) => anilloNivel(r, nivel) || suavizarAnillo(r.map(aLatLng), 2) : (r) => suavizarAnillo(r.map(aLatLng), 5)
  if (region) {
    // solo la parte dentro de la comunidad autónoma elegida
    if (g.type.includes('Line')) {
      const ls = g.type === 'LineString' ? [g.coordinates] : g.coordinates
      return ls.flatMap((l) => recortarLinea(region, l)).map(linea)
    }
    const pols = g.type === 'Polygon' ? [g.coordinates] : g.coordinates
    return pols.flatMap((p) => recortarAnillo(region, p[0])).map((r) => [anillo(r)])
  }
  if (g.type === 'LineString') return [linea(g.coordinates)]
  if (g.type === 'MultiLineString') return g.coordinates.map(linea)
  if (g.type === 'Polygon') return g.coordinates.map(anillo)
  if (g.type === 'MultiPolygon') return g.coordinates.map((p) => p.map(anillo))
  return null
}

// centro aproximado del contorno más grande (para colocar el marcador sobre el agua)
function centroide(pos) {
  const anillos = []
  const recorrer = (a) => (typeof a[0][0] === 'number' ? anillos.push(a) : a.forEach(recorrer))
  recorrer(pos)
  const mayor = anillos.reduce((m, a) => (a.length > m.length ? a : m), anillos[0])
  const n = mayor.length
  return [mayor.reduce((s, c) => s + c[0], 0) / n, mayor.reduce((s, c) => s + c[1], 0) / n]
}

function boundsDe(masa, geo, region) {
  if (masa.bbox) {
    let [w, s, e, n] = masa.bbox
    if (region) {
      // con una comunidad elegida, solo la parte de la masa que cae dentro
      const [rw, rs, re, rn] = region.bbox
      ;[w, s, e, n] = [Math.max(w, rw), Math.max(s, rs), Math.min(e, re), Math.min(n, rn)]
      if (w > e || s > n) return null
    }
    return L.latLngBounds([s, w], [n, e])
  }
  const pos = posiciones(geo[masa.id], region, 6)
  if (pos) {
    const pares = []
    const recorrer = (a) => (typeof a[0] === 'number' ? pares.push(a) : a.forEach(recorrer))
    recorrer(pos)
    const b = L.latLngBounds(pares)
    if (b.isValid()) return b
  }
  if (masa.punto && (!region || dentro(region, masa.punto[1], masa.punto[0]))) return L.latLngBounds([masa.punto, masa.punto]).pad(0.5)
  return null
}

const iconoCache = new Map()
// marcador de las masas revisadas: la misma insignia por tipo que el resto del mapa
function icono(masa, estado) {
  const key = `${masa.tipo}|${masa.cuenca}|${estado}`
  if (!iconoCache.has(key)) {
    const color = CUENCAS[masa.cuenca] || '#0f5c7a'
    const base = TAMANO[masa.tipo] || 18
    const tam = estado === 'sel' ? base + 8 : estado === 'hit' ? base + 4 : base
    const caja = tam + 6
    iconoCache.set(
      key,
      L.divIcon({
        className: '',
        html: `<span class="mk2 mk2-${estado}">${svgInsignia(masa.tipo, color, tam)}</span>`,
        iconSize: [caja, caja],
        iconAnchor: [caja / 2, caja / 2],
      }),
    )
  }
  return iconoCache.get(key)
}

// Avisa cuando el zoom pasa a otro nivel de detalle y, muy cerca, de la zona que se ve
const NIVEL_VISTA = 10
function SeguirVista({ setNivel, setVista }) {
  const map = useMap()
  useEffect(() => {
    const f = () => {
      const nivel = nivelDe(map.getZoom())
      setNivel(nivel)
      if (nivel < NIVEL_VISTA) return setVista(null)
      const b = map.getBounds().pad(0.5)
      setVista([b.getSouth(), b.getWest(), b.getNorth(), b.getEast()])
    }
    map.on('moveend', f)
    f()
    return () => map.off('moveend', f)
  }, [map, setNivel, setVista])
  return null
}

// Trozos de unos 120 puntos con su rectángulo, para dibujar solo los que se ven
const TROZO = 120
function trocear(lineas) {
  const res = []
  for (const l of lineas)
    for (let i = 0; i < l.length - 1; i += TROZO) {
      const t = l.slice(i, i + TROZO + 1)
      res.push({ t, b: rect(t) })
    }
  return res
}
function rect(pts) {
  let s = Infinity, w = Infinity, n = -Infinity, e = -Infinity
  const recorrer = (a) => {
    if (typeof a[0] === 'number') {
      if (a[0] < s) s = a[0]
      if (a[0] > n) n = a[0]
      if (a[1] < w) w = a[1]
      if (a[1] > e) e = a[1]
    } else a.forEach(recorrer)
  }
  recorrer(pts)
  return [s, w, n, e]
}
const enVista = (b, v) => !v || (b[0] <= v[2] && b[2] >= v[0] && b[1] <= v[3] && b[3] >= v[1])

// Centra el mapa en una masa elegida desde la lista o el buscador (no al pulsar en el mapa)
function Enfocar({ vuelo, geo, region }) {
  const map = useMap()
  useEffect(() => {
    if (!vuelo) return
    const masa = masaPorId(vuelo.id)
    const b = masa && boundsDe(masa, geo, region)
    if (!b) return
    // dejar sitio a los paneles (lateral a la izquierda, información a la derecha; en móvil, abajo)
    const { x, y } = map.getSize()
    const movil = x <= 800
    const izq = !movil && document.querySelector('.panel-lateral') ? 400 : 40
    const der = movil ? 40 : 460
    const abajo = movil ? Math.round(y * 0.62) : 40
    // no alejar si ya se está más cerca y la masa cabe en pantalla
    map.flyToBounds(b, { paddingTopLeft: [izq, 60], paddingBottomRight: [der, abajo], maxZoom: Math.max(10, map.getZoom()), duration: 0.8 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vuelo, map])
  return null
}

// Al filtrar por especie, encuadra todas las masas de agua donde vive
function EnfocarEspecie({ especie, conEspecie, geo, region }) {
  const map = useMap()
  useEffect(() => {
    if (!especie || !conEspecie || region) return // con una comunidad elegida, el mapa ya está encuadrado en ella
    let b = null
    for (const id of conEspecie) {
      const m = masaPorId(id)
      if (!m) continue
      const mb = m.auto ? L.latLngBounds([m.punto, m.punto]) : boundsDe(m, geo)
      if (mb) b = b ? b.extend(mb) : L.latLngBounds(mb.getSouthWest(), mb.getNorthEast())
    }
    if (b) map.flyToBounds(b, { paddingTopLeft: [map.getSize().x > 900 ? 400 : 40, 80], paddingBottomRight: [70, 40], maxZoom: 9, duration: 0.8 })
    // solo al cambiar de especie
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [especie, map])
  return null
}

// ───────── fotos del pez sobre las masas de agua donde vive ─────────
// Se dibuja como mucho una foto por celda de pantalla (para no amontonarlas); tienen
// preferencia las masas revisadas y las más grandes (embalses, lagos y ríos principales).
const PRIORIDAD_TIPO = { embalse: 0, lago: 1, rio: 2, laguna: 3, humedal: 4, arroyo: 5, balsa: 6 }
const CELDA_FOTO = [78, 64]
const MAX_FOTOS = 140
const escapar = (t) => String(t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
function miniatura(url) {
  return url.replace('/960px-', '/120px-').replace(/\/(medium|large)\.(jpe?g|png)/i, '/small.$2')
}
function puntoDe(m, geo, region) {
  if (m.punto) return m.punto
  const pos = posiciones(geo[m.id], region, 6)
  if (!pos) return null
  const pares = []
  const recorrer = (a) => (typeof a[0] === 'number' ? pares.push(a) : a.forEach(recorrer))
  recorrer(pos)
  return pares.length ? pares[Math.floor(pares.length / 2)] : null
}
function FotosEspecie({ especie, conEspecie, geo, region, setSeleccion }) {
  const map = useMap()
  // candidatos ordenados por importancia
  const candidatos = useMemo(() => {
    if (!especie || !conEspecie) return []
    const res = []
    for (const id of conEspecie) {
      const m = masaPorId(id)
      if (!m) continue
      const p = puntoDe(m, geo, region)
      if (!p || (region && !dentro(region, p[1], p[0]))) continue
      const prio = (m.revisada ? 0 : 10) + (PRIORIDAD_TIPO[m.tipo] ?? 7) + (m.jer ? m.jer * 0.1 : 0)
      res.push({ id, lat: p[0], lng: p[1], prio, nombre: m.nombre })
    }
    return res.sort((a, b) => a.prio - b.prio)
  }, [especie, conEspecie, geo, region])

  useEffect(() => {
    if (!candidatos.length) return
    if (!map.getPane('fotos-pez')) map.createPane('fotos-pez').style.zIndex = 640
    const capa = L.layerGroup().addTo(map)
    const e = ESPECIES_POR_ID[especie]
    const foto = FOTOS[especie]
    const silueta = '<svg viewBox="0 0 120 60" aria-hidden="true"><path d="M8 30c14-17 40-23 66-12l18-12v48l-18-12C48 53 22 47 8 30Z" fill="currentColor" opacity=".55"/></svg>'
    // si la miniatura falla se prueba la foto original y, si tampoco carga, se deja la silueta
    const imagen = foto
      ? `<img src="${escapar(miniatura(foto.url))}" alt="" loading="lazy" onerror="this.onerror=function(){this.parentNode.classList.add('sin-foto');this.remove()};this.src='${escapar(foto.url)}'" />${silueta}`
      : silueta
    const iconos = new Map()
    const dibujar = () => {
      capa.clearLayers()
      const b = map.getBounds().pad(0.1)
      const ocupadas = new Set()
      let n = 0
      for (const c of candidatos) {
        if (n >= MAX_FOTOS) break
        if (!b.contains([c.lat, c.lng])) continue
        const pt = map.latLngToContainerPoint([c.lat, c.lng])
        const celda = `${Math.floor(pt.x / CELDA_FOTO[0])}:${Math.floor(pt.y / CELDA_FOTO[1])}`
        if (ocupadas.has(celda)) continue
        ocupadas.add(celda)
        n++
        if (!iconos.has(c.id))
          iconos.set(
            c.id,
            L.divIcon({
              className: 'mk-pez-cont',
              html: `<span class="mk-pez ${foto ? '' : 'sin-foto'}" title="${escapar(`${e?.comun || ''} · ${c.nombre}`)}">${imagen}</span>`,
              iconSize: [48, 44],
              iconAnchor: [24, 52],
            }),
          )
        L.marker([c.lat, c.lng], { icon: iconos.get(c.id), pane: 'fotos-pez', keyboard: false, riseOnHover: true })
          .on('click', () => setSeleccion(c.id, L.latLng(c.lat, c.lng)))
          .addTo(capa)
      }
    }
    dibujar()
    map.on('moveend zoomend', dibujar)
    return () => {
      map.off('moveend zoomend', dibujar)
      capa.remove()
    }
  }, [candidatos, map, especie, setSeleccion])
  return null
}

// Pin de la localidad buscada
const ICONO_LUGAR = L.divIcon({ className: '', html: '<span class="pin-lugar"></span>', iconSize: [26, 34], iconAnchor: [13, 32] })

export default function MapView({ geo, filtrados, conEspecie, region, listaCcaa = [], seleccion, setSeleccion, vuelo, especie, base, setMapa, general, teselas, listo, lugar, quitarLugar, zonas }) {
  const [nivel, setNivel] = useState(() => nivelDe(window.innerWidth < 700 ? 5 : 6))
  const [vista, setVista] = useState(null)
  // geometría de las masas revisadas para el nivel de detalle actual
  const procesadas = useMemo(() => {
    const rios = []
    const aguas = []
    for (const m of MASAS) {
      const g = geo[m.id]
      if (m.tipo === 'rio' && g && g.type.includes('Line')) {
        const pos = posiciones(g, region, nivel)
        if (pos.length) rios.push({ m, trozos: trocear(pos) })
      } else {
        const pos = g && g.type.includes('Polygon') ? posiciones(g, region, nivel) : null
        if (pos && !pos.length) continue // el embalse queda fuera de la comunidad
        // marcador: en el centro del contorno (recortado) o en su punto, si cae dentro de la comunidad
        const punto = pos ? centroide(pos) : m.punto && (!region || dentro(region, m.punto[1], m.punto[0])) ? m.punto : null
        if (!pos && !punto) continue
        aguas.push({ m, pos, b: pos && rect(pos), punto })
      }
    }
    return { rios, aguas }
  }, [geo, region, nivel])
  // muy cerca, solo los trozos que caen cerca de la vista (un río entero tiene demasiados puntos)
  const capas = useMemo(() => {
    const v = nivel >= NIVEL_VISTA ? vista : null
    const rios = []
    for (const { m, trozos } of procesadas.rios) {
      const pos = trozos.filter((x) => enVista(x.b, v)).map((x) => x.t)
      if (pos.length) rios.push({ m, pos })
    }
    const aguas = procesadas.aguas.map((a) => (a.pos && !enVista(a.b, v) ? { ...a, pos: null } : a))
    return { rios, aguas }
  }, [procesadas, vista, nivel])

  // fronteras de todas las comunidades (se calculan una vez; si no, cada render las redibujaría)
  const fronteras = useMemo(() => listaCcaa.map((c) => ({ codigo: c.codigo, pos: c.poligonos.map((p) => p.map((a) => a.map(aLatLng))) })), [listaCcaa])
  // cada comunidad con su color: borde discontinuo y fondo del mismo color con poca opacidad
  const estilosFrontera = useMemo(() => {
    const res = {}
    for (const c of listaCcaa) {
      const color = COLOR_CCAA[c.codigo] || '#888'
      res[c.codigo] = { color, weight: 1.6, opacity: region ? 0.4 : 0.85, dashArray: '6 4', fill: true, fillColor: color, fillOpacity: region ? 0.05 : 0.14, lineJoin: 'round' }
    }
    return res
  }, [listaCcaa, region])

  // máscara que oscurece lo que queda fuera de la comunidad elegida
  const mascara = useMemo(() => {
    if (!region) return null
    const mundo = [[30, -20], [30, 10], [48, 10], [48, -20]]
    return [mundo, ...region.poligonos.flat().map((a) => a.map(aLatLng))]
  }, [region])

  const estadoDe = (id) => {
    if (id === seleccion) return 'sel'
    if ((filtrados && !filtrados.has(id)) || (conEspecie && !conEspecie.has(id))) return 'off'
    if (conEspecie && conEspecie.has(id)) return 'hit'
    return 'normal'
  }
  const mb = MAPAS_BASE[base] || MAPAS_BASE.topo_gris

  return (
    <div className="mapa">
      <MapContainer
        center={CENTRO}
        zoom={window.innerWidth < 700 ? 5 : 6}
        minZoom={5}
        maxBounds={LIMITES}
        maxBoundsViscosity={0.8}
        zoomControl={false}
        className="leaflet-root"
        ref={setMapa}
      >
        <TileLayer key={base} url={mb.url} attribution={mb.attr} className={mb.clase || ''} maxZoom={18} />

        {/* fronteras de todas las comunidades autónomas */}
        {fronteras.length > 0 && (
          <Pane name="fronteras-ccaa" style={{ zIndex: 340 }}>
            {fronteras.map((c) => (
              <Polygon key={c.codigo} positions={c.pos} interactive={false} pathOptions={estilosFrontera[c.codigo]} />
            ))}
          </Pane>
        )}

        {mascara && (
          <Pane name="mascara-ccaa" style={{ zIndex: 350 }}>
            {/* fuera de la comunidad: apenas atenuado */}
            <Polygon positions={mascara} interactive={false} pathOptions={{ stroke: false, fillColor: TEMA.tinta, fillOpacity: 0.16 }} />
            {/* dentro: un velo de color muy suave */}
            <Polygon positions={mascara.slice(1)} interactive={false} pathOptions={{ stroke: false, fillColor: TEMA.seleccion, fillOpacity: 0.08 }} />
            {/* frontera resaltada: halo claro + trazo coral continuo */}
            <Polygon positions={mascara.slice(1)} interactive={false} pathOptions={{ color: '#fff', weight: 8, opacity: 0.8, fill: false, lineJoin: 'round' }} />
            <Polygon positions={mascara.slice(1)} interactive={false} pathOptions={{ color: TEMA.seleccion, weight: 3.5, opacity: 1, fill: false, lineJoin: 'round' }} />
          </Pane>
        )}

        <LayerGroup>
          {capas.rios.map(({ m, pos }) => {
            const est = estadoDe(m.id)
            const color = CUENCAS[m.cuenca]
            return (
              <LayerGroup key={m.id}>
                {/* línea ancha invisible para facilitar el clic */}
                <Polyline positions={pos} pathOptions={{ color: '#000', opacity: 0, weight: 16, ...TRAZO_SUAVE }} eventHandlers={{ click: (e) => setSeleccion(m.id, e.latlng) }}>
                  <Tooltip sticky className="tt-oscuro">{m.nombre}</Tooltip>
                </Polyline>
                {est === 'sel' && (
                  <Polyline positions={pos} interactive={false} pathOptions={{ color: TEMA.seleccion, weight: 10, opacity: 0.9, ...TRAZO_SUAVE }} />
                )}
                <Polyline
                  positions={pos}
                  interactive={false}
                  pathOptions={{
                    color,
                    weight: est === 'sel' ? 4 : est === 'hit' ? 5 : 3.5,
                    opacity: est === 'off' ? 0.06 : 0.95,
                    ...TRAZO_SUAVE,
                  }}
                />
              </LayerGroup>
            )
          })}
        </LayerGroup>

        <LayerGroup>
          {capas.aguas.map(({ m, pos, punto }) => {
            const est = estadoDe(m.id)
            return (
              <LayerGroup key={m.id}>
                {pos && (
                  <Polygon
                    positions={pos}
                    pathOptions={{
                      color: est === 'sel' ? TEMA.seleccion : CUENCAS[m.cuenca],
                      weight: est === 'sel' ? 3 : 1.5,
                      fillOpacity: est === 'off' ? 0.03 : 0.45,
                      opacity: est === 'off' ? 0.07 : 1,
                      ...TRAZO_SUAVE,
                    }}
                    eventHandlers={{ click: (e) => setSeleccion(m.id, e.latlng) }}
                  />
                )}
                {punto && (
                  <Marker
                    position={punto}
                    icon={icono(m, est)}
                    zIndexOffset={est === 'sel' ? 1000 : est === 'hit' ? 500 : 0}
                    eventHandlers={{ click: (e) => setSeleccion(m.id, e.latlng) }}
                  >
                    <Tooltip direction="top" offset={[0, -8]} className="tt-oscuro">
                      {m.nombre}
                      <br />
                      <small>
                        {TIPOS[m.tipo].singular} · {m.cuenca}
                      </small>
                    </Tooltip>
                  </Marker>
                )}
              </LayerGroup>
            )
          })}
        </LayerGroup>
        {lugar && (
          <Marker
            key={`${lugar.lat},${lugar.lng}`}
            position={[lugar.lat, lugar.lng]}
            icon={ICONO_LUGAR}
            zIndexOffset={2000}
            title="Pulsa para quitar el marcador"
            eventHandlers={{ click: quitarLugar }}
          >
            <Tooltip permanent direction="top" offset={[0, -30]} className="tt-lugar">
              {lugar.nombre}
              {lugar.detalle && <small>{lugar.detalle}</small>}
            </Tooltip>
          </Marker>
        )}
        <SeguirVista setNivel={setNivel} setVista={setVista} />
        <ScaleControl position="bottomleft" imperial={false} />
        <Enfocar vuelo={vuelo} geo={geo} region={region} />
        <EnfocarEspecie especie={especie} conEspecie={conEspecie} geo={geo} region={region} />
        <FotosEspecie especie={especie} conEspecie={conEspecie} geo={geo} region={region} setSeleccion={setSeleccion} />
        {zonas && <CapaZonas tipos={zonas.tipos} idx={zonas.idx} resaltadas={zonas.resaltadas} seleccionada={zonas.seleccionada} onEstado={zonas.onEstado} onZona={zonas.onZona} />}
        <CapaMasas general={general} teselas={teselas} filtrados={filtrados} conEspecie={conEspecie} region={region} seleccion={seleccion} setSeleccion={setSeleccion} listo={listo} />
      </MapContainer>
    </div>
  )
}
