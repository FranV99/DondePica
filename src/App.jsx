import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import MapView from './components/MapView.jsx'
import { CENTRO, MAPAS_BASE } from './lib/mapas.js'
import Navbar from './components/Navbar.jsx'
import PanelLateral from './components/PanelLateral.jsx'
import PanelInfo, { PanelZona } from './components/PanelInfo.jsx'
import FichaEspecie from './components/FichaEspecie.jsx'
import Contribuir from './components/Contribuir.jsx'
import { PROYECTO } from './lib/contribuir.js'
import { IcoAportar, IcoAtras, IcoCapas, IcoCerrar, IcoGithub, IcoLista, IcoMapa, IcoMas, IcoMenos, IcoMosca, Logo } from './components/Iconos.jsx'
import { ESPECIES_POR_ID, ORIGENES } from './data/especies.js'
import { cajaMasa, cargarIndice, idsFiltrados, masaPorId, masasConEspecie, regionesDeMasa, REVISADAS, setGeoRevisadas, todasGeneradas } from './lib/catalogo.js'
import { dentro, prepararRegion } from './lib/recorte.js'
import { ubicarLocalidad } from './lib/localidades.js'
import { cargarZonas, masaDeZona, ORDEN_ZONA, zonasDeMasa } from './lib/zonas.js'

const esMovil = () => window.matchMedia('(max-width: 800px)').matches

const CLAVE_ZONAS = 'dondepica-zonas'
// tipos de zona visibles en el mapa ('r', 'l', 'c'); '1' es el formato antiguo (todas)
const leerZonasTipos = () => {
  try {
    const v = localStorage.getItem(CLAVE_ZONAS) || ''
    return new Set(v === '1' ? ORDEN_ZONA : ORDEN_ZONA.filter((k) => v.includes(k)))
  } catch {
    return new Set()
  }
}

const CLAVE_BIENVENIDA = 'dondepica-bienvenida-vista'
const bienvenidaVista = () => {
  try {
    return localStorage.getItem(CLAVE_BIENVENIDA) === '1'
  } catch {
    return false
  }
}

/** Tarjeta de bienvenida (solo la primera visita) */
function Bienvenida({ cerrar, contribuir }) {
  const fin = (fn) => () => {
    try {
      localStorage.setItem(CLAVE_BIENVENIDA, '1')
    } catch {
      /* sin almacenamiento: se volverá a mostrar */
    }
    cerrar()
    fn?.()
  }
  return (
    <div className="modal-fondo" onClick={fin()}>
      <div className="modal bienvenida" onClick={(e) => e.stopPropagation()}>
        <div className="bienvenida-cab">
          <Logo className="bienvenida-logo" />
          <h1>
            Hola, esto es <span>{PROYECTO.nombre}</span>
          </h1>
          <p>{PROYECTO.lema}: descubre qué peces viven en cada río, embalse o laguna, aprende a pescarlos y ayúdanos a completar el mapa.</p>
        </div>
        <div className="bienvenida-pasos">
          <div>
            <span className="medallon" aria-hidden>
              <IcoMapa />
            </span>
            <b>Explora</b>
            <small>Más de 7.000 masas de agua. Pulsa una en el mapa o búscala por nombre o pueblo.</small>
          </div>
          <div>
            <span className="medallon" aria-hidden>
              <IcoMosca />
            </span>
            <b>Aprende</b>
            <small>Cada pez tiene su ficha: cebos y señuelos, mejor época, horas y normativa de tu comunidad.</small>
          </div>
          <div>
            <span className="medallon" aria-hidden>
              <IcoAportar />
            </span>
            <b>Contribuye</b>
            <small>Es un proyecto abierto. Si falta un pez o conoces un truco, añádelo con un par de clics.</small>
          </div>
        </div>
        <div className="bienvenida-acciones">
          <button className="btn-amarillo" onClick={fin()}>
            Empezar a explorar
          </button>
          <button className="btn-borde" onClick={fin(contribuir)}>
            <IcoAportar /> Quiero contribuir
          </button>
        </div>
      </div>
    </div>
  )
}

