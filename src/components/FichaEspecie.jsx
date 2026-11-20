import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { ESPECIES_POR_ID, ORIGENES } from '../data/especies.js'
import { FOTOS, FOTOS_VARIEDADES } from '../data/fotos.js'
import { CALENDARIO, TECNICAS, NO_PESCABLE } from '../data/tecnicas.js'
import { Estaciones, RelojHorizontal, TiempoIdeal } from './Calendario.jsx'
import { CreditosCebos, GaleriaCebos } from './Cebos.jsx'
import { ESTADOS } from '../data/normativa.js'
import MedidorUICN from './MedidorUICN.jsx'
import { MASAS, CUENCAS } from '../data/masas.js'
import { especieIds } from '../lib/util.js'
import { masaPorId, masasConEspecie } from '../lib/catalogo.js'
import { comunidadesConEspecie, reglaEspecie } from '../lib/normativa.js'
import FotoEspecie from './FotoEspecie.jsx'
import Plegable from './Plegable.jsx'
import { IcoAbajo, IcoAportar, IcoCerrar, IcoLupa, IcoPin } from './Iconos.jsx'

// llamada a contribuir al pie de cada pestaña
const APORTE = {
  info: { tipo: 'especie-masa', tit: '¿Lo has visto donde no aparece?', txt: 'Si lo has pescado o visto en otra masa de agua, añádelo al mapa.' },
  tecnica: { tipo: 'tecnica', tit: '¿Tienes un truco que funciona?', txt: 'Comparte tu cebo, señuelo o montaje favorito para esta especie.' },
  normativa: { tipo: 'normativa', tit: '¿Ha cambiado la normativa?', txt: 'Si la orden de pesca de tu comunidad es distinta, avísanos con el enlace al boletín.' },
}

const PESTANAS = [
  ['info', 'Información'],
  ['tecnica', 'Cómo se pesca'],
  ['normativa', 'Normativa'],
]

const ETIQUETA_ORIGEN = { endemica: 'Endémica ibérica', nativa: 'Especie autóctona', exotica: 'Especie exótica', invasora: 'Especie invasora' }

/** Llamada a contribuir (al pie de cada pestaña) */
function Aporte({ tipo, contribuir, e, masa, ccaa, listaCcaa, compacto }) {
  if (!contribuir) return null
  const a = APORTE[tipo]
  return (
    <div className={`ficha-contribuir ${compacto ? 'compacto' : ''}`}>
      <p>
        <b>{a.tit}</b>
        {a.txt}
      </p>
      <button
        className="btn-amarillo btn-coral"
        onClick={() =>
          contribuir({
            tipo: a.tipo,
            especie: e.comun,
            masa: tipo === 'info' && masa ? masa.nombre : '',
            ccaa: tipo === 'normativa' ? listaCcaa.find((c) => c.codigo === ccaa)?.nombre || '' : '',
            contexto: `ficha ${e.id}`,
          })
        }
      >
        <IcoAportar /> Contribuir
      </button>
    </div>
  )
}

