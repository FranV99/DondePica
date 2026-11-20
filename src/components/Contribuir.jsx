import { useEffect, useMemo, useState } from 'react'
import { IcoCamara, IcoCerrar, IcoCopiar, IcoCorreo, IcoDocumento, IcoGithub, IcoGota, IcoIdea, IcoMosca, IcoPez } from './Iconos.jsx'

const ICONOS = { pez: IcoPez, gota: IcoGota, mosca: IcoMosca, documento: IcoDocumento, camara: IcoCamara, idea: IcoIdea }
const Medallon = ({ icono }) => {
  const I = ICONOS[icono] || IcoIdea
  return (
    <span className="medallon" aria-hidden>
      <I />
    </span>
  )
}
import { PROYECTO, TIPOS_APORTE, cuerpoAporte, tipoAporte, tituloAporte, urlCorreo, urlIssue } from '../lib/contribuir.js'

const ETIQUETA = { masa: 'Masa de agua', especie: 'Especie', fecha: 'Fecha (aprox.)', lugar: 'Lugar', ccaa: 'Comunidad autónoma' }
const EJEMPLO = { masa: 'Embalse de…', especie: 'Barbo, black-bass…', fecha: 'Primavera 2026', lugar: 'Municipio o coordenadas', ccaa: 'Cataluña, Aragón…' }

/**
 * Formulario para contribuir. `inicial` = { tipo, masa, especie, contexto } para abrirlo ya
 * rellenado desde la ficha de una especie o el panel de una masa de agua.
 */
export default function Contribuir({ cerrar, inicial = {} }) {
  const [tipo, setTipo] = useState(inicial.tipo || null)
  const [datos, setDatos] = useState({ masa: inicial.masa || '', especie: inicial.especie || '', ccaa: inicial.ccaa || '', contexto: inicial.contexto || '' })
  const [copiado, setCopiado] = useState(false)
  const t = tipo && tipoAporte(tipo)
  const set = (k) => (e) => setDatos((d) => ({ ...d, [k]: e.target.value }))
  const listo = !!datos.descripcion?.trim()
  const texto = useMemo(() => (t ? `${tituloAporte(tipo, datos)}\n\n${cuerpoAporte(tipo, datos)}` : ''), [t, tipo, datos])

  // Escape cierra solo este formulario (no la ficha que pueda haber debajo)
  useEffect(() => {
    const onKey = (ev) => {
      if (ev.key !== 'Escape') return
      ev.stopImmediatePropagation()
      cerrar()
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [cerrar])

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(texto)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch {
      setCopiado(false)
    }
  }

  return (
    <div className="modal-fondo" onClick={cerrar}>
      <div className="modal modal-contribuir" onClick={(e) => e.stopPropagation()}>
        <div className="modal-barra">
          <span className="pi-tab">CONTRIBUIR</span>
          <button onClick={cerrar} aria-label="Cerrar">
            <IcoCerrar />
          </button>
        </div>
        <div className="contrib-cuerpo">
          {!t ? (
            <>
              <div className="contrib-intro">
                <h2>Este mapa lo hacemos entre todos</h2>
                <p>
                  {PROYECTO.nombre} es un proyecto <b>abierto</b>: el código y los datos son libres y cualquiera puede mejorarlos. ¿Has
                  pescado un pez que no aparece? ¿Conoces un truco que funciona? Cuéntanoslo.
                </p>
              </div>
              <div className="contrib-tipos">
                {TIPOS_APORTE.map((x) => (
                  <button key={x.id} className="contrib-tipo" onClick={() => setTipo(x.id)}>
                    <Medallon icono={x.icono} />
                    <b>{x.titulo}</b>
                    <small>{x.desc}</small>
                  </button>
                ))}
              </div>
              <div className="contrib-pasos">
                <div>
                  <i>1</i>
                  <span>
                    <b>Elige qué quieres aportar</b> y rellena el formulario.
                  </span>
                </div>
                <div>
                  <i>2</i>
                  <span>
                    <b>Envíalo</b> como issue de GitHub o, si no usas GitHub, por correo.
                  </span>
                </div>
                <div>
                  <i>3</i>
                  <span>
                    <b>Lo revisamos</b> y aparece en el mapa con tu nombre en los créditos.
                  </span>
                </div>
              </div>
              <p className="contrib-codigo">
                ¿Sabes programar? El código está en{' '}
                <a href={PROYECTO.repo} target="_blank" rel="noreferrer">
                  GitHub
                </a>{' '}
                ({PROYECTO.licenciaCodigo}). Los datos se publican con licencia {PROYECTO.licenciaDatos}.
              </p>
            </>
          ) : (
            <>
              <button className="btn-texto contrib-volver" onClick={() => setTipo(null)}>
                ← Elegir otro tipo
              </button>
              <h2 className="contrib-tit">
                <Medallon icono={t.icono} />
                {t.titulo}
              </h2>
              <p className="contrib-ayuda">{t.ayuda}</p>
              <div className="contrib-form">
                <label className="contrib-campo ancho">
                  <span>Título breve</span>
                  <input value={datos.titulo || ''} onChange={set('titulo')} placeholder={t.titulo} />
                </label>
                {t.campos.map((c) => (
                  <label key={c} className="contrib-campo">
                    <span>{ETIQUETA[c]}</span>
                    <input value={datos[c] || ''} onChange={set(c)} placeholder={EJEMPLO[c]} />
                  </label>
                ))}
                <label className="contrib-campo ancho">
                  <span>
                    Cuéntanos <em>(obligatorio)</em>
                  </span>
                  <textarea rows={5} value={datos.descripcion || ''} onChange={set('descripcion')} placeholder="Escribe aquí tu aportación…" />
                </label>
                <label className="contrib-campo ancho">
                  <span>Fuente, foto o enlace (opcional)</span>
                  <input value={datos.fuente || ''} onChange={set('fuente')} placeholder="https://…" />
                </label>
                <label className="contrib-campo ancho">
                  <span>Tu nombre o alias para los créditos (opcional)</span>
                  <input value={datos.autor || ''} onChange={set('autor')} placeholder="@tu_alias" />
                </label>
              </div>
              <div className="contrib-acciones">
                <a className={`btn-amarillo ${listo ? '' : 'desactivado'}`} href={listo ? urlIssue(tipo, datos) : undefined} target="_blank" rel="noreferrer" aria-disabled={!listo}>
                  <IcoGithub /> Abrir issue en GitHub
                </a>
                <a className={`btn-borde ${listo ? '' : 'desactivado'}`} href={listo ? urlCorreo(tipo, datos) : undefined} aria-disabled={!listo}>
                  <IcoCorreo /> Enviar por correo
                </a>
                <button className={`btn-borde ${listo ? '' : 'desactivado'}`} onClick={listo ? copiar : undefined} disabled={!listo}>
                  <IcoCopiar /> {copiado ? '¡Copiado!' : 'Copiar texto'}
                </button>
              </div>
              {!listo && <p className="contrib-falta">Escribe tu aportación para poder enviarla.</p>}
              <p className="contrib-nota">
                No hace falta saber programar. Con GitHub se abre un issue ya rellenado (necesitas una cuenta gratuita); si no, envíalo
                por correo o copia el texto.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
