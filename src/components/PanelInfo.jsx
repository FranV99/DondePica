import { useEffect, useMemo, useRef, useState } from 'react'
import { ORIGENES } from '../data/especies.js'
import MedidorUICN from './MedidorUICN.jsx'
import { CUENCAS } from '../data/masas.js'
import { TIPOS } from '../lib/util.js'
import { especiesDeMasa, regionesDeMasa } from '../lib/catalogo.js'
import FotoEspecie from './FotoEspecie.jsx'
import Plegable from './Plegable.jsx'
import { CATEGORIAS_ZONA, COLOR_ZONA, ORDEN_ZONA } from '../lib/zonas.js'
import { IcoAportar, IcoArea, IcoCerrar, IcoCuenca, IcoDocumento, IcoExpandir, IcoGota, IcoInfo, IcoMas, IcoMenos, IcoMontana, IcoPin, IcoRegla, IcoSubcuenca, IcoTipo } from './Iconos.jsx'

const ORDEN = ['endemica', 'nativa', 'exotica', 'invasora']
const esExotica = (e) => e.origen === 'exotica' || e.origen === 'invasora'
const PESTANAS = [
  ['', 'Todas'],
  ['autoctonas', 'Autóctonas'],
  ['exoticas', 'Exóticas e invasoras'],
]

const capitalizar = (t) => t.replace(/^RIO /, 'Río ').replace(/\B\w+/g, (w) => w.toLowerCase())

/** Datos de la masa de agua para la cuadrícula: [{ clave, icono, etiqueta, valor }] */
function datosMasa(m) {
  const d = [
    { clave: 'tipo', icono: <IcoTipo tipo={m.tipo} />, etiqueta: 'Tipo', valor: TIPOS[m.tipo]?.singular || '—' },
    { clave: 'cuenca', icono: <IcoCuenca />, etiqueta: 'Cuenca', valor: m.cuenca },
  ]
  if (m.subcuenca && m.subcuenca !== `RIO ${m.cuenca.toUpperCase()}`)
    d.push({ clave: 'subcuenca', icono: <IcoSubcuenca />, etiqueta: 'Subcuenca', valor: capitalizar(m.subcuenca) })
  if (m.zmin != null || m.elev != null)
    d.push({
      clave: 'altitud',
      icono: <IcoMontana />,
      etiqueta: 'Altitud',
      valor: m.elev != null ? `${m.elev.toLocaleString('es-ES')} m` : m.zmin === m.zmax ? `${m.zmin.toLocaleString('es-ES')} m` : `${m.zmin.toLocaleString('es-ES')}–${m.zmax.toLocaleString('es-ES')} m`,
    })
  if (m.longitud) d.push({ clave: 'longitud', icono: <IcoRegla />, etiqueta: 'Longitud', valor: `${m.longitud.toLocaleString('es-ES')} km` })
  else if (m.area) d.push({ clave: 'superficie', icono: <IcoArea />, etiqueta: 'Superficie', valor: `${m.area.toLocaleString('es-ES')} ha` })
  if (m.persist && m.persist !== 'permanente')
    d.push({ clave: 'caudal', icono: <IcoGota />, etiqueta: 'Caudal', valor: m.persist === 'estacional' ? 'Estacional' : 'Intermitente' })
  return d
}

