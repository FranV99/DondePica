import { useEffect, useMemo, useRef, useState } from 'react'
import { CUENCAS } from '../data/masas.js'
import { buscar, conteoEspecies, conteoEspeciesEnRegion, especiesDeMasa, regionesDeMasa, REVISADAS } from '../lib/catalogo.js'
import { ESPECIES, FAMILIAS, ORIGENES, textoEspecie } from '../data/especies.js'
import MedidorUICN from './MedidorUICN.jsx'
import { TIPOS, norm } from '../lib/util.js'
import FotoEspecie from './FotoEspecie.jsx'
import { IcoAbajo, IcoCerrar, IcoPin, IcoReiniciar, IcoTipo } from './Iconos.jsx'
import { svgInsignia } from '../lib/iconosMapa.js'
import Plegable from './Plegable.jsx'
import { CALENDARIO, TECNICAS } from '../data/tecnicas.js'

function ItemMasa({ m, seleccion, setSeleccion }) {
  const n = especiesDeMasa(m).especies.length
  return (
    <li>
      <button className={`masa-item ${m.id === seleccion ? 'sel' : ''}`} onClick={() => setSeleccion(m.id)}>
        <span className="masa-ico" style={{ '--c': CUENCAS[m.cuenca] }}>
          <IcoTipo tipo={m.tipo} width={17} height={17} />
        </span>
        <span className="masa-txt">
          <span className="masa-nombre">{m.nombre}</span>
          <span className="masa-sub">
            {TIPOS[m.tipo]?.singular} · {n ? `${n} especies` : 'sin datos de peces'}
            {m.revisada ? <b className="masa-rev"> · ✓ Revisada</b> : n ? ' (estimadas)' : ''}
          </span>
        </span>
        <span className="masa-flecha" aria-hidden>›</span>
      </button>
    </li>
  )
}

// Lista agrupada por comunidad autónoma y, dentro de cada una, por cuenca.
// Una masa que cruza varias comunidades aparece en todas ellas.
function Arbol({ masas, regiones, soloCcaa, seleccion, setSeleccion, abiertoInicial = false }) {
  const [cambiadas, setCambiadas] = useState(new Set()) // comunidades abiertas/cerradas a mano
  const grupos = useMemo(() => {
    const g = new Map()
    for (const m of masas) {
      let codigos = regiones.length ? regionesDeMasa(m, regiones) : []
      if (!codigos.length) codigos = ['?']
      for (const c of codigos) {
        if (soloCcaa && c !== soloCcaa) continue
        if (!g.has(c)) g.set(c, new Map())
        const porCuenca = g.get(c)
        if (!porCuenca.has(m.cuenca)) porCuenca.set(m.cuenca, [])
        porCuenca.get(m.cuenca).push(m)
      }
    }
    const orden = [...regiones.map((r) => r.codigo), '?']
    return orden.filter((c) => g.has(c)).map((c) => ({
      codigo: c,
      nombre: regiones.find((r) => r.codigo === c)?.nombre || 'Sin comunidad asignada',
      cuencas: Object.keys(CUENCAS).filter((k) => g.get(c).has(k)).map((k) => [k, g.get(c).get(k)]),
      total: [...g.get(c).values()].reduce((s, l) => s + l.length, 0),
    }))
  }, [masas, regiones, soloCcaa])

  const toggle = (c) => {
    const n = new Set(cambiadas)
    if (n.has(c)) n.delete(c)
    else n.add(c)
    setCambiadas(n)
  }
  const abiertaPorDefecto = abiertoInicial || grupos.length === 1

  return grupos.map((gr) => {
    const abierta = abiertaPorDefecto !== cambiadas.has(gr.codigo)
    return (
      <section key={gr.codigo} className={`ccaa-grupo ${abierta ? 'abierta' : ''}`}>
        <button className="ccaa-cab" onClick={() => toggle(gr.codigo)} aria-expanded={abierta}>
          <span className={`cuenca-flecha ${abierta ? 'abierta' : ''}`}>▸</span>
          <span className="ccaa-nombre">
            <small>Comunidad autónoma</small>
            {gr.nombre}
          </span>
          <span className="cuenca-n">
            {gr.total.toLocaleString('es-ES')} {gr.total === 1 ? 'masa' : 'masas'}
          </span>
        </button>
        <Plegable abierto={abierta}>
          {gr.cuencas.map(([c, ms]) => (
            <div key={c} className="ccaa-cuenca" style={{ '--c': CUENCAS[c] }}>
              <div className="ccaa-cuenca-cab">
                <i className="punto" style={{ background: CUENCAS[c] }} /> Cuenca {c}
                <span>{ms.length}</span>
              </div>
              <ul className="lista-masas">
                {ms.map((m) => (
                  <ItemMasa key={m.id} m={m} seleccion={seleccion} setSeleccion={setSeleccion} />
                ))}
              </ul>
            </div>
          ))}
        </Plegable>
      </section>
    )
  })
}

