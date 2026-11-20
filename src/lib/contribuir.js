// Datos del proyecto y utilidades para contribuir.
//
// ► Cambia REPO y CORREO por los tuyos cuando publiques el proyecto: todos los botones
//   de "Contribuir" (issues de GitHub y correo) salen de aquí.

export const PROYECTO = {
  nombre: 'DóndePica',
  lema: 'El mapa abierto de la pesca en España',
  repo: 'https://github.com/FranV99/dondepica', // ← tu repositorio
  correo: 'franvazquez999@gmail.com', // ← tu correo de contacto
  licenciaCodigo: 'MIT',
  licenciaDatos: 'CC BY 4.0',
}

/** Tipos de aportación. `etiqueta` es la etiqueta (label) que se propone para el issue. */
export const TIPOS_APORTE = [
  {
    id: 'especie-masa',
    titulo: 'Un pez que falta o sobra',
    desc: 'Has pescado o visto una especie en una masa de agua y no aparece (o aparece y no está).',
    icono: 'pez',
    etiqueta: 'distribución',
    campos: ['masa', 'especie', 'fecha'],
    ayuda: '¿Dónde y cuándo lo viste? Si tienes foto o una cita (iNaturalist, un estudio, la web de tu comunidad), añade el enlace.',
  },
  {
    id: 'masa',
    titulo: 'Una masa de agua nueva',
    desc: 'Un río, embalse, laguna o balsa que no está en el mapa o tiene datos incorrectos.',
    icono: 'gota',
    etiqueta: 'masa de agua',
    campos: ['masa', 'lugar'],
    ayuda: 'Nombre, municipio o coordenadas y qué peces hay. Un enlace a un mapa ayuda mucho.',
  },
  {
    id: 'tecnica',
    titulo: 'Un truco o técnica de pesca',
    desc: 'Cebos, señuelos, montajes o la mejor época para una especie.',
    icono: 'mosca',
    etiqueta: 'técnica',
    campos: ['especie'],
    ayuda: 'Cuéntalo como se lo contarías a alguien que empieza: equipo, cebo o señuelo, dónde y cuándo.',
  },
  {
    id: 'normativa',
    titulo: 'Normativa desactualizada',
    desc: 'Una norma de pesca que ha cambiado en tu comunidad autónoma.',
    icono: 'documento',
    etiqueta: 'normativa',
    campos: ['especie', 'ccaa'],
    ayuda: 'Indica la orden o el boletín oficial (con enlace) y qué ha cambiado.',
  },
  {
    id: 'foto',
    titulo: 'Una foto libre',
    desc: 'Una foto tuya (o con licencia libre) de un pez, cebo o señuelo.',
    icono: 'camara',
    etiqueta: 'fotos',
    campos: ['especie'],
    ayuda: 'Sube la foto a Wikimedia Commons o iNaturalist con licencia CC BY o CC BY-SA y pega aquí el enlace.',
  },
  {
    id: 'otro',
    titulo: 'Otra idea o un error',
    desc: 'Algo que no funciona, una mejora del mapa o una idea nueva.',
    icono: 'idea',
    etiqueta: 'idea',
    campos: [],
    ayuda: 'Cuanto más concreto, mejor. Si es un error, di qué hiciste y qué esperabas que pasara.',
  },
]

export const tipoAporte = (id) => TIPOS_APORTE.find((t) => t.id === id) || TIPOS_APORTE[TIPOS_APORTE.length - 1]

const ETIQUETAS_CAMPO = { masa: 'Masa de agua', especie: 'Especie', fecha: 'Fecha aproximada', lugar: 'Lugar (municipio o coordenadas)', ccaa: 'Comunidad autónoma' }

/** Título del issue */
export function tituloAporte(tipo, datos) {
  const t = tipoAporte(tipo)
  const sujeto = [datos.especie, datos.masa].filter(Boolean).join(' · ')
  return `[${t.etiqueta}] ${datos.titulo?.trim() || t.titulo}${sujeto ? ` — ${sujeto}` : ''}`
}

/** Cuerpo de la aportación en Markdown (sirve para GitHub, correo o copiar) */
export function cuerpoAporte(tipo, datos) {
  const t = tipoAporte(tipo)
  const lineas = [`**Tipo:** ${t.titulo}`]
  for (const c of t.campos) if (datos[c]?.trim()) lineas.push(`**${ETIQUETAS_CAMPO[c]}:** ${datos[c].trim()}`)
  lineas.push('', '### Descripción', datos.descripcion?.trim() || '_(sin descripción)_')
  if (datos.fuente?.trim()) lineas.push('', '### Fuente o enlace', datos.fuente.trim())
  if (datos.autor?.trim()) lineas.push('', `_Aportado por: ${datos.autor.trim()} (para los créditos)_`)
  if (datos.contexto) lineas.push('', `<sub>Enviado desde ${PROYECTO.nombre} · ${datos.contexto}</sub>`)
  return lineas.join('\n')
}

/** URL para abrir un issue de GitHub ya rellenado */
export function urlIssue(tipo, datos) {
  const p = new URLSearchParams({ title: tituloAporte(tipo, datos), body: cuerpoAporte(tipo, datos), labels: tipoAporte(tipo).etiqueta })
  return `${PROYECTO.repo}/issues/new?${p.toString()}`
}

/** URL mailto: con la aportación (en texto plano) */
export function urlCorreo(tipo, datos) {
  const cuerpo = cuerpoAporte(tipo, datos).replace(/\*\*|_|###\s?|<\/?sub>/g, '')
  return `mailto:${PROYECTO.correo}?subject=${encodeURIComponent(tituloAporte(tipo, datos))}&body=${encodeURIComponent(cuerpo)}`
}
