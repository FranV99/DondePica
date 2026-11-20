import { useEffect, useMemo, useState } from 'react'
import { buscar } from '../lib/catalogo.js'
import { buscarLocalidades } from '../lib/localidades.js'
import { ESPECIES, ORIGENES, textoEspecie } from '../data/especies.js'
import { TIPOS, norm } from '../lib/util.js'
import { IcoAportar, IcoBuscar, IcoGithub, IcoInfo, IcoMenu, Logo } from './Iconos.jsx'
import { PROYECTO } from '../lib/contribuir.js'

// otros nombres con los que se buscan las comunidades autónomas
const OTROS_NOMBRES = {
  CT: 'Catalunya', PV: 'Euskadi Pais Vasco', GA: 'Galiza', VC: 'Comunidad Valenciana Valencia', NA: 'Navarra Nafarroa',
  MD: 'Madrid', AS: 'Asturias', MC: 'Murcia', RI: 'Rioja', CL: 'Castilla Leon', CM: 'Castilla Mancha',
}

function Buscador({ onMasa, onEspecie, onLocalidad, onCcaa, listaCcaa = [], region }) {
  const [q, setQ] = useState('')
  const [abierto, setAbierto] = useState(false)
  // localidades: se piden a CartoCiudad (IGN) cuando se deja de escribir un momento
  const [loc, setLoc] = useState({ texto: '', lista: [], estado: 'nada' })
  useEffect(() => {
    const t = q.trim()
    if (t.length < 3) return
    const ctrl = new AbortController()
    const espera = setTimeout(() => {
      setLoc((l) => ({ ...l, estado: 'buscando' }))
      buscarLocalidades(t, ctrl.signal)
        .then((lista) => setLoc({ texto: t, lista, estado: 'ok' }))
        .catch((e) => e.name !== 'AbortError' && setLoc({ texto: t, lista: [], estado: 'error' }))
    }, 300)
    return () => {
      clearTimeout(espera)
      ctrl.abort()
    }
  }, [q])
  const localidades = q.trim().length >= 3 && loc.texto === q.trim() ? loc.lista : []
  const buscandoLoc = q.trim().length >= 3 && (loc.estado === 'buscando' || loc.texto !== q.trim())

  const res = useMemo(() => {
    const t = norm(q.trim())
    if (t.length < 2) return { comunidades: [], masas: [], especies: [] }
    return {
      comunidades: listaCcaa.filter((c) => norm(`${c.nombre} ${OTROS_NOMBRES[c.codigo] || ''}`).includes(t)).slice(0, 5),
      masas: buscar(q, { limite: 8, region }).res,
      especies: ESPECIES.filter((e) => norm(textoEspecie(e)).includes(t)).slice(0, 8),
    }
  }, [q, region, listaCcaa])

  const elegir = (fn, id) => {
    fn(id)
    setQ('')
    setAbierto(false)
  }
  const hay = res.comunidades.length + res.masas.length + res.especies.length + localidades.length > 0

  return (
    <div className="nav-buscador">
      <input
        type="search"
        placeholder={region ? `Busca en ${region.nombre}…` : 'Busca un río, embalse, especie, pueblo o comunidad…'}
        value={q}
        onChange={(e) => {
          setQ(e.target.value)
          setAbierto(true)
        }}
        onFocus={() => setAbierto(true)}
        onBlur={() => setTimeout(() => setAbierto(false), 150)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && hay) {
            if (res.comunidades[0]) elegir(onCcaa, res.comunidades[0].codigo)
            else if (res.masas[0]) elegir(onMasa, res.masas[0].id)
            else if (res.especies[0]) elegir(onEspecie, res.especies[0].id)
            else elegir(onLocalidad, localidades[0])
          }
        }}
      />
      <button className="btn-rojo-cuadrado" aria-label="Buscar" onMouseDown={(e) => e.preventDefault()}>
        <IcoBuscar />
      </button>
      {abierto && q.trim().length >= 2 && (
        <div className="nav-resultados">
          {res.comunidades.length > 0 && <div className="res-titulo">Comunidades autónomas</div>}
          {res.comunidades.map((c) => (
            <button key={c.codigo} onMouseDown={(e) => e.preventDefault()} onClick={() => elegir(onCcaa, c.codigo)}>
              <span>
                <i className="punto punto-ccaa" /> {c.nombre}
              </span>
              <small>{c.codigo === region?.codigo ? 'Seleccionada en el mapa' : 'Ver sus masas de agua en el mapa'}</small>
            </button>
          ))}
          {res.masas.length > 0 && <div className="res-titulo">Masas de agua</div>}
          {res.masas.map((m) => (
            <button key={m.id} onMouseDown={(e) => e.preventDefault()} onClick={() => elegir(onMasa, m.id)}>
              <span>{m.nombre}</span>
              <small>
                {TIPOS[m.tipo]?.singular} · {m.cuenca}
                {m.revisada ? ' · ✓ revisada' : ''}
              </small>
            </button>
          ))}
          {(localidades.length > 0 || buscandoLoc || loc.estado === 'error') && <div className="res-titulo">Localidades</div>}
          {localidades.map((l) => (
            <button key={`${l.tipo}-${l.id}`} onMouseDown={(e) => e.preventDefault()} onClick={() => elegir(onLocalidad, l)}>
              <span>
                <i className="punto punto-localidad" /> {l.nombre}
              </span>
              <small>{l.detalle}</small>
            </button>
          ))}
          {buscandoLoc && localidades.length === 0 && <div className="res-vacio">Buscando localidades…</div>}
          {loc.estado === 'error' && loc.texto === q.trim() && <div className="res-vacio">No se pudieron buscar localidades (¿sin conexión?)</div>}
          {res.especies.length > 0 && <div className="res-titulo">Especies</div>}
          {res.especies.map((e) => (
            <button key={e.id} onMouseDown={(ev) => ev.preventDefault()} onClick={() => elegir(onEspecie, e.id)}>
              <span>
                <i className="punto" style={{ background: ORIGENES[e.origen].color }} /> {e.comun}
              </span>
              <small>
                <em>{e.cientifico}</em>
              </small>
            </button>
          ))}
          {!hay && !buscandoLoc && <div className="res-vacio">Sin resultados</div>}
        </div>
      )}
    </div>
  )
}