// Con una comunidad elegida: sus cuencas, cada una desplegable con sus masas de agua
const MAX_POR_CUENCA = 150
const pesoTipo = { rio: 0, embalse: 1, lago: 2, laguna: 3, humedal: 4, arroyo: 5, balsa: 6 }
function CuencasRegion({ resultado, region, filtrando, seleccion, setSeleccion }) {
  const [abiertas, setAbiertas] = useState(new Set())
  const cuencas = useMemo(() => {
    const g = new Map()
    for (const m of resultado.res) {
      if (!g.has(m.cuenca)) g.set(m.cuenca, [])
      g.get(m.cuenca).push(m)
    }
    for (const l of g.values())
      l.sort(
        (a, b) =>
          (b.revisada ? 1 : 0) - (a.revisada ? 1 : 0) ||
          (pesoTipo[a.tipo] ?? 9) - (pesoTipo[b.tipo] ?? 9) ||
          (a.jer || 9) - (b.jer || 9) ||
          (b.longitud || b.area || 0) - (a.longitud || a.area || 0) ||
          a.nombre.localeCompare(b.nombre, 'es'),
      )
    return [...g].sort((a, b) => b[1].length - a[1].length)
  }, [resultado])
  const abiertaDefecto = cuencas.length === 1 || (filtrando && resultado.res.length <= 40)
  const toggle = (c) => {
    const n = new Set(abiertas)
    if (n.has(c)) n.delete(c)
    else n.add(c)
    setAbiertas(n)
  }

  if (!cuencas.length) return <p className="panel-vacio">Ninguna masa de agua de {region.nombre} coincide con los filtros.</p>
  return (
    <>
      <div className="bloque-titulo">
        <b>
          {cuencas.length === 1 ? 'Cuenca' : `${cuencas.length} cuencas`} en {region.nombre}
        </b>
        <span>
          {resultado.total.toLocaleString('es-ES')} masas de agua{filtrando ? ' con los filtros elegidos' : ''}. Despliega una cuenca para verlas.
        </span>
      </div>
      {cuencas.map(([c, ms]) => {
        const abierta = abiertaDefecto !== abiertas.has(c)
        return (
          <div key={c} className="grupo-cuenca" style={{ '--c': CUENCAS[c] }}>
            <button className="cuenca-cab" onClick={() => toggle(c)} aria-expanded={abierta}>
              <span className={`cuenca-flecha ${abierta ? 'abierta' : ''}`}>▸</span>
              <span className="cuenca-nombre">
                <small>Cuenca</small>
                {c}
              </span>
              <span className="cuenca-n">
                {ms.length.toLocaleString('es-ES')} {ms.length === 1 ? 'masa' : 'masas'}
              </span>
            </button>
            <Plegable abierto={abierta}>
              <ul className="lista-masas">
                {ms.slice(0, MAX_POR_CUENCA).map((m) => (
                  <ItemMasa key={m.id} m={m} seleccion={seleccion} setSeleccion={setSeleccion} />
                ))}
                {ms.length > MAX_POR_CUENCA && (
                  <li className="mas-masas">
                    Y {(ms.length - MAX_POR_CUENCA).toLocaleString('es-ES')} más (sobre todo arroyos y balsas): búscalas por nombre o pulsa sobre el mapa.
                  </li>
                )}
              </ul>
            </Plegable>
          </div>
        )
      })}
    </>
  )
}