function TarjetaEspecie({ e, activa, onFicha, onDistribucion }) {
  return (
    <article className={`tarjeta ${activa ? 'activa' : ''}`}>
      <button className="tarjeta-foto" onClick={onFicha} title="Ver ficha completa">
        <FotoEspecie especie={e} />
        <span className="tarjeta-origen" style={{ background: ORIGENES[e.origen].color }}>
          {ORIGENES[e.origen].label}
        </span>
      </button>
      <div className="tarjeta-cuerpo">
        <h4>{e.comun}</h4>
        <div className="tarjeta-cient">{e.cientifico}</div>
        <dl>
          <dt>Familia:</dt>
          <dd>{e.familia}</dd>
          {e.ceea && (
            <>
              <dt>CEEA:</dt>
              <dd>{e.ceea}</dd>
            </>
          )}
          {e.origen === 'invasora' && (
            <>
              <dt>Catálogo:</dt>
              <dd>Especie exótica invasora</dd>
            </>
          )}
        </dl>
        {!esExotica(e) && (
          <div className="tarjeta-uicn">
            <span className="tarjeta-uicn-tit">Riesgo de extinción (UICN)</span>
            <MedidorUICN cat={e.uicn} compacto />
          </div>
        )}
        {e.notaLocal && <p className="tarjeta-nota">{e.notaLocal}</p>}
      </div>
      <div className="tarjeta-pie">
        <button onClick={onDistribucion} title="Ver en el mapa dónde vive">
          <IcoPin width={15} height={15} /> Distribución
        </button>
        <button onClick={onFicha} title="Ficha completa">
          <IcoDocumento width={15} height={15} /> Ficha
        </button>
      </div>
    </article>
  )
}

const PLURAL_ZONA = { r: 'refugios', l: 'libres / sin muerte', c: 'controladas' }

/** Zonas de pesca de la masa: refugios, tramos libres o sin muerte y zonas controladas */
function ZonasMasa({ zonas, idx, comunidadesMasa, verZona, contribuir, nombre, zonaAbierta = null, alAbrirZona }) {
  const [abierta, setAbierta] = useState(zonaAbierta)
  // al pulsar otra zona en el mapa se despliega esa
  const [previa, setPrevia] = useState(zonaAbierta)
  if (zonaAbierta !== previa) {
    setPrevia(zonaAbierta)
    if (zonaAbierta) setAbierta(zonaAbierta)
  }
  const lista = useRef(null)
  useEffect(() => {
    if (!zonaAbierta || !lista.current) return
    const t = setTimeout(() => lista.current?.querySelector(`[data-zona="${CSS.escape(zonaAbierta)}"]`)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }), 350)
    return () => clearTimeout(t)
  }, [zonaAbierta])
  if (!idx) return null
  const conDatos = comunidadesMasa.filter((c) => idx.fuentes?.[c.codigo])
  const sinDatos = comunidadesMasa.filter((c) => !idx.fuentes?.[c.codigo])
  const n = (k) => zonas.filter((z) => z.cat === k).length
  return (
    <div className="pi-zonas">
      <h4 className="pi-subtitulo">Zonas de pesca</h4>
      {zonas.length > 0 && (
        <div className="pz-resumen">
          {ORDEN_ZONA.filter(n).map((k) => (
            <span key={k} className="pz-chip" style={{ '--c': COLOR_ZONA[k] }}>
              <i /> {n(k)} {n(k) === 1 ? CATEGORIAS_ZONA[k].corto.toLowerCase() : PLURAL_ZONA[k]}
            </span>
          ))}
        </div>
      )}
      {zonas.length > 0 ? (
        <ul className="pz-lista" ref={lista}>
          {zonas.map((z) => {
            const ab = abierta === z.id
            return (
              <li key={z.id} data-zona={z.id} className={`pz-zona ${ab ? 'abierta' : ''}`} style={{ '--c': COLOR_ZONA[z.cat] }}>
                <button
                  className="pz-cab"
                  onClick={(e) => {
                    setAbierta(ab ? null : z.id)
                    alAbrirZona?.(ab ? null : z)
                    // al desplegar, que la zona quede a la vista dentro de la lista
                    const li = e.currentTarget.parentElement
                    if (!ab) setTimeout(() => li?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }), 320)
                  }}
                  aria-expanded={ab}
                >
                  <span className="pz-marca" />
                  <span className="pz-txt">
                    <b>{z.nom || z.rio}</b>
                    <small>
                      {z.sub}
                      {z.km ? ` · ${z.km.toLocaleString('es-ES')} km` : ''}
                    </small>
                  </span>
                  <span className="pz-flecha" aria-hidden>
                    ›
                  </span>
                </button>
                <Plegable abierto={ab}>
                  <div className="pz-cuerpo">
                    <p className="pz-cat">
                      <b>{CATEGORIAS_ZONA[z.cat].nombre}:</b> {CATEGORIAS_ZONA[z.cat].desc.toLowerCase()}.
                    </p>
                    {z.lim && <p className="pz-lim">{z.lim}</p>}
                    {z.reg.length > 0 && (
                      <dl>
                        {z.reg.map(([k, v]) => (
                          <div key={k}>
                            <dt>{k}</dt>
                            <dd>{v}</dd>
                          </div>
                        ))}
                      </dl>
                    )}
                    <div className="pz-pie">
                      <button onClick={() => verZona(z)} title="Encuadrar la zona en el mapa">
                        <IcoPin width={14} height={14} /> Ver en el mapa
                      </button>
                      {idx.fuentes?.[z.cc]?.web && (
                        <a href={idx.fuentes[z.cc].web} target="_blank" rel="noreferrer">
                          Fuente oficial ↗
                        </a>
                      )}
                    </div>
                  </div>
                </Plegable>
              </li>
            )
          })}
        </ul>
      ) : conDatos.length > 0 ? (
        <p className="pz-vacio">No hemos encontrado zonas reguladas con el nombre de {nombre}: aquí rige la normativa general de pesca de {conDatos.map((c) => c.nombre).join(' y ')}.</p>
      ) : null}
      {sinDatos.length > 0 && zonas.length === 0 && (
        <p className="pz-vacio">
          {sinDatos.map((c) => c.nombre).join(', ')} no publica todavía sus zonas de pesca como datos abiertos.
        </p>
      )}
      <p className="pz-nota">
        Información orientativa a partir de datos abiertos. Antes de pescar, consulta la orden de vedas vigente.
        {contribuir && (
          <>
            {' '}
            <button className="pz-enlace" onClick={contribuir}>
              ¿Ves algún error?
            </button>
          </>
        )}
      </p>
    </div>
  )
}