/** Ficha ampliada de una especie: una carpeta de archivo con tres pestañas. */
export default function FichaEspecie({ id, cerrar, setEspecie, setSeleccion, ccaa, masa, listaCcaa = [], regiones = [], contribuir, alMapa }) {
  const e = ESPECIES_POR_ID[id]
  const masas = useMemo(() => MASAS.filter((m) => especieIds(m).includes(id)), [id])
  const conjunto = useMemo(() => masasConEspecie(id) || new Set(), [id])
  const total = conjunto.size
  const presentes = useMemo(() => comunidadesConEspecie(id, regiones), [id, regiones])
  const [pestana, setPestana] = useState('info')

  useEffect(() => {
    const onKey = (ev) => ev.key === 'Escape' && cerrar()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [cerrar])

  if (!e) return null
  const comun = { e, masa, ccaa, listaCcaa, contribuir }

  return (
    <div className="modal-fondo ficha-fondo" onClick={cerrar}>
      <div className="carpeta" role="dialog" aria-label={e.comun} onClick={(ev) => ev.stopPropagation()}>
        {/* pestaña con la etiqueta de la carpeta */}
        <div className="carpeta-solapa">
          <div className={`carpeta-etiqueta ${e.comun.length > 30 ? 'muy-largo' : e.comun.length > 20 ? 'largo' : ''}`} title={`${e.comun} (${e.cientifico})`}>
            <b>{e.comun}</b>
            <i>{e.cientifico}</i>
          </div>
        </div>
        <nav className="carpeta-pestanas" role="tablist">
          {PESTANAS.map(([k, t]) => (
            <button key={k} role="tab" aria-selected={pestana === k} className={pestana === k ? 'activa' : ''} onClick={() => setPestana(k)}>
              {t}
            </button>
          ))}
        </nav>
        <button className="carpeta-cerrar" onClick={cerrar} aria-label="Cerrar ficha" title="Cerrar">
          <IcoCerrar />
        </button>
        <div className="carpeta-cuerpo">
          <div className="hoja">
            {pestana === 'info' && (
              <Informacion e={e} masas={masas} total={total} conjunto={conjunto} regiones={regiones} setEspecie={setEspecie} setSeleccion={setSeleccion} cerrar={alMapa || cerrar} aporte={<Aporte tipo="info" compacto {...comun} />} />
            )}
            {pestana === 'tecnica' && <Tecnica key={id} id={id} irANormativa={() => setPestana('normativa')} aporte={<Aporte tipo="tecnica" {...comun} />} />}
            {pestana === 'normativa' && (
              <div className="ficha-panel">
                <Normativa id={id} ccaa={ccaa} masa={masa} listaCcaa={listaCcaa} presentes={presentes} />
                <Aporte tipo="normativa" {...comun} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/** Mapa pequeño de España con las masas de agua donde vive la especie */
function MiniMapa({ regiones, conjunto, onClick }) {
  const W = 340
  const H = 280
  const [w, so, ea, n] = [-9.5, 35.9, 3.4, 43.9]
  const kx = W / ((ea - w) * Math.cos((40 * Math.PI) / 180))
  const k = Math.min(kx, H / (n - so))
  const ox = (W - (ea - w) * Math.cos((40 * Math.PI) / 180) * k) / 2
  const px = (lon, lat) => [ox + (lon - w) * Math.cos((40 * Math.PI) / 180) * k, (n - lat) * k + 4]
  const caminos = useMemo(
    () =>
      regiones.map((r) => {
        let d = ''
        for (const a of r.anillos || []) {
          let ult = null
          a.forEach((p, i) => {
            const [x, y] = px(p[0], p[1])
            if (i && ult && Math.hypot(x - ult[0], y - ult[1]) < 1.2 && i !== a.length - 1) return
            d += `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`
            ult = [x, y]
          })
          d += 'Z'
        }
        return { cod: r.codigo, d }
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [regiones],
  )
  const puntos = useMemo(() => {
    const res = []
    for (const id of conjunto) {
      const m = masaPorId(id)
      if (!m?.punto) continue
      const [x, y] = px(m.punto[1], m.punto[0])
      res.push({ id, x, y, c: CUENCAS[m.cuenca] || '#3f5c42' })
    }
    return res
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conjunto])
  return (
    <button className="minimapa" onClick={onClick} aria-label="Ver en el mapa dónde vive">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Mapa de distribución">
        <g className="minimapa-tierra">
          {caminos.map((c) => (
            <path key={c.cod} d={c.d} fillRule="evenodd" />
          ))}
        </g>
        <g>
          {puntos.map((p) => (
            <circle key={p.id} cx={p.x} cy={p.y} r={puntos.length > 1500 ? 1.4 : puntos.length > 300 ? 2 : puntos.length > 40 ? 3 : 4.5} fill={p.c} />
          ))}
        </g>
      </svg>
      {!puntos.length && <span className="minimapa-vacio">Sin puntos en el mapa</span>}
      {/* aparece al pasar el ratón por encima del mapa */}
      <span className="minimapa-accion" aria-hidden>
        <span className="btn-grabado">
          <IcoPin width={20} height={20} /> Ver dónde vive
        </span>
      </span>
    </button>
  )
}

/** Foto a pantalla completa (se cierra con clic, Escape o el botón) */
function VisorFoto({ foto, titulo, subtitulo, cerrar }) {
  // versión más grande en iNaturalist; en Commons se pide una miniatura mayor
  const url = foto.url.replace(/\/(medium|small)\.(jpe?g|png)/i, '/large.$2').replace(/\/\d+px-/, '/1280px-')
  const [src, setSrc] = useState(url)
  useEffect(() => {
    const onKey = (ev) => {
      if (ev.key !== 'Escape') return
      ev.stopImmediatePropagation()
      cerrar()
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [cerrar])
  // se dibuja en <body>: dentro de la carpeta (que tiene sombra con filter) «fixed» no ocuparía toda la pantalla
  return createPortal(
    <div className="visor-foto" role="dialog" aria-label={`Foto de ${titulo}`} onClick={cerrar}>
      <button className="visor-cerrar" onClick={cerrar} aria-label="Cerrar foto">
        <IcoCerrar />
      </button>
      <figure onClick={(ev) => ev.stopPropagation()}>
        <img src={src} alt={`${titulo} (${subtitulo})`} onError={() => src !== foto.url && setSrc(foto.url)} />
        <figcaption>
          <b>{titulo}</b> <i>{subtitulo}</i>
          <span>
            Foto: {foto.autor} ·{' '}
            <a href={foto.fuente} target="_blank" rel="noreferrer">
              {foto.licencia}
            </a>
          </span>
        </figcaption>
      </figure>
    </div>,
    document.body,
  )
}

function Informacion({ e, masas, total, conjunto, regiones, setEspecie, setSeleccion, cerrar, aporte }) {
  const exotica = e.origen === 'exotica' || e.origen === 'invasora'
  const foto = FOTOS[e.id]
  const [grande, setGrande] = useState(false)
  const [fotoVariedad, setFotoVariedad] = useState(null) // { foto, titulo, subtitulo }
  const verMapa = () => {
    setEspecie(e.id)
    setSeleccion(null)
    cerrar()
  }
  // ficha técnica: celdas del mismo tamaño en una cuadrícula
  const datos = exotica
    ? [
        ['Familia', e.familia],
        ['Catálogo Español de Especies Amenazadas', e.ceea || 'No incluida'],
        ['Catálogo de Especies Exóticas Invasoras', e.origen === 'invasora' ? e.notaEEI || 'Incluida (RD 630/2013). Prohibida su suelta, transporte y comercio.' : 'No incluida', 'ancha'],
      ]
    : [
        ['Familia', e.familia],
        ['Riesgo de extinción (UICN)', <MedidorUICN key="u" cat={e.uicn} />],
        ['Catálogo Español de Especies Amenazadas', e.ceea || 'No incluida', 'ancha'],
      ]
  return (
    <div className="ficha-info">
      {/* 1 · foto y nombre */}
      <div className="fi-foto marco-wrap">
        <div
          className={`marco-foto ${foto ? 'ampliable' : ''}`}
          role={foto ? 'button' : undefined}
          tabIndex={foto ? 0 : undefined}
          aria-label={foto ? `Ver la foto de ${e.comun} en grande` : undefined}
          onClick={(ev) => foto && !ev.target.closest('a') && setGrande(true)}
          onKeyDown={(ev) => foto && (ev.key === 'Enter' || ev.key === ' ') && (ev.preventDefault(), setGrande(true))}
        >
          <FotoEspecie especie={e} credito className="ficha-foto" />
          {foto && (
            <span className="marco-lupa" aria-hidden>
              <IcoLupa /> Ver en grande
            </span>
          )}
        </div>
        {grande && <VisorFoto foto={foto} titulo={e.comun} subtitulo={e.cientifico} cerrar={() => setGrande(false)} />}
        {fotoVariedad && <VisorFoto {...fotoVariedad} cerrar={() => setFotoVariedad(null)} />}
        {/* clip metálico sujetando la foto */}
        <svg className="clip-papel" viewBox="0 0 30 74" aria-hidden>
          <path d="M9 64V14a6 6 0 0 1 12 0v44a3.5 3.5 0 0 1-7 0V20" fill="none" stroke="url(#metal)" strokeWidth="2.6" strokeLinecap="round" />
          <path d="M5 58V10a10 10 0 0 1 20 0v52" fill="none" stroke="url(#metal)" strokeWidth="2.6" strokeLinecap="round" />
          <defs>
            <linearGradient id="metal" x1="0" x2="1">
              <stop offset="0" stopColor="#8d9196" />
              <stop offset=".45" stopColor="#e9ecef" />
              <stop offset=".7" stopColor="#b5babf" />
              <stop offset="1" stopColor="#7a7f85" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <header className="fi-cabecera ficha-datos">
        <h2>{e.comun}</h2>
        <p className="ficha-cient">{e.cientifico}</p>
        <span className={`sello-origen origen-${e.origen}`} style={{ '--c': ORIGENES[e.origen].color }}>
          {ETIQUETA_ORIGEN[e.origen]}
        </span>
        {/* ficha técnica */}
        <dl className="fi-tecnica">
          {datos.map(([k, v, clase]) => (
            <div key={k} className={clase}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
        {e.nota && <p className="ficha-nota">{e.nota}</p>}
      </header>

      {/* 3 · variedades */}
      {e.variedades?.length > 0 && (
        <section className="fi-bloque">
          <h3 className="fi-tit">
            Variedades <small>{e.variedades.length}</small>
          </h3>
          <ul className="variedades">
            {e.variedades.map((v) => {
              const f = v.id && FOTOS_VARIEDADES[`${e.id}:${v.id}`]
              return (
                <li key={v.nombre}>
                  {f ? (
                    <button
                      className="variedad-foto ampliable"
                      onClick={() => setFotoVariedad({ foto: f, titulo: v.nombre, subtitulo: e.cientifico })}
                      aria-label={`Ver la foto de ${v.nombre} en grande`}
                      title={`Ver en grande · Foto: ${f.autor} · ${f.licencia}`}
                    >
                      <span className="foto-fondo" style={{ backgroundImage: `url("${f.url}")` }} aria-hidden />
                      <img src={f.url} alt={v.nombre} loading="lazy" />
                      <span className="variedad-lupa" aria-hidden>
                        <IcoLupa />
                      </span>
                    </button>
                  ) : (
                    <span className="variedad-foto vacia" title="Sin foto libre disponible" aria-hidden>
                      <svg viewBox="0 0 120 60">
                        <path d="M8 30c14-17 40-23 66-12l18-12v48l-18-12C48 53 22 47 8 30Z" fill="currentColor" opacity="0.35" />
                      </svg>
                    </span>
                  )}
                  <div>
                    <b>{v.nombre}</b>
                    <p>{v.descripcion}</p>
                  </div>
                </li>
              )
            })}
          </ul>
        </section>
      )}

      {/* 4 · dónde vive: lista y mapa a la misma altura */}
      <section className="fi-bloque fi-presente">
        <h3 className="fi-tit">
          Presente en <small>{total.toLocaleString('es-ES')} {total === 1 ? 'masa de agua' : 'masas de agua'}</small>
        </h3>
        <div className="fi-presente-lista">
          {masas.length > 0 ? (
            <>
              <p className="presente-total">{masas.length === 1 ? 'Revisada una a una:' : `${masas.length} revisadas una a una:`}</p>
              <div className="presente-chips">
                {masas.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      setSeleccion(m.id)
                      cerrar()
                    }}
                    style={{ '--c': CUENCAS[m.cuenca] }}
                    title={`Cuenca: ${m.cuenca}`}
                  >
                    <i /> {m.nombre}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <p className="presente-total">Ninguna de las masas revisadas una a una; el mapa muestra dónde se estima que vive.</p>
          )}
        </div>
        <div className="fi-presente-mapa">
          <MiniMapa regiones={regiones} conjunto={conjunto} onClick={verMapa} />
        </div>
      </section>

      {/* 5 · contribuir */}
      <div className="fi-aporte">{aporte}</div>
    </div>
  )
}

const CAMPOS = [
  ['cana', 'Caña'],
  ['carrete', 'Carrete'],
  ['linea', 'Línea'],
  ['senuelos', 'Señuelos'],
  ['cebos', 'Cebos'],
  ['anzuelos', 'Anzuelos'],
  ['montaje', 'Montaje'],
]

function Tecnica({ id, irANormativa, aporte }) {
  const t = TECNICAS[id]
  const cal = CALENDARIO[id]
  // modalidades desplegadas (al abrir la ficha, todas)
  const [abiertas, setAbiertas] = useState(() => new Set((t?.modalidades || []).map((_, i) => i)))
  const alternar = (i) =>
    setAbiertas((a) => {
      const n = new Set(a)
      if (n.has(i)) n.delete(i)
      else n.add(i)
      return n
    })
  if (!t)
    return (
      <div className="tecnica">
        <div className="ficha-aviso">
          <strong>No es objeto de pesca recreativa.</strong>
          <p>{NO_PESCABLE[id] || 'No hay técnicas de pesca recomendadas para esta especie.'}</p>
        </div>
        <div className="ficha-panel tecnica-notas">{aporte}</div>
      </div>
    )
  const todas = abiertas.size === t.modalidades.length
  return (
    <div className="tecnica">
      <div className="tecnica-intro">
        <p className="tecnica-resumen">{t.resumen}</p>
        {t.modalidades.length > 1 && (
          <button className="enlace" onClick={() => setAbiertas(todas ? new Set() : new Set(t.modalidades.map((_, i) => i)))}>
            {todas ? 'Plegar modalidades' : 'Desplegar todas'}
          </button>
        )}
      </div>
      {t.modalidades.map((m, i) => {
        const conCebos = m.senuelos || m.cebos
        const abierta = abiertas.has(i)
        return (
          <section key={m.nombre} className={`mod ${conCebos ? '' : 'sin-cebos'} ${abierta ? 'abierta' : ''}`}>
            <h3>
              <button className="mod-titulo" onClick={() => alternar(i)} aria-expanded={abierta}>
                <span>{m.nombre}</span>
                <IcoAbajo className="mod-flecha" width={22} height={22} />
              </button>
            </h3>
            <Plegable abierto={abierta}>
              <div className="mod-cuerpo">
                <dl className="mod-equipo">
                  {CAMPOS.filter(([k]) => m[k] && k !== 'senuelos' && k !== 'cebos').map(([k, label]) => (
                    <div key={k}>
                      <dt>{label}</dt>
                      <dd>{m[k]}</dd>
                    </div>
                  ))}
                </dl>
                {conCebos && (
                  <div className="mod-cebos">
                    {m.senuelos && (
                      <>
                        <h4 className="cebos-tit">Señuelos</h4>
                        <GaleriaCebos textos={m.senuelos} />
                      </>
                    )}
                    {m.cebos && (
                      <>
                        <h4 className="cebos-tit">Cebos</h4>
                        <GaleriaCebos textos={m.cebos} />
                      </>
                    )}
                  </div>
                )}
              </div>
            </Plegable>
          </section>
        )
      })}
      {cal && (
        <section className="cal">
          <h4 className="cal-tit">Mejor época</h4>
          <Estaciones valores={cal.estaciones} />
          {t.epoca && <p className="cal-nota">{t.epoca}</p>}
          <h4 className="cal-tit cal-sep">Mejores horas</h4>
          <RelojHorizontal franjas={cal.horas} />
          {t.horario && <p className="cal-nota">{t.horario}</p>}
          <h4 className="cal-tit cal-sep">Tiempo más favorable</h4>
          <TiempoIdeal valores={cal.tiempo} />
        </section>
      )}
      <div className="ficha-panel tecnica-notas">
        {t.consejos?.length > 0 && (
          <ul className="tecnica-consejos">
            {t.consejos.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        )}
        <CreditosCebos modalidades={t.modalidades} />
        <p className="ficha-pie">
          Qué cebos, señuelos y anzuelos están permitidos depende de la comunidad y del tramo:{' '}
          <button className="enlace" onClick={irANormativa}>
            consulta la normativa
          </button>
          .
        </p>
        {aporte}
      </div>
    </div>
  )
}

function Normativa({ id, ccaa, masa, listaCcaa, presentes }) {
  // comunidades ordenadas: primero donde vive la especie según el visor
  const lista = useMemo(
    () => [...listaCcaa].sort((a, b) => presentes.has(b.codigo) - presentes.has(a.codigo) || a.nombre.localeCompare(b.nombre, 'es')),
    [listaCcaa, presentes],
  )
  const inicial = ccaa || lista.find((c) => presentes.has(c.codigo) && reglaEspecie(id, c.codigo)?.propia)?.codigo || lista[0]?.codigo || ''
  const [elegida, setCod] = useState('')
  const cod = elegida || inicial
  const r = cod ? reglaEspecie(id, cod) : null
  const nombre = listaCcaa.find((c) => c.codigo === cod)?.nombre || ''
  if (!listaCcaa.length) return <p className="ficha-aviso">Cargando comunidades…</p>

  return (
    <div className="normativa">
      <div className="norm-ccaa" role="listbox" aria-label="Comunidad autónoma">
        {lista.map((c) => {
          const rc = reglaEspecie(id, c.codigo)
          const est = ESTADOS[rc?.estado] || ESTADOS.sin_dato
          return (
            <button
              key={c.codigo}
              role="option"
              aria-selected={c.codigo === cod}
              className={`${c.codigo === cod ? 'activa' : ''} ${presentes.has(c.codigo) ? '' : 'ausente'}`}
              onClick={() => setCod(c.codigo)}
              title={`${c.nombre}: ${est.label}${presentes.has(c.codigo) ? '' : ' (no consta en el visor)'}`}
            >
              <i style={{ background: est.color }} />
              {c.nombre}
            </button>
          )
        })}
      </div>

      {r && (
        <div className="norm-detalle">
          <div className="norm-titulo">
            <h3>{nombre}</h3>
            <span className="norm-estado" style={{ background: (ESTADOS[r.estado] || ESTADOS.sin_dato).color }}>
              {(ESTADOS[r.estado] || ESTADOS.sin_dato).label}
            </span>
          </div>
          {masa && !elegida && cod === ccaa && (
            <p className="norm-origen">
              Comunidad de <b>{masa.nombre}</b>, la masa de agua seleccionada.
            </p>
          )}
          {!presentes.has(cod) && <p className="norm-nota">El visor no tiene registrada esta especie en {nombre}.</p>}
          <p>{r.resumen}</p>
          {(r.periodo || r.talla || r.cupo) && (
            <dl className="norm-datos">
              {r.periodo && (
                <div>
                  <dt>Periodo hábil</dt>
                  <dd>{r.periodo}</dd>
                </div>
              )}
              {r.talla && (
                <div>
                  <dt>Talla mínima</dt>
                  <dd>{r.talla}</dd>
                </div>
              )}
              {r.cupo && (
                <div>
                  <dt>Cupo</dt>
                  <dd>{r.cupo}</dd>
                </div>
              )}
            </dl>
          )}
          {r.estado !== 'prohibida' && r.zonasDetalle.length > 0 && (
            <>
              <h4>Cebos, señuelos y anzuelos según el tipo de tramo</h4>
              <div className="norm-zonas">
                {r.zonasDetalle.map((z) => (
                  <section key={z.tipo}>
                    <h5>{z.tipo}</h5>
                    <ul>
                      {z.reglas.map((x) => (
                        <li key={x}>{x}</li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            </>
          )}
          <details className="norm-generales">
            <summary>Normas generales en {nombre}</summary>
            <ul>
              {r.generales.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </details>
          <div className="norm-fuentes">
            <strong>Fuente oficial:</strong>
            {r.norma.map((n) => (
              <a key={n.url + n.titulo} href={n.url} target="_blank" rel="noreferrer">
                {n.titulo}
              </a>
            ))}
          </div>
          <p className="ficha-pie">
            Resumen orientativo de la temporada 2026. Cada coto o tramo puede tener condiciones propias: consulta siempre la norma vigente y la señalización antes de pescar.
          </p>
        </div>
      )}
    </div>
  )
}