function TabMasas({ catalogo, seleccion, setSeleccion, tipos, setTipos, texto, setTexto, especie, abrirAcerca, ccaa, setCcaa, listaCcaa, region, todasRegiones = [] }) {
  const buscando = texto.trim().length >= 2 || tipos.size > 0 || !!especie || !!region
  const resultado = useMemo(
    () => (buscando ? buscar(texto, { tipos, especie, region, limite: region ? Infinity : 300 }) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [buscando, texto, tipos, especie, catalogo, region],
  )
  const revisadas = useMemo(
    () =>
      [...REVISADAS].sort((a, b) => (a.tipo === b.tipo ? a.nombre.localeCompare(b.nombre, 'es') : a.tipo === 'rio' ? -1 : 1)),
    [],
  )

  const [verDestacadas, setVerDestacadas] = useState(false) // desplegable cerrado por defecto
  const toggle = (set, setter, v) => {
    const n = new Set(set)
    if (n.has(v)) n.delete(v)
    else n.add(v)
    setter(n)
  }
  const total = REVISADAS.length + catalogo.total

  return (
    <>
      <p className="panel-intro">
        {catalogo.total
          ? `${total.toLocaleString('es-ES')} masas de agua. Búscalas por nombre, fíltralas o pulsa sobre el mapa (con más zoom aparecen los ríos pequeños, arroyos y balsas).`
          : 'Selecciona una masa de agua en la lista o en el mapa para ver qué peces viven en ella.'}
      </p>
      <label className="panel-etiqueta" htmlFor="sel-ccaa">Comunidad autónoma</label>
      <div className="sel-ccaa">
        <select id="sel-ccaa" className="panel-input" value={ccaa} onChange={(e) => setCcaa(e.target.value)}>
          <option value="">Toda España peninsular</option>
          {listaCcaa.map((c) => (
            <option key={c.codigo} value={c.codigo}>
              {c.nombre}
            </option>
          ))}
        </select>
        {ccaa && (
          <button className="sel-quitar" onClick={() => setCcaa('')} aria-label="Quitar comunidad">
            <IcoCerrar width={14} height={14} />
          </button>
        )}
      </div>
      {region && <p className="aviso-region">Solo se muestran las aguas de <b>{region.nombre}</b>. Los ríos que cruzan a otra comunidad aparecen recortados por el límite.</p>}
      <input className="panel-input" type="search" placeholder="Buscar por nombre…" value={texto} onChange={(e) => setTexto(e.target.value)} />
      <div className="panel-botones">
        {Object.entries(TIPOS).map(([k, v]) => (
          <button key={k} className={`btn-gris btn-tipo ${tipos.has(k) ? 'on' : ''}`} onClick={() => toggle(tipos, setTipos, k)}>
            <span className="btn-tipo-ico" aria-hidden dangerouslySetInnerHTML={{ __html: svgInsignia(k, '#3f5c42', 17) }} />
            {v.label}
          </button>
        ))}
      </div>

      <div className="arbol">
        {resultado && region ? (
          <CuencasRegion resultado={resultado} region={region} filtrando={texto.trim().length >= 2 || tipos.size > 0 || !!especie} seleccion={seleccion} setSeleccion={setSeleccion} />
        ) : resultado ? (
          <>
            <div className="bloque-titulo">
              <b>{resultado.total.toLocaleString('es-ES')} resultados</b>
              {resultado.total > resultado.res.length && <span>Se muestran los {resultado.res.length} primeros: afina la búsqueda para ver el resto.</span>}
            </div>
            <Arbol masas={resultado.res} regiones={todasRegiones} soloCcaa={ccaa} seleccion={seleccion} setSeleccion={setSeleccion} abiertoInicial={resultado.res.length <= 25} />
            {!resultado.total && <p className="panel-vacio">Ninguna masa de agua coincide con los filtros.</p>}
          </>
        ) : (
          <>
            <button className={`desplegable-destacadas ${verDestacadas ? 'abierto' : ''}`} onClick={() => setVerDestacadas(!verDestacadas)} aria-expanded={verDestacadas}>
              <span>
                <b>Masas de agua destacadas ({REVISADAS.length})</b>
                <small>Especies revisadas una a una</small>
              </span>
              <IcoAbajo width={18} height={18} />
            </button>
            <Plegable abierto={verDestacadas}>
                <p className="destacadas-ayuda">
                  Están agrupadas por comunidad autónoma y cuenca: despliega una comunidad para verlas (un río que cruza varias aparece en todas)
                  {catalogo.total ? ', o busca cualquier otra por su nombre.' : '.'}
                </p>
                <Arbol masas={revisadas} regiones={todasRegiones} seleccion={seleccion} setSeleccion={setSeleccion} />
            </Plegable>
            {!catalogo.total && catalogo.listo && (
              <div className="aviso-datos">
                Solo se muestran las masas revisadas. Para añadir <b>todas</b> las masas de agua de la península, ejecuta una vez{' '}
                <code>npm.cmd run datos</code> en la terminal de VS Code.{' '}
                <button onClick={abrirAcerca}>Más información</button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}

// estaciones para filtrar especies por su mejor época de actividad
const ESTACIONES_FILTRO = [
  ['primavera', 'Primavera', '#5cb85c'],
  ['verano', 'Verano', '#f0ad1e'],
  ['otono', 'Otoño', '#d9662b'],
  ['invierno', 'Invierno', '#5aa9e6'],
]

// tipos de pesca a partir de los nombres de las modalidades de cada especie (src/data/tecnicas.js)
const TIPOS_PESCA = [
  ['mosca', 'Mosca', /mosca|ninfa/],
  ['lance', 'Lance con señuelos', /lance|spinning|casting|cucharilla|clonk/],
  ['cebo', 'Cebo natural', /cebo/],
  ['fondo', 'Fondo / feeder', /fondo|feeder/],
  ['boya', 'Boya / coup', /boya|coup|inglesa/],
  ['carpfishing', 'Carpfishing', /carpfishing/],
]
// "a, b y c"
const enumerar = (l, y) => (l.length < 2 ? l.join('') : `${l.slice(0, -1).join(', ')} ${y} ${l[l.length - 1]}`)
const tiposDe = (id) => {
  const nombres = (TECNICAS[id]?.modalidades || []).map((m) => norm(m.nombre))
  return new Set(TIPOS_PESCA.filter(([, , re]) => nombres.some((n) => re.test(n))).map(([k]) => k))
}
const TIPOS_POR_ESPECIE = Object.fromEntries(ESPECIES.map((e) => [e.id, tiposDe(e.id)]))

function TabEspecies({ especie, verEspecieEnMapa, abrirFicha, catalogo, region }) {
  const [q, setQ] = useState('')
  const [origenes, setOrigenes] = useState(() => new Set()) // selección múltiple: vale cualquiera de los elegidos
  const [epocas, setEpocas] = useState(() => new Set()) // selección múltiple
  const [pescas, setPescas] = useState(() => new Set()) // tipos de pesca, selección múltiple
  const [familias, setFamilias] = useState(() => new Set()) // selección múltiple: vale cualquiera de las elegidas
  const [verFamilias, setVerFamilias] = useState(false) // desplegable cerrado por defecto
  // al elegir una especie para verla en el mapa, su fila queda a la vista en la lista
  const refLista = useRef(null)
  useEffect(() => {
    if (especie) refLista.current?.querySelector('li.sel')?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [especie])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const conteoTotal = useMemo(() => conteoEspecies(), [catalogo])
  // con una comunidad elegida en Masas de agua: solo las especies presentes en ella
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const conteoRegion = useMemo(() => (catalogo.listo ? conteoEspeciesEnRegion(region) : null), [region, catalogo])
  const conteo = conteoRegion || conteoTotal
  // lista con todos los filtros salvo la familia (de ella salen los números de cada familia)
  const base = useMemo(() => {
    const t = norm(q.trim())
    // con épocas elegidas: especies activas en TODAS ellas y con su mejor época en al menos una
    // (con una sola estación, las que tienen en ella su mejor época)
    const enEpoca = (e) => {
      if (!epocas.size) return true
      const est = CALENDARIO[e.id]?.estaciones
      if (!est) return false
      const niveles = [...epocas].map((k) => est[k])
      return niveles.every((n) => n >= 1) && niveles.some((n) => n === 2)
    }
    // con tipos de pesca elegidos: especies que se pueden pescar con TODOS ellos
    const conPesca = (e) => [...pescas].every((k) => TIPOS_POR_ESPECIE[e.id].has(k))
    const enRegion = (e) => !conteoRegion || conteoRegion[e.id] > 0
    return ESPECIES.filter((e) => enRegion(e) && (!origenes.size || origenes.has(e.origen)) && enEpoca(e) && conPesca(e) && (!t || norm(textoEspecie(e)).includes(t))).sort(
      (a, b) => a.comun.localeCompare(b.comun, 'es'),
    )
  }, [q, origenes, epocas, pescas, conteoRegion])
  const lista = useMemo(() => (familias.size ? base.filter((e) => familias.has(e.familia)) : base), [base, familias])
  // familias ordenadas por número de especies del catálogo; el número que se muestra es el de la lista actual
  const porFamilia = useMemo(() => {
    const c = {}
    for (const e of base) c[e.familia] = (c[e.familia] || 0) + 1
    return c
  }, [base])
  const ordenFamilias = useMemo(() => {
    const total = {}
    for (const e of ESPECIES) total[e.familia] = (total[e.familia] || 0) + 1
    return Object.keys(total).sort((a, b) => total[b] - total[a] || (FAMILIAS[a]?.nombre || a).localeCompare(FAMILIAS[b]?.nombre || b, 'es'))
  }, [])
  const alternar = (setter) => (k) =>
    setter((a) => {
      const n = new Set(a)
      if (n.has(k)) n.delete(k)
      else n.add(k)
      return n
    })
  const alternarEpoca = alternar(setEpocas)
  const alternarPesca = alternar(setPescas)
  const alternarOrigen = alternar(setOrigenes)
  const alternarFamilia = alternar(setFamilias)

  return (
    <>
      <p className="panel-intro">Pulsa una especie para abrir su ficha. Con el icono del marcador ves en el mapa dónde vive.</p>
      {region && conteoRegion && (
        <p className="aviso-region">
          Solo las especies presentes en <b>{region.nombre}</b> ({Object.keys(conteoRegion).length}); el número de masas es el de esta comunidad. Para verlas todas, quita la comunidad en Masas de agua.
        </p>
      )}
      <input className="panel-input" type="search" placeholder="Filtrar especies…" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="panel-botones">
        {Object.entries(ORIGENES).map(([k, v]) => (
          <button key={k} className={`btn-gris ${origenes.has(k) ? 'on' : ''}`} onClick={() => alternarOrigen(k)} aria-pressed={origenes.has(k)}>
            <i className="punto" style={{ background: v.color }} /> {v.label}
          </button>
        ))}
      </div>
      <button className={`desplegable-familias ${verFamilias ? 'abierto' : ''}`} onClick={() => setVerFamilias(!verFamilias)} aria-expanded={verFamilias}>
        <span className="panel-etiqueta">Familia</span>
        <small>
          {familias.size
            ? enumerar(ordenFamilias.filter((f) => familias.has(f)).map((f) => FAMILIAS[f]?.nombre || f), 'o')
            : 'Todas'}
        </small>
        <IcoAbajo width={16} height={16} />
      </button>
      <Plegable abierto={verFamilias}>
        <div className="panel-botones filtro-familias">
          {ordenFamilias.map((f) => {
            const n = porFamilia[f] || 0
            const on = familias.has(f)
            return (
              <button
                key={f}
                className={`btn-gris ${on ? 'on' : ''}`}
                onClick={() => alternarFamilia(f)}
                aria-pressed={on}
                disabled={!n && !on}
                title={`${f}${FAMILIAS[f] ? ` · ${FAMILIAS[f].ejemplos}` : ''}`}
              >
                {FAMILIAS[f]?.nombre || f} <span className="fam-num">{n}</span>
              </button>
            )
          })}
          {familias.size > 0 && (
            <button className="btn-texto" onClick={() => setFamilias(new Set())}>
              Quitar familias
            </button>
          )}
        </div>
      </Plegable>
      <label className="panel-etiqueta">Mejor época de actividad</label>
      <div className="panel-botones filtro-epocas">
        {ESTACIONES_FILTRO.map(([k, nombre, color]) => (
          <button key={k} className={`btn-gris ${epocas.has(k) ? 'on' : ''}`} style={{ '--c': color }} onClick={() => alternarEpoca(k)} aria-pressed={epocas.has(k)}>
            <i className="punto" style={{ background: color }} /> {nombre}
          </button>
        ))}
      </div>
      <label className="panel-etiqueta">Tipo de pesca</label>
      <div className="panel-botones filtro-pesca">
        {TIPOS_PESCA.map(([k, nombre]) => (
          <button key={k} className={`btn-gris ${pescas.has(k) ? 'on' : ''}`} onClick={() => alternarPesca(k)} aria-pressed={pescas.has(k)}>
            {nombre}
          </button>
        ))}
      </div>
      {(epocas.size > 0 || pescas.size > 0 || familias.size > 0) && (
        <p className="filtro-epocas-nota">
          {lista.length} {lista.length === 1 ? 'especie' : 'especies'}
          {familias.size > 0 && ` de ${familias.size === 1 ? 'la familia' : 'las familias'} ${enumerar(ordenFamilias.filter((f) => familias.has(f)).map((f) => (FAMILIAS[f]?.nombre || f).toLowerCase()), 'y')}`}
          {epocas.size > 0 &&
            (epocas.size === 1
              ? ` con su mejor época en ${ESTACIONES_FILTRO.find(([k]) => epocas.has(k))[1].toLowerCase()}`
              : ` activas en ${enumerar(
                  ESTACIONES_FILTRO.filter(([k]) => epocas.has(k)).map(([, n]) => n.toLowerCase()),
                  'y',
                )} (y en su mejor época en alguna de ellas)`)}
          {epocas.size > 0 && pescas.size > 0 && ' y'}
          {pescas.size > 0 &&
            ` que se ${lista.length === 1 ? 'puede' : 'pueden'} pescar a ${enumerar(
              TIPOS_PESCA.filter(([k]) => pescas.has(k)).map(([, n]) => n.toLowerCase()),
              'y',
            )}`}
          .
        </p>
      )}
      <ul className="lista-especies" ref={refLista}>
        {lista.map((e) => {
          const cal = CALENDARIO[e.id]
          return (
            <li key={e.id} className={e.id === especie ? 'sel' : ''}>
              <button className="le-principal" onClick={() => abrirFicha(e.id)} title="Ver ficha">
                <FotoEspecie especie={e} className="le-foto" />
                <span className="le-texto">
                  <strong>{e.comun}</strong>
                  <em>{e.cientifico}</em>
                  <small>
                    <i className="punto" style={{ background: ORIGENES[e.origen].color }} /> {ORIGENES[e.origen].label} · {conteo[e.id] || 0} masas
                  </small>
                  {e.id === especie && <span className="le-en-mapa">En el mapa</span>}
                  {cal && (
                    <span className="le-epocas" title="Actividad por estación">
                      {ESTACIONES_FILTRO.map(([k, nombre, color]) => (
                        <i key={k} className={`nivel-${cal.estaciones[k]}`} style={{ '--c': color }} title={`${nombre}: ${['poco activo', 'activo', 'mejor época'][cal.estaciones[k]]}`} />
                      ))}
                    </span>
                  )}
                </span>
              </button>
              <button
                className={`le-info ${e.id === especie ? 'on' : ''}`}
                onClick={() => verEspecieEnMapa(e.id === especie ? null : e.id)}
                aria-label={`Ver en el mapa dónde vive ${e.comun}`}
                aria-pressed={e.id === especie}
                title={e.id === especie ? 'Dejar de mostrar en el mapa' : 'Ver en el mapa dónde vive'}
              >
                <IcoPin width={18} height={18} />
              </button>
            </li>
          )
        })}
        {lista.length === 0 && <li className="lista-vacia">Ninguna especie cumple los filtros.</li>}
      </ul>
    </>
  )
}

const LEYENDA_TIPOS = [
  ['embalse', 'Embalse'],
  ['lago', 'Lago'],
  ['laguna', 'Laguna'],
  ['humedal', 'Humedal'],
  ['balsa', 'Balsa o charca'],
  ['arroyo', 'Arroyo (el icono aparece con mucho zoom)'],
  ['rio', 'Río (punto de referencia de las masas revisadas)'],
]

function TabLeyenda() {
  return (
    <div className="leyenda-panel">
      <h4>Cuencas hidrográficas</h4>
      <ul className="ley-lista">
        {Object.entries(CUENCAS).map(([c, col]) => (
          <li key={c}>
            <span className="ley-linea" style={{ background: col }} /> {c}
          </li>
        ))}
      </ul>
      <h4>Tipo de masa de agua</h4>
      <ul className="ley-lista">
        <li><span className="mk-mini mk-rio-linea" /> Río o arroyo (trazado)</li>
        {LEYENDA_TIPOS.map(([t, texto]) => (
          <li key={t}>
            <span className="ley-icono" dangerouslySetInnerHTML={{ __html: svgInsignia(t, "#3f5c42", 18) }} /> {texto}
          </li>
        ))}
        <li className="ley-nota">Cada icono toma el color de su cuenca.</li>
      </ul>
      <h4>Origen de la especie</h4>
      <ul className="ley-lista">
        {Object.values(ORIGENES).map((o) => (
          <li key={o.label}><i className="punto" style={{ background: o.color }} /> {o.label}</li>
        ))}
      </ul>
      <h4>Riesgo de extinción (UICN)</h4>
      <p className="ley-texto">La barra muestra la escala completa de la Lista Roja; la marca indica la categoría de la especie.</p>
      <MedidorUICN cat="VU" />
      <ul className="ley-lista ley-uicn">
        <li><b>LC</b> Preocupación menor</li>
        <li><b>NT</b> Casi amenazada</li>
        <li><b>VU</b> Vulnerable</li>
        <li><b>EN</b> En peligro</li>
        <li><b>CR</b> En peligro crítico</li>
        <li><b>EW</b> Extinta en estado silvestre</li>
        <li><b>EX</b> Extinta</li>
      </ul>
    </div>
  )
}

export default function PanelLateral(props) {
  const { abierto, cerrar, tab, setTab } = props
  if (!abierto) return null
  return (
    <aside className="panel-lateral">
      <div className="panel-tabs">
        {[
          ['masas', 'Masas de agua'],
          ['especies', 'Especies'],
          ['leyenda', 'Leyenda'],
        ].map(([k, l]) => (
          <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>
            {l}
          </button>
        ))}
        <button className="panel-cerrar" onClick={cerrar} aria-label="Cerrar panel">
          <IcoCerrar width={16} height={16} />
        </button>
      </div>
      {tab !== 'leyenda' && (
        <div className="panel-reinicio">
          <button onClick={props.restablecer} disabled={tab === 'masas' && !props.hayFiltros} title="Quita la comunidad, los tipos, el texto y la especie elegidos">
            <IcoReiniciar width={15} height={15} /> Restablecer filtros
          </button>
        </div>
      )}
      <div className="panel-cuerpo">
        {tab === 'masas' && <TabMasas key={props.reinicio} {...props} />}
        {tab === 'especies' && <TabEspecies key={props.reinicio} {...props} />}
        {tab === 'leyenda' && <TabLeyenda />}
      </div>
    </aside>
  )
}