function Acerca({ cerrar, catalogo, contribuir }) {
  return (
    <div className="modal-fondo" onClick={cerrar}>
      <div className="modal modal-estrecho" onClick={(e) => e.stopPropagation()}>
        <div className="modal-barra">
          <span className="pi-tab">SOBRE EL PROYECTO</span>
          <button onClick={cerrar} aria-label="Cerrar">
            <IcoCerrar />
          </button>
        </div>
        <div className="modal-texto acerca">
          <div className="acerca-cab">
            <Logo className="acerca-logo" />
            <div>
              <h2>{PROYECTO.nombre}</h2>
              <p>{PROYECTO.lema}</p>
            </div>
          </div>
          <p>
            Un mapa <b>libre y colaborativo</b> para descubrir qué peces viven en los ríos, embalses, lagos y humedales de España, cómo se
            pescan y qué normas hay que cumplir. Lo mantiene una comunidad de gente a la que le gusta pescar y aprender.
          </p>
          <div className="acerca-licencias">
            <div>
              <b>Código</b>
              <span>Licencia {PROYECTO.licenciaCodigo}</span>
            </div>
            <div>
              <b>Datos</b>
              <span>Licencia {PROYECTO.licenciaDatos}</span>
            </div>
            <div>
              <b>Fotos</b>
              <span>Licencias libres de cada autor</span>
            </div>
          </div>
          <div className="acerca-acciones">
            <button className="btn-amarillo btn-coral" onClick={contribuir}>
              <IcoAportar /> Contribuir
            </button>
            <a className="btn-borde" href={PROYECTO.repo} target="_blank" rel="noreferrer">
              <IcoGithub /> Ver el código
            </a>
          </div>
          <h4>De dónde salen los datos</h4>
          <p>
            La asignación de especies es <b>orientativa</b>. Se basa en la distribución conocida por cuenca (Doadrio,{' '}
            <i>Atlas y Libro Rojo de los Peces Continentales de España</i>; Enciclopedia Virtual de los Vertebrados Españoles, MNCN-CSIC),
            el Catálogo Español de Especies Exóticas Invasoras (RD 630/2013) y el Catálogo Español de Especies Amenazadas (RD 139/2011).
            Las categorías UICN son globales y orientativas.
          </p>
          <p>
            <b>Masas de agua:</b> {REVISADAS.length} revisadas una a una
            {catalogo.total
              ? ` y ${catalogo.total.toLocaleString('es-ES')} más de la hidrografía oficial del Instituto Geográfico Nacional (descargadas el ${new Date(catalogo.generado).toLocaleDateString('es-ES')}), con especies estimadas automáticamente según cuenca, altitud y tipo.`
              : '. Para añadir todas las de la península (ríos, arroyos, embalses, lagos, lagunas y balsas del IGN), ejecuta en la terminal:'}
          </p>
          {!catalogo.total && (
            <pre className="codigo">npm.cmd run datos{'\n'}npm.cmd run datos:arroyos   (opcional: todos los arroyos, descarga muy grande)</pre>
          )}
          <p>
            Fotos: Wikimedia Commons e iNaturalist (autor y licencia en cada ficha). Cartografía: IGN, Natural Earth, OpenStreetMap y Esri.
          </p>
          <p className="acerca-aviso">Antes de pescar, consulta siempre la normativa vigente de tu comunidad autónoma.</p>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [geo, setGeo] = useState({})
  const [mapa, setMapa] = useState(null)
  const [seleccion, setSeleccion] = useState(null) // id de masa de agua
  const [especie, setEspecie] = useState(null) // id de especie filtrada
  const [ficha, setFicha] = useState(null) // id de especie con ficha abierta
  // ficha a la que se puede volver tras ir al mapa desde ella (botón «Volver» y botón atrás del navegador)
  const [volver, setVolver] = useState(null)
  const volverRef = useRef(null)
  volverRef.current = volver
  const [tipos, setTipos] = useState(new Set())
  const [ccaa, setCcaa] = useState('') // código de comunidad autónoma
  const [listaCcaa, setListaCcaa] = useState([])
  const [texto, setTexto] = useState('')
  const [panel, setPanel] = useState(() => !esMovil())
  const [tab, setTab] = useState('masas')
  const [base, setBase] = useState('topo_gris')
  const [panelBase, setPanelBase] = useState(false)
  const [acerca, setAcerca] = useState(false)
  const [contribuir, setContribuir] = useState(null) // { tipo, masa, especie, contexto } o null
  const [bienvenida, setBienvenida] = useState(() => !bienvenidaVista())
  const [infoPlegado, setInfoPlegado] = useState(false)
  const [infoGrande, setInfoGrande] = useState(false)

  // capa de zonas de pesca (refugios, tramos libres o sin muerte y zonas controladas)
  const [zonasTipos, setZonasTipos] = useState(leerZonasTipos)
  const zonasActivas = zonasTipos.size > 0
  const [zonasIdx, setZonasIdx] = useState(undefined) // undefined: sin pedir · null: no hay datos
  const [estadoZonas, setEstadoZonas] = useState('apagada')
  const cambiarZonas = useCallback((tiposNuevos) => {
    setZonasTipos(tiposNuevos)
    try {
      localStorage.setItem(CLAVE_ZONAS, ORDEN_ZONA.filter((k) => tiposNuevos.has(k)).join(''))
    } catch {
      /* sin almacenamiento */
    }
  }, [])
  const [catalogo, setCatalogo] = useState({ total: 0, listo: false })
  const [general, setGeneral] = useState(null)
  const [teselas, setTeselas] = useState(null)

  useEffect(() => {
    const base = import.meta.env.BASE_URL
    const json = (url) => fetch(base + url).then((r) => (r.ok ? r.json() : null)).catch(() => null)
    Promise.all([json('data/geometria.json'), cargarIndice(), json('data/masas/general.json'), json('data/masas/teselas.json'), json('data/ccaa.json')]).then(
      ([geoNE, info, gen, tes, cc]) => {
        setListaCcaa(cc || [])
        // las masas revisadas usan el trazado detallado del IGN cuando existe
        const g = { ...(geoNE || {}) }
        if (gen) {
          const rev = new Set(REVISADAS.map((m) => m.id))
          for (const [id, lineas] of Object.entries(gen.l || {})) if (rev.has(id)) g[id] = { type: 'MultiLineString', coordinates: lineas, ign: true }
          for (const [id, anillos] of Object.entries(gen.p || {})) if (rev.has(id)) g[id] = { type: 'MultiPolygon', coordinates: anillos.map((a) => [a]), ign: true }
        }
        setGeo(g)
        setGeoRevisadas(g)
        setGeneral(gen)
        setTeselas(tes ? { tamano: tes.tamano, set: new Set(tes.teselas), ext: tes.ext || null } : null)
        setCatalogo({ ...info, listo: true })
      },
    )
  }, [])

  // comunidad autónoma elegida, preparada para recortar geometrías
  // todas las comunidades preparadas (para agrupar la lista por comunidad y recortar)
  const todasRegiones = useMemo(() => listaCcaa.map(prepararRegion), [listaCcaa])
  const region = useMemo(() => todasRegiones.find((r) => r.codigo === ccaa) || null, [ccaa, todasRegiones])

  // comunidad elegida desde el buscador superior: igual que en el selector del panel de masas de agua
  const elegirCcaa = useCallback((codigo) => {
    setCcaa(codigo)
    setTab('masas')
    if (!esMovil()) setPanel(true)
  }, [])
  // al elegir una comunidad, el mapa se encuadra en ella
  useEffect(() => {
    if (!region || !mapa) return
    const { x } = mapa.getSize()
    const izq = x > 800 && document.querySelector('.panel-lateral') ? 400 : 30
    const [w, so, e, n] = region.bbox
    mapa.flyToBounds([[so, w], [n, e]], { paddingTopLeft: [izq, 40], paddingBottomRight: [seleccion ? 460 : 40, 40], duration: 0.8 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [region, mapa])

  const conEspecie = useMemo(() => (catalogo.listo ? masasConEspecie(especie) : null), [especie, catalogo])
  const filtrados = useMemo(
    () => (catalogo.listo ? idsFiltrados({ tipos, cuenca: '', texto, especie: null, region }) : null),
    [tipos, texto, catalogo, region],
  )
  // para atenuar en el mapa no se tiene en cuenta la comunidad: allí ya se recorta cada río por
  // el límite, y un río puede tener su punto de referencia fuera aunque cruce la comunidad
  const filtradosMapa = useMemo(
    () => (catalogo.listo ? idsFiltrados({ tipos, cuenca: '', texto, especie: null, region: null }) : null),
    [tipos, texto, catalogo],
  )
  const nVisibles = (() => {
    const base = filtrados ? [...filtrados] : null
    if (!base && !conEspecie) return REVISADAS.length + catalogo.total
    if (!base) return conEspecie.size
    return conEspecie ? base.filter((id) => conEspecie.has(id)).length : base.length
  })()
  const masa = seleccion ? masaPorId(seleccion) : null
  // el índice de zonas se descarga al activar la capa o al abrir una masa de agua
  const quiereZonas = zonasActivas || !!masa || (panel && tab === 'zonas')
  useEffect(() => {
    if (quiereZonas && zonasIdx === undefined) cargarZonas().then(setZonasIdx)
  }, [quiereZonas, zonasIdx])
  const zonasMasa = useMemo(() => (masa && zonasIdx && catalogo.listo ? zonasDeMasa(zonasIdx, masa, cajaMasa(masa)) : []), [masa, zonasIdx, catalogo.listo])
  const verZona = useCallback(
    (z) => {
      if (!zonasTipos.has(z.cat)) cambiarZonas(new Set([...zonasTipos, z.cat]))
      if (!mapa) return
      const [w, so, e, n] = z.b
      const { x } = mapa.getSize()
      mapa.flyToBounds([[so, w], [n, e]], { paddingTopLeft: [x > 800 && panel ? 400 : 30, 60], paddingBottomRight: [x > 800 ? 460 : 30, 40], maxZoom: 14, duration: 0.8 })
    },
    [mapa, panel, cambiarZonas, zonasTipos],
  )

  const [vuelo, setVuelo] = useState(null) // { id, t }: centrar el mapa en una masa elegida en la lista
  const [clicPunto, setClicPunto] = useState(null) // dónde se pulsó la masa seleccionada
  const elegirMasa = useCallback((id) => {
    setSeleccion(id)
    setClicPunto(null)
    if (id) setVuelo({ id, t: Date.now() })
    if (esMovil()) setPanel(false)
  }, [])
  // desde la ficha al mapa: se cierra la ficha, se recuerda y se añade una entrada al historial
  const irAlMapaDesdeFicha = useCallback(() => {
    if (!ficha) return
    setVolver(ficha)
    setFicha(null)
    window.history.pushState({ dondepicaVolver: ficha }, '')
  }, [ficha])
  const volverAFicha = useCallback(() => {
    // si la entrada del historial es la nuestra, se retrocede (lo gestiona «popstate»)
    if (window.history.state?.dondepicaVolver === volverRef.current) window.history.back()
    else if (volverRef.current) {
      setFicha(volverRef.current)
      setVolver(null)
    }
  }, [])
  // botón atrás del navegador: vuelve a la ficha
  useEffect(() => {
    const alRetroceder = () => {
      if (!volverRef.current) return
      setFicha(volverRef.current)
      setVolver(null)
    }
    window.addEventListener('popstate', alRetroceder)
    return () => window.removeEventListener('popstate', alRetroceder)
  }, [])
  // si se abre otra ficha, ya no hay a dónde volver
  useEffect(() => {
    if (ficha && volverRef.current && ficha !== volverRef.current) setVolver(null)
  }, [ficha])
  // clic en el mapa: se centra lo pulsado en la zona libre de la pantalla, sin cambiar el zoom
  const clicMapa = useCallback(
    (id, latlng) => {
      setSeleccion(id)
      setClicPunto(latlng || null)
      if (!mapa || !latlng) return
      const m = masaPorId(id)
      const esCurso = m && (m.tipo === 'rio' || m.tipo === 'arroyo')
      // embalses y lagos descargados: su centro; ríos (y masas revisadas): el punto pulsado
      const destino = m && m.auto && !esCurso && m.punto ? m.punto : latlng
      const { x, y } = mapa.getSize()
      const movil = x <= 800
      const izq = !movil && document.querySelector('.panel-lateral') ? 394 : 0
      const der = movil ? 0 : 454 // panel de información a la derecha
      const abajo = movil ? y * 0.62 : 0 // en móvil el panel va abajo
      const objetivo = [(izq + x - der) / 2, (y - abajo) / 2]
      const p = mapa.latLngToContainerPoint(destino)
      mapa.panBy([p.x - objetivo[0], p.y - objetivo[1]], { animate: true, duration: 0.5 })
    },
    [mapa],
  )
  // zona de pesca pulsada en el mapa: se abre su masa de agua (o, si no está en el catálogo, la zona sola)
  const [zonaPulsada, setZonaPulsada] = useState(null) // { z, masaId }
  const pulsarZona = useCallback(
    (z, latlng) => {
      const m = masaDeZona(z, [...REVISADAS, ...todasGeneradas()], cajaMasa)
      setZonaPulsada({ z, masaId: m?.id || null })
      setInfoPlegado(false)
      if (m) clicMapa(m.id, latlng)
      else {
        setSeleccion(null)
        setClicPunto(null)
      }
    },
    [clicMapa],
  )
  const zonaAbierta = zonaPulsada && zonaPulsada.masaId && zonaPulsada.masaId === seleccion ? zonaPulsada.z.id : null
  const zonaSuelta = zonaPulsada && !zonaPulsada.masaId && !seleccion ? zonaPulsada.z : null

  const propsZonas = useMemo(
    () => ({
      tipos: zonasTipos,
      idx: zonasIdx || null,
      resaltadas: zonaSuelta ? [] : zonasMasa.map((z) => z.id),
      seleccionada: zonaSuelta?.id || zonaAbierta,
      onEstado: setEstadoZonas,
      onZona: pulsarZona,
    }),
    [zonasTipos, zonasIdx, zonasMasa, zonaSuelta, zonaAbierta, pulsarZona],
  )
  // mostrar en el mapa dónde vive una especie, sin cambiar la pestaña del panel izquierdo
  const elegirEspecie = useCallback((id) => {
    setEspecie(id)
    if (id) setSeleccion(null)
  }, [])
  // localidad buscada en el buscador: se encuadra en el mapa y se marca con un pin
  const [lugar, setLugar] = useState(null)
  const elegirLocalidad = useCallback(
    async (l) => {
      if (!l) return
      try {
        const u = await ubicarLocalidad(l)
        setLugar(u)
        if (esMovil()) setPanel(false)
        if (!mapa) return
        const { x } = mapa.getSize()
        const movil = x <= 800
        const izq = !movil && document.querySelector('.panel-lateral') ? 400 : 40
        const der = !movil && document.querySelector('.panel-info') ? 460 : 40
        if (u.bbox) {
          const [s, w, n, e] = u.bbox
          mapa.flyToBounds([[s, w], [n, e]], { paddingTopLeft: [izq, 60], paddingBottomRight: [der, 40], maxZoom: 13, duration: 0.8 })
        } else mapa.flyTo([u.lat, u.lng], 13, { duration: 0.8 })
      } catch {
        setLugar({ error: `No se pudo situar ${l.nombre} en el mapa.` })
      }
    },
    [mapa],
  )
  // comunidad autónoma de la masa seleccionada (para abrir la normativa de la ficha en ella):
  // la elegida en el panel si la masa pasa por ella; si no, la del punto pulsado en el mapa;
  // si se eligió desde una lista, la de su punto de referencia
  const ccaaMasa = useMemo(() => {
    if (!masa || !todasRegiones.length) return ''
    const cods = regionesDeMasa(masa, todasRegiones)
    if (ccaa && cods.includes(ccaa)) return ccaa
    const en = (lat, lng) => todasRegiones.find((r) => dentro(r, lng, lat))?.codigo
    if (clicPunto) {
      const c = en(clicPunto.lat, clicPunto.lng)
      if (c) return c
    }
    // elegida desde una lista y con trazado conocido: la comunidad por la que pasa la mayor parte
    const g = geo[masa.id]
    if (cods.length > 1 && g) {
      const cuenta = {}
      const recorrer = (a) => (typeof a[0] === 'number' ? (cuenta[en(a[1], a[0])] = (cuenta[en(a[1], a[0])] || 0) + 1) : a.forEach(recorrer))
      recorrer(g.coordinates)
      const mejor = cods.reduce((m, c) => ((cuenta[c] || 0) > (cuenta[m] || 0) ? c : m), cods[0])
      if (cuenta[mejor]) return mejor
    }
    return (masa.punto && en(masa.punto[0], masa.punto[1])) || cods[0] || ''
  }, [masa, todasRegiones, ccaa, clicPunto, geo])

  // restablecer todos los filtros del panel izquierdo
  const [reinicio, setReinicio] = useState(0)
  const hayFiltros = !!(ccaa || tipos.size || texto.trim() || especie)
  // olvidar la ficha a la que se podía volver (y neutralizar su entrada del historial)
  const olvidarVolver = useCallback(() => {
    if (!volverRef.current) return
    if (window.history.state?.dondepicaVolver) window.history.replaceState(null, '')
    setVolver(null)
  }, [])
  const restablecer = () => {
    olvidarVolver()
    setCcaa('')
    setTipos(new Set())
    setTexto('')
    setEspecie(null)
    setReinicio((n) => n + 1) // también vacía los filtros propios de la lista de especies
  }
  const inicio = () => {
    setSeleccion(null)
    setLugar(null)
    mapa?.flyTo(CENTRO, 6, { duration: 0.8 })
  }

  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Escape' || ficha) return
      setSeleccion(null)
      setZonaPulsada(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [ficha])

  useEffect(() => { if (import.meta.env.DEV || window.__depurar) window.__mapa = mapa }, [mapa])
  const fEsp = especie && ESPECIES_POR_ID[especie]

  return (
    <div className="app">
      <Navbar region={region} onMenu={() => setPanel(!panel)} onMasa={elegirMasa} onEspecie={setFicha} onLocalidad={elegirLocalidad} onCcaa={elegirCcaa} listaCcaa={listaCcaa} onInicio={inicio} onAcerca={() => setAcerca(true)} onContribuir={(ini) => setContribuir(ini || {})} />
      {lugar?.error && (
        <button className="aviso-flotante" onClick={() => setLugar(null)}>
          {lugar.error} <IcoCerrar width={14} height={14} />
        </button>
      )}

      <main className={`escena ${panel ? 'con-panel' : ''} ${masa || zonaSuelta ? (infoPlegado ? 'con-info info-plegado' : infoGrande ? 'con-info info-grande' : 'con-info') : ''}`}>
        <MapView
          geo={geo}
          filtrados={filtradosMapa}
          conEspecie={conEspecie}
          region={region}
          listaCcaa={listaCcaa}
          general={general}
          teselas={teselas}
          listo={catalogo.listo}
          seleccion={seleccion}
          setSeleccion={clicMapa}
          vuelo={vuelo}
          especie={especie}
          base={base}
          setMapa={setMapa}
          lugar={lugar && !lugar.error ? lugar : null}
          quitarLugar={() => setLugar(null)}
          zonas={propsZonas}
        />

        {/* botón para abrir el panel izquierdo */}
        <button className={`btn-flotante btn-panel ${panel ? 'oculto' : ''}`} onClick={() => setPanel(true)} aria-label="Abrir panel" title="Masas de agua y especies">
          <IcoLista />
          <span className="contador">{nVisibles > 999 ? `${Math.round(nVisibles / 1000)}k` : nVisibles}</span>
        </button>

        <PanelLateral
          abierto={panel}
          cerrar={() => setPanel(false)}
          tab={tab}
          setTab={setTab}
          catalogo={catalogo}
          seleccion={seleccion}
          setSeleccion={elegirMasa}
          tipos={tipos}
          setTipos={setTipos}
          ccaa={ccaa}
          setCcaa={setCcaa}
          listaCcaa={listaCcaa}
          region={region}
          todasRegiones={todasRegiones}
          texto={texto}
          setTexto={setTexto}
          especie={especie}
          setEspecie={elegirEspecie}
          verEspecieEnMapa={elegirEspecie}
          abrirFicha={setFicha}
          abrirAcerca={() => setAcerca(true)}
          restablecer={restablecer}
          hayFiltros={hayFiltros}
          reinicio={reinicio}
          zonasTipos={zonasTipos}
          setZonasTipos={cambiarZonas}
          zonasIdx={zonasIdx}
          estadoZonas={zonasIdx === undefined ? 'cargando' : zonasIdx === null ? 'sin-datos' : estadoZonas}
        />

        {volver && !ficha && !(fEsp && fEsp.id === volver) && (
          <button className="btn-volver flotante" onClick={volverAFicha} title="También puedes usar el botón atrás del navegador">
            <IcoAtras /> Volver a la ficha de {ESPECIES_POR_ID[volver]?.comun}
          </button>
        )}
        {fEsp && (
          <div className="filtro-especie" style={{ '--c': ORIGENES[fEsp.origen].color }}>
            {volver === fEsp.id && !ficha && (
              <button className="btn-volver" onClick={volverAFicha} title="También puedes usar el botón atrás del navegador">
                <IcoAtras /> Volver a la ficha
              </button>
            )}
            <span>
              Mostrando dónde vive: <b>{fEsp.comun}</b> <em>{fEsp.cientifico}</em> · {(conEspecie?.size || 0).toLocaleString('es-ES')} masas
            </span>
            <button onClick={() => setFicha(especie)}>Ficha</button>
            <button
              onClick={() => {
                if (volver === especie) olvidarVolver()
                setEspecie(null)
              }}
              aria-label="Quitar filtro"
            >
              <IcoCerrar width={14} height={14} />
            </button>
          </div>
        )}

        {/* controles de mapa a la derecha */}
        <div className="controles-mapa">
          <button className="btn-flotante blanco" onClick={() => mapa?.zoomIn()} aria-label="Acercar">
            <IcoMas />
          </button>
          <button className="btn-flotante blanco" onClick={() => mapa?.zoomOut()} aria-label="Alejar">
            <IcoMenos />
          </button>
        </div>

        {/* selector de mapa base */}
        <button className="btn-flotante btn-base" onClick={() => setPanelBase(!panelBase)} aria-label="Mapa base" title="Mapa base">
          <IcoCapas />
        </button>
        {panelBase && (
          <div className="panel-base">
            <div className="panel-base-titulo">Mapa base</div>
            {Object.entries(MAPAS_BASE).map(([k, v]) => (
              <label key={k}>
                <input
                  type="radio"
                  name="base"
                  checked={base === k}
                  onChange={() => {
                    setBase(k)
                    setPanelBase(false)
                  }}
                />
                {v.nombre}
              </label>
            ))}
          </div>
        )}

        {masa && (
          <PanelInfo
            key={masa.id}
            masa={masa}
            region={region}
            todasRegiones={todasRegiones}
            listaCcaa={listaCcaa}
            cerrar={() => {
              setSeleccion(null)
              setZonaPulsada(null)
            }}
            especie={especie}
            setEspecie={elegirEspecie}
            abrirFicha={setFicha}
            plegado={infoPlegado}
            setPlegado={setInfoPlegado}
            grande={infoGrande}
            setGrande={setInfoGrande}
            contribuir={() => setContribuir({ tipo: 'especie-masa', masa: masa.nombre, contexto: `masa ${masa.id}` })}
            zonas={zonasMasa}
            zonasIdx={zonasIdx || null}
            verZona={verZona}
            contribuirNormativa={() => setContribuir({ tipo: 'normativa', masa: masa.nombre, contexto: `zonas de pesca de la masa ${masa.id}` })}
            zonaAbierta={zonaAbierta}
            alAbrirZona={(z) => setZonaPulsada(z ? { z, masaId: masa.id } : null)}
          />
        )}
        {!masa && zonaSuelta && (
          <PanelZona
            key={zonaSuelta.id}
            zona={zonaSuelta}
            zonasIdx={zonasIdx || null}
            cerrar={() => setZonaPulsada(null)}
            plegado={infoPlegado}
            setPlegado={setInfoPlegado}
            grande={infoGrande}
            setGrande={setInfoGrande}
            verZona={verZona}
            contribuir={() => setContribuir({ tipo: 'masa', masa: zonaSuelta.rio || zonaSuelta.nom, contexto: `zona de pesca ${zonaSuelta.id} sin masa de agua en el catálogo` })}
          />
        )}
      </main>

      {ficha && (
        <FichaEspecie id={ficha} cerrar={() => setFicha(null)} setEspecie={elegirEspecie} setSeleccion={elegirMasa} ccaa={ccaaMasa || ccaa} masa={masa} listaCcaa={listaCcaa} regiones={todasRegiones} contribuir={(ini) => setContribuir(ini)} alMapa={irAlMapaDesdeFicha} />
      )}
      {acerca && (
        <Acerca
          cerrar={() => setAcerca(false)}
          catalogo={catalogo}
          contribuir={() => {
            setAcerca(false)
            setContribuir({})
          }}
        />
      )}
      {contribuir && <Contribuir key={JSON.stringify(contribuir)} inicial={contribuir} cerrar={() => setContribuir(null)} />}
      {bienvenida && <Bienvenida cerrar={() => setBienvenida(false)} contribuir={() => setContribuir({})} />}
    </div>
  )
}