export default function PanelInfo({ masa, cerrar, especie, setEspecie, abrirFicha, plegado, setPlegado, grande, setGrande, region, todasRegiones, listaCcaa, contribuir, zonas = [], zonasIdx, verZona, contribuirNormativa, zonaAbierta, alAbrirZona }) {
  const [filtro, setFiltro] = useState('') // '', 'autoctonas', 'exoticas'
  const { especies, avisos } = useMemo(() => especiesDeMasa(masa), [masa])
  // comunidades autónomas por las que pasa (solo se calcula con una comunidad elegida)
  const comunidades = useMemo(() => {
    if (!region || !todasRegiones) return null
    const nombre = Object.fromEntries(listaCcaa.map((c) => [c.codigo, c.nombre]))
    return regionesDeMasa(masa, todasRegiones).map((c) => ({ codigo: c, nombre: nombre[c] }))
  }, [masa, region, todasRegiones, listaCcaa])

  const lista = especies
    .filter((e) => !filtro || (filtro === 'autoctonas' ? ['endemica', 'nativa'].includes(e.origen) : ['exotica', 'invasora'].includes(e.origen)))
    .sort((a, b) => ORDEN.indexOf(a.origen) - ORDEN.indexOf(b.origen) || a.comun.localeCompare(b.comun, 'es'))

  // comunidades por las que pasa (para saber si tienen datos de zonas de pesca)
  const comunidadesMasa = useMemo(() => {
    if (!todasRegiones?.length || !zonasIdx) return []
    const nombre = Object.fromEntries(listaCcaa.map((c) => [c.codigo, c.nombre]))
    return regionesDeMasa(masa, todasRegiones).map((c) => ({ codigo: c, nombre: nombre[c] || c }))
  }, [masa, todasRegiones, listaCcaa, zonasIdx])
  const n = (...o) => especies.filter((e) => o.includes(e.origen)).length
  const amenazadas = especies.filter((e) => !esExotica(e) && (['CR', 'EN', 'VU'].includes(e.uicn) || e.ceea)).length
  const datos = useMemo(() => datosMasa(masa), [masa])

  return (
    <section className={`panel-info ${plegado ? 'plegado' : ''} ${grande ? 'grande' : ''}`}>
      <div className="pi-barra">
        <span className="pi-tab">
          <IcoInfo width={15} height={15} /> INFORMACIÓN
        </span>
        <span className="pi-controles">
          <button onClick={() => setPlegado(!plegado)} aria-label={plegado ? 'Desplegar' : 'Minimizar'} title={plegado ? 'Desplegar' : 'Minimizar'}>
            {plegado ? <IcoMas /> : <IcoMenos />}
          </button>
          {!plegado && (
            <button onClick={() => setGrande(!grande)} aria-label={grande ? 'Reducir' : 'Ampliar'} title={grande ? 'Reducir' : 'Ampliar'}>
              <IcoExpandir />
            </button>
          )}
          <button onClick={cerrar} aria-label="Cerrar" title="Cerrar">
            <IcoCerrar />
          </button>
        </span>
      </div>
      {plegado && <div className="pi-plegado-nombre">{masa.nombre}</div>}

      {!plegado && (
        <div className="pi-contenido">
          <div className="pi-masa">
            <h3 className="pi-titulo" style={{ '--c': CUENCAS[masa.cuenca] }}>{masa.nombre}</h3>
            <dl className="pi-datos" style={{ '--cols': Math.ceil(datos.length / 2) }}>
              {datos.map((x) => (
                <div key={x.clave} className="pi-dato">
                  <span className="pi-dato-ico">{x.icono}</span>
                  <span className="pi-dato-txt">
                    <dt>{x.etiqueta}</dt>
                    <dd title={x.valor}>{x.valor}</dd>
                  </span>
                </div>
              ))}
            </dl>
            <div className="pi-sello">
              <span className={`sello ${masa.revisada ? 'sello-rev' : 'sello-auto'}`}>
                {masa.revisada ? '✓ Especies revisadas' : 'Especies estimadas automáticamente'}
              </span>
            </div>
            {comunidades && comunidades.length > 1 && comunidades.some((c) => c.codigo === region.codigo) && (
              <p className="pi-tramo">
                Se muestra solo el tramo en <b>{region.nombre}</b>. También pasa por:{' '}
                {comunidades
                  .filter((c) => c.codigo !== region.codigo)
                  .map((c) => c.nombre)
                  .join(', ')}
                .
              </p>
            )}
            {comunidades && !comunidades.some((c) => c.codigo === region.codigo) && (
              <p className="pi-tramo">Esta masa de agua no está en {region.nombre}.</p>
            )}
            {masa.descripcion && <p>{masa.descripcion}</p>}
            {masa.auto && (
              <p className="pi-nota-auto">
                Estimación a partir de la cuenca, la altitud y el tipo de masa de agua. Puede incluir especies ausentes o faltar
                otras: tómala como orientación.
              </p>
            )}
            {avisos.map((a) => (
              <p key={a} className="pi-aviso">
                ⚠ {a}
              </p>
            ))}
          </div>

          <ZonasMasa zonas={zonas} idx={zonasIdx} comunidadesMasa={comunidadesMasa} verZona={verZona} contribuir={contribuirNormativa} nombre={masa.nombre} zonaAbierta={zonaAbierta} alAbrirZona={alAbrirZona} />

          <div className="pi-pestanas" role="tablist">
            {PESTANAS.map(([k, t]) => (
              <button key={k} role="tab" aria-selected={filtro === k} className={filtro === k ? 'on' : ''} onClick={() => setFiltro(k)}>
                {t} <span className="pi-num">{k === '' ? especies.length : k === 'autoctonas' ? n('endemica', 'nativa') : n('exotica', 'invasora')}</span>
              </button>
            ))}
          </div>
          {amenazadas > 0 && filtro !== 'exoticas' && (
            <p className="pi-amenazadas">
              <b>{amenazadas}</b> {amenazadas === 1 ? 'especie amenazada' : 'especies amenazadas'} (UICN o Catálogo Español)
            </p>
          )}
          {lista.length === 0 && <p className="pi-vacio">No hay especies de este grupo en esta masa de agua.</p>}
          <div className="pi-tarjetas">
            {lista.map((e) => (
              <TarjetaEspecie
                key={e.id}
                e={e}
                activa={e.id === especie}
                onFicha={() => abrirFicha(e.id)}
                onDistribucion={() => setEspecie(e.id)}
              />
            ))}
          </div>
          {contribuir && (
            <div className="pi-contribuir">
              <p>
                <b>¿Falta algún pez aquí?</b>
                Si has pescado o visto otra especie en {masa.nombre}, ayúdanos a completar el mapa.
              </p>
              <button className="btn-amarillo btn-coral" onClick={contribuir}>
                <IcoAportar /> Añadir
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  )
}

/** Panel derecho para una zona de pesca cuya agua aún no está en el catálogo */
export function PanelZona({ zona, zonasIdx, cerrar, plegado, setPlegado, grande, setGrande, verZona, contribuir }) {
  const fuente = zonasIdx?.fuentes?.[zona.cc]
  const nombre = zona.rio || zona.nom
  const datos = [
    { clave: 'zona', icono: <IcoInfo />, etiqueta: 'Tipo de zona', valor: CATEGORIAS_ZONA[zona.cat].nombre },
    fuente && { clave: 'ccaa', icono: <IcoPin />, etiqueta: 'Comunidad', valor: fuente.nombre },
    zona.km && { clave: 'km', icono: <IcoRegla />, etiqueta: 'Longitud del tramo', valor: `${zona.km.toLocaleString('es-ES')} km` },
  ].filter(Boolean)
  return (
    <section className={`panel-info ${plegado ? 'plegado' : ''} ${grande ? 'grande' : ''}`}>
      <div className="pi-barra">
        <span className="pi-tab">
          <IcoInfo width={15} height={15} /> INFORMACIÓN
        </span>
        <span className="pi-controles">
          <button onClick={() => setPlegado(!plegado)} aria-label={plegado ? 'Desplegar' : 'Minimizar'} title={plegado ? 'Desplegar' : 'Minimizar'}>
            {plegado ? <IcoMas /> : <IcoMenos />}
          </button>
          {!plegado && (
            <button onClick={() => setGrande(!grande)} aria-label={grande ? 'Reducir' : 'Ampliar'} title={grande ? 'Reducir' : 'Ampliar'}>
              <IcoExpandir />
            </button>
          )}
          <button onClick={cerrar} aria-label="Cerrar" title="Cerrar">
            <IcoCerrar />
          </button>
        </span>
      </div>
      {plegado && <div className="pi-plegado-nombre">{nombre}</div>}
      {!plegado && (
        <div className="pi-contenido">
          <div className="pi-masa">
            <h3 className="pi-titulo" style={{ '--c': COLOR_ZONA[zona.cat] }}>{nombre}</h3>
            <dl className="pi-datos" style={{ '--cols': Math.ceil(datos.length / 2) }}>
              {datos.map((x) => (
                <div key={x.clave} className="pi-dato">
                  <span className="pi-dato-ico">{x.icono}</span>
                  <span className="pi-dato-txt">
                    <dt>{x.etiqueta}</dt>
                    <dd title={x.valor}>{x.valor}</dd>
                  </span>
                </div>
              ))}
            </dl>
            <p className="pi-nota-auto">
              Este tramo aparece en los datos de pesca de {fuente?.nombre || 'la comunidad'}, pero el agua todavía no está en el catálogo de
              DóndePica (suele pasar con barrancos, acequias y arroyos pequeños), así que aún no podemos mostrar qué peces viven en ella.
            </p>
          </div>
          <ZonasMasa zonas={[zona]} idx={zonasIdx} comunidadesMasa={[]} verZona={verZona} nombre={nombre} zonaAbierta={zona.id} />
          {contribuir && (
            <div className="pi-contribuir">
              <p>
                <b>¿Conoces esta agua?</b>
                Ayúdanos a añadir {nombre} al mapa y a contar qué peces viven en ella.
              </p>
              <button className="btn-amarillo btn-coral" onClick={contribuir}>
                <IcoAportar /> Añadir
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
