// Cuándo pescar una especie: estaciones, reloj de día y noche con las mejores horas, y el
// tiempo atmosférico más favorable. Los niveles son 2 (lo mejor), 1 (activo) y 0 (poco).

const NIVEL = ['Poco activo', 'Activo', 'Mejor época']

// ───────── estaciones ─────────
const ESTACIONES = [
  ['primavera', 'Primavera', '#5cb85c', <><circle cx="12" cy="6.3" r="2.9" /><circle cx="17.4" cy="10.2" r="2.9" /><circle cx="15.3" cy="16.5" r="2.9" /><circle cx="8.7" cy="16.5" r="2.9" /><circle cx="6.6" cy="10.2" r="2.9" /><circle cx="12" cy="11.6" r="2.2" fill="currentColor" /></>],
  ['verano', 'Verano', '#f0ad1e', <><circle cx="12" cy="12" r="4" /><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8" /></>],
  ['otono', 'Otoño', '#d9662b', <><path d="M5 19C5 10 10 5 19 5c0 9-5 14-14 14Z" /><path d="M5 19 13 11" /></>],
  ['invierno', 'Invierno', '#5aa9e6', <path key="i" d="M12 2v20M3.3 7l17.4 10M3.3 17l17.4-10M9.5 3.5 12 6l2.5-2.5M9.5 20.5 12 18l2.5 2.5" />],
]

export function Estaciones({ valores }) {
  return (
    <div className="cal-estaciones">
      {ESTACIONES.map(([k, nombre, color, icono]) => {
        const n = valores[k] ?? 0
        return (
          <div key={k} className={`cal-estacion nivel-${n}`} style={{ '--c': color }} title={`${nombre}: ${NIVEL[n].toLowerCase()}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              {icono}
            </svg>
            <b>{nombre}</b>
            <small>{NIVEL[n]}</small>
          </div>
        )
      })}
    </div>
  )
}

// ───────── reloj horizontal ─────────
// una barra de 24 horas que empieza antes del amanecer (4 h) y pasa por el día, el
// atardecer y la noche, con degradados suaves; las mejores franjas se marcan encima
const INICIO = 4
const ANCHO = 600
const X0 = 14
const X1 = ANCHO - 14
const xDe = (h) => X0 + (((h - INICIO + 24) % 24) / 24) * (X1 - X0)
const CIELO = [
  [4, '#141b33'], [5.3, '#2c3364'], [6.3, '#8a6a9a'], [7, '#ec9f6a'], [8.2, '#f7d48c'], [10, '#a9d6f2'],
  [13, '#8fcaf0'], [17, '#a7d3ee'], [19, '#f4c983'], [20.3, '#e47b4f'], [21.2, '#7c4f78'], [22.3, '#2b2f5c'], [24, '#18203d'], [28, '#141b33'],
]
const ETIQUETAS = [
  [6, 'Amanecer'],
  [12, 'Mediodía'],
  [21, 'Anochecer'],
]

export function RelojHorizontal({ franjas }) {
  // las franjas que cruzan el inicio de la barra (4 h) se parten en dos
  const tramos = franjas.flatMap(([a, b]) => {
    const xa = xDe(a)
    const xb = xDe(b) === X0 ? X1 : xDe(b)
    return xb > xa ? [[a, b, xa, xb]] : [[a, b, xa, X1], [a, b, X0, xb]]
  })
  const Y = 34
  const ALTO = 26
  return (
    <div className="cal-reloj-h">
      <svg viewBox={`0 0 ${ANCHO} 96`} role="img" aria-label={`Mejores horas: ${franjas.map(([a, b]) => `de ${a % 24} a ${b % 24} h`).join(' y ')}`}>
        <defs>
          <linearGradient id="cal-cielo" x1={X0} x2={X1} y1="0" y2="0" gradientUnits="userSpaceOnUse">
            {CIELO.map(([h, c]) => (
              <stop key={h} offset={(h - INICIO) / 24} stopColor={c} />
            ))}
          </linearGradient>
        </defs>
        <rect x={X0} y={Y} width={X1 - X0} height={ALTO} rx={ALTO / 2} fill="url(#cal-cielo)" />
        {/* sol a mediodía y luna de madrugada */}
        <g transform={`translate(${xDe(13.5)} ${Y + ALTO / 2})`} stroke="#e8a317" strokeWidth="1.4" strokeLinecap="round">
          <circle r="5.5" fill="#ffd34d" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
            <line key={a} x1="0" y1="7.5" x2="0" y2="10" transform={`rotate(${a})`} />
          ))}
        </g>
        <path d="M4 7a7 7 0 1 1-4.7-11.7A5.5 5.5 0 0 0 4 7Z" transform={`translate(${xDe(3.3)} ${Y + ALTO / 2 + 1})`} fill="#e6ebf5" />
        {/* marcas de las horas */}
        {Array.from({ length: 25 }, (_, i) => {
          const h = (INICIO + i) % 24
          const x = X0 + (i / 24) * (X1 - X0)
          const grande = h % 3 === 0
          return (
            <g key={i}>
              <line x1={x} x2={x} y1={Y + ALTO} y2={Y + ALTO + (grande ? 7 : 4)} stroke="rgba(38,53,43,0.4)" strokeWidth={grande ? 1.4 : 1} />
              {grande && (
                <text x={x} y={Y + ALTO + 19} textAnchor="middle" className="cal-h-num">
                  {h}
                </text>
              )}
            </g>
          )
        })}
        {ETIQUETAS.map(([h, t]) => (
          <text key={t} x={xDe(h)} y={Y + ALTO + 33} textAnchor="middle" className="cal-h-etq">
            {t}
          </text>
        ))}
        {/* mejores franjas: recuadro coral sobre la barra y flecha que apunta a su centro */}
        {tramos.map(([, , xa, xb], i) => (
          <rect key={`f${i}`} x={xa} y={Y - 3} width={xb - xa} height={ALTO + 6} rx="7" fill="rgba(255,255,255,0.28)" stroke="#8f3a28" strokeWidth="2.5" />
        ))}
        {franjas.map(([a, b]) => {
          const t = tramos.filter((x) => x[0] === a && x[1] === b)
          const mayor = t.reduce((m, x) => (x[3] - x[2] > m[3] - m[2] ? x : m), t[0])
          const cx = (mayor[2] + mayor[3]) / 2
          return (
            <g key={`a${a}`}>
              <text x={cx} y="13" textAnchor="middle" className="cal-h-franja">
                {a % 24}–{b % 24} h
              </text>
              <path d={`M${cx - 7} 19h14l-7 9Z`} fill="#8f3a28" />
            </g>
          )
        })}
      </svg>
    </div>
  )
}

// ───────── tiempo atmosférico ─────────
const NUBE = 'M7 18h10a4 4 0 0 0 .4-8 5.5 5.5 0 0 0-10.6 1.5A3.3 3.3 0 0 0 7 18Z'
const TIEMPOS = [
  [
    'soleado',
    'Soleado',
    <>
      <circle cx="12" cy="12" r="4.5" fill="#ffd34d" stroke="#e8a317" />
      <path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8" stroke="#e8a317" />
    </>,
  ],
  [
    'nubes',
    'Sol y nubes',
    <>
      <circle cx="9" cy="8.5" r="3.6" fill="#ffd34d" stroke="#e8a317" />
      <path d="M9 2.2v1.5M3 8.5h1.5M4.6 4.1l1 1M13.4 4.1l-1 1" stroke="#e8a317" />
      <path d={NUBE} transform="translate(2 2)" fill="#eef2f7" stroke="#8a97a8" />
    </>,
  ],
  ['nublado', 'Nublado', <><path d={NUBE} transform="translate(-3 -3)" fill="#c9d1dc" stroke="#7d8898" /><path d={NUBE} transform="translate(1 1)" fill="#e3e8ef" stroke="#7d8898" /></>],
  [
    'lluvia',
    'Lluvia',
    <>
      <path d={NUBE} transform="translate(0 -4)" fill="#c3ccd8" stroke="#6f7c8e" />
      <path d="M8 17l-1.2 3M12 17l-1.2 3M16 17l-1.2 3" stroke="#4a90d9" strokeWidth="2" />
    </>,
  ],
]
const NIVEL_TIEMPO = ['Poco favorable', 'Aceptable', 'Ideal']

export function TiempoIdeal({ valores }) {
  return (
    <div className="cal-tiempo">
      {TIEMPOS.map(([k, nombre, icono]) => {
        const n = valores[k] ?? 0
        return (
          <div key={k} className={`cal-tiempo-item nivel-${n}`} title={`${nombre}: ${NIVEL_TIEMPO[n].toLowerCase()}`}>
            <svg viewBox="0 0 24 24" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none">
              {icono}
            </svg>
            <b>{nombre}</b>
            <small>{NIVEL_TIEMPO[n]}</small>
          </div>
        )
      })}
    </div>
  )
}