export default function Navbar({ onMenu, onMasa, onEspecie, onLocalidad, onCcaa, listaCcaa, onInicio, onAcerca, onContribuir, region }) {
  return (
    <nav className="navbar">
      <button className="btn-menu" onClick={onMenu} aria-label="Mostrar u ocultar el panel">
        <IcoMenu />
      </button>
      <button className="marca" onClick={onInicio} title="Volver a la vista inicial">
        <Logo className="marca-icono" />
        <span className="marca-textos">
          <span className="marca-logo">
            Dónde<span>Pica</span>
          </span>
          <span className="marca-titulo">{PROYECTO.lema}</span>
        </span>
      </button>
      <Buscador onMasa={onMasa} onEspecie={onEspecie} onLocalidad={onLocalidad} onCcaa={onCcaa} listaCcaa={listaCcaa} region={region} />
      <div className="nav-acciones">
        <a className="btn-redondo-rojo" href={PROYECTO.repo} target="_blank" rel="noreferrer" title="Código abierto en GitHub" aria-label="Código abierto en GitHub">
          <IcoGithub />
        </a>
        <button className="btn-redondo-rojo" onClick={onAcerca} title="Sobre el proyecto y los datos" aria-label="Sobre el proyecto y los datos">
          <IcoInfo />
        </button>
        <button className="btn-contribuir" onClick={() => onContribuir()}>
          <IcoAportar /> <span>Contribuir</span>
        </button>
      </div>
    </nav>
  )
}
