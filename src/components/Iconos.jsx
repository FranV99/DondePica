// Iconos SVG en línea (sin dependencias)
const base = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }

export const IcoMenu = (p) => (
  <svg {...base} {...p}><path d="M3 6h18M3 12h18M3 18h18" /></svg>
)
export const IcoLista = (p) => (
  <svg {...base} {...p}><path d="M9 6h12M9 12h12M9 18h12" /><circle cx="4" cy="6" r="1.2" fill="currentColor" /><circle cx="4" cy="12" r="1.2" fill="currentColor" /><circle cx="4" cy="18" r="1.2" fill="currentColor" /></svg>
)
export const IcoBuscar = (p) => (
  <svg {...base} {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
)
export const IcoCapas = (p) => (
  <svg {...base} {...p}><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3 13 9 5 9-5" /></svg>
)
export const IcoInfo = (p) => (
  <svg {...base} {...p}><circle cx="12" cy="12" r="9" /><path d="M12 11v6M12 7.5v.01" /></svg>
)
export const IcoCasa = (p) => (
  <svg {...base} {...p}><path d="M3 11 12 4l9 7" /><path d="M5 10v10h14V10" /></svg>
)
export const IcoMas = (p) => (
  <svg {...base} {...p}><path d="M12 5v14M5 12h14" /></svg>
)
export const IcoMenos = (p) => (
  <svg {...base} {...p}><path d="M5 12h14" /></svg>
)
export const IcoCerrar = (p) => (
  <svg {...base} {...p}><path d="M6 6l12 12M18 6 6 18" /></svg>
)
export const IcoArriba = (p) => (
  <svg {...base} {...p}><path d="m6 15 6-6 6 6" /></svg>
)
export const IcoAbajo = (p) => (
  <svg {...base} {...p}><path d="m6 9 6 6 6-6" /></svg>
)
export const IcoMapa = (p) => (
  <svg {...base} {...p}><path d="m9 4-6 2v14l6-2 6 2 6-2V4l-6 2-6-2Z" /><path d="M9 4v14M15 6v14" /></svg>
)
export const IcoPin = (p) => (
  <svg {...base} {...p}><path d="M12 21s-7-6.2-7-11a7 7 0 1 1 14 0c0 4.8-7 11-7 11Z" /><circle cx="12" cy="10" r="2.5" /></svg>
)
export const IcoPez = (p) => (
  <svg {...base} {...p}><path d="M2 12c3-5 9-7 14-4l4-3v14l-4-3c-5 3-11 1-14-4Z" /><circle cx="7.5" cy="11" r="1" fill="currentColor" /></svg>
)
export const IcoExpandir = (p) => (
  <svg {...base} {...p}><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" /></svg>
)
export const IcoDocumento = (p) => (
  <svg {...base} {...p}><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" /><path d="M14 3v5h5M9 13h6M9 17h6M9 9h2" /></svg>
)

// Datos de las masas de agua
export const IcoCuenca = (p) => (
  <svg {...base} {...p}><path d="M12 21V11M12 11 6 4M12 11l6-7M12 15l-4-3M12 15l4-3" /><path d="M5 21h14" /></svg>
)
export const IcoSubcuenca = (p) => (
  <svg {...base} {...p}><path d="M12 21v-7M12 14 7 8M12 14l5-6M7 8V4M17 8V4" /></svg>
)
export const IcoMontana = (p) => (
  <svg {...base} {...p}><path d="m2 20 7-12 4 6 3-4 6 10H2Z" /><path d="m7.5 10.5 1.5 1.5 1.5-1.5" /></svg>
)
export const IcoRegla = (p) => (
  <svg {...base} {...p}><path d="M3 17 17 3l4 4L7 21l-4-4Z" /><path d="m7 13 2 2M10 10l2 2M13 7l2 2" /></svg>
)
export const IcoArea = (p) => (
  <svg {...base} {...p}><path d="M4 4h4M4 4v4M20 4h-4M20 4v4M4 20h4M4 20v-4M20 20h-4M20 20v-4" /><path d="M8 13c1.3-1 2.7-1 4 0s2.7 1 4 0" /></svg>
)
export const IcoGota = (p) => (
  <svg {...base} {...p}><path d="M12 3c4 5 6.5 8.5 6.5 11.5a6.5 6.5 0 0 1-13 0C5.5 11.5 8 8 12 3Z" /></svg>
)
export const IcoReiniciar = (p) => (
  <svg {...base} {...p}><path d="M4 12a8 8 0 1 0 2.4-5.7" /><path d="M4 4v4h4" /></svg>
)

// Icono según el tipo de masa de agua
const ONDA = (y) => `M3 ${y}c1.5-1.4 3-1.4 4.5 0s3 1.4 4.5 0 3-1.4 4.5 0 3 1.4 4.5 0`
const FORMAS = {
  rio: <><path d={ONDA(9)} /><path d={ONDA(15)} /></>,
  arroyo: <path d={ONDA(12)} />,
  embalse: <><path d="M15 4v16M15 4l5 2v14" /><path d="M3 10c1.2-1 2.4-1 3.6 0s2.4 1 3.6 0 2.4-1 3.6 0" /><path d="M3 15c1.2-1 2.4-1 3.6 0s2.4 1 3.6 0 2.4-1 3.6 0" /></>,
  lago: <><ellipse cx="12" cy="12" rx="9" ry="6" /><path d="M8 12c1.3-.9 2.7-.9 4 0s2.7.9 4 0" /></>,
  laguna: <><ellipse cx="12" cy="13" rx="9" ry="5" /><path d="M8 13c1.3-.9 2.7-.9 4 0s2.7.9 4 0" /></>,
  humedal: <><path d="M8 17V8M12 17V5M16 17V9" /><path d={ONDA(19)} /></>,
  balsa: <><rect x="4" y="6" width="16" height="12" rx="2" /><path d="M7 12c1.7-1 3.3-1 5 0s3.3 1 5 0" /></>,
}
export const IcoTipo = ({ tipo, ...p }) => <svg {...base} {...p}>{FORMAS[tipo] || FORMAS.lago}</svg>

// ── contribución y proyecto abierto ──
export const IcoGithub = (p) => (
  <svg {...base} {...p}><circle cx="6" cy="5" r="2.2" /><circle cx="6" cy="19" r="2.2" /><circle cx="18" cy="7" r="2.2" /><path d="M6 7.2v9.6M18 9.2c0 4.5-6.5 3.5-11 7.8" /></svg>
)
export const IcoCorreo = (p) => (
  <svg {...base} {...p}><rect x="3" y="5" width="18" height="14" rx="2.5" /><path d="m4 7 8 6 8-6" /></svg>
)
export const IcoCopiar = (p) => (
  <svg {...base} {...p}><rect x="8" y="8" width="12" height="12" rx="2.5" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></svg>
)
export const IcoAportar = (p) => (
  <svg {...base} {...p}><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" /><path d="M12 9v5M9.5 11.5h5" /></svg>
)

/** Logotipo de DóndePica: medallón clásico con una trucha */
export const Logo = (p) => (
  <svg viewBox="0 0 64 64" {...p}>
    <circle cx="32" cy="32" r="31" fill="#23362a" />
    <circle cx="32" cy="32" r="28.2" fill="none" stroke="#a8874f" strokeWidth="1.3" />
    <circle cx="32" cy="32" r="25.6" fill="#efe7d4" />
    <circle cx="32" cy="32" r="24.2" fill="none" stroke="#a8874f" strokeWidth="0.6" />
    {/* sedal */}
    <path d="M12 46c9-4 16-3 22 0s13 3 19-1" fill="none" stroke="#a8874f" strokeWidth="0.9" strokeLinecap="round" />
    {/* trucha */}
    <path d="M10.5 32.5c5.5-7.4 19-10 30.5-5.4 3.6-2.5 7.6-4.6 12.3-5.2-2 4.1-2.2 8.8-.3 13.4-4.6-.5-8.5-2.6-12-5.1-11.5 5.2-25 3.4-30.5-2.3Z" fill="#3f5c42" />
    <path d="M22 26.6c2-3.6 6-4.6 9.5-3.4-.6 1.6-1.2 2.7-2.4 3.4" fill="#3f5c42" />
    <path d="M24 38.3c1.5 2.6 4 3.3 6.6 2.6l-1-2.4" fill="#3f5c42" />
    <path d="M10.5 32.5c6 2.6 17.8 3.2 30.5-2.3" fill="none" stroke="#cfa77c" strokeWidth="0.9" />
    <circle cx="15.4" cy="30.6" r="1.25" fill="#efe7d4" />
    <g fill="#8f3a28">
      <circle cx="22" cy="29.4" r="0.95" /><circle cx="26.5" cy="27.6" r="0.85" /><circle cx="30.5" cy="30" r="0.95" />
      <circle cx="34.8" cy="27.8" r="0.8" /><circle cx="37.6" cy="30.4" r="0.75" /><circle cx="25.4" cy="31.6" r="0.75" />
    </g>
  </svg>
)

// iconos de línea para medallones (bienvenida y contribuir)
export const IcoMosca = (p) => (
  <svg {...base} {...p}><path d="M14 4v9a3 3 0 0 1-6 0" /><path d="M14 5c2.5-1.8 5.5-1.2 6 1-2.2.8-4.2.6-6-1Z" /><path d="M14 8c-2-2-5-2.4-6.5-.6 1.8 1.4 4.2 1.6 6.5.6Z" /><path d="M11 11.5c2 .8 4.5.6 6-1" /></svg>
)
export const IcoCamara = (p) => (
  <svg {...base} {...p}><path d="M4 8h3l2-3h6l2 3h3v11H4Z" /><circle cx="12" cy="13" r="3.5" /></svg>
)
export const IcoIdea = (p) => (
  <svg {...base} {...p}><path d="M9 18h6M10 21h4" /><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3Z" /></svg>
)
export const IcoAtras = (p) => (
  <svg {...base} {...p}><path d="M15 6l-6 6 6 6" /><path d="M9 12h11" /></svg>
)
export const IcoLupa = (p) => (
  <svg {...base} {...p}><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4.2-4.2M11 8.5v5M8.5 11h5" /></svg>
)
