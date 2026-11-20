// Demarcaciones hidrográficas de la España peninsular (códigos del MITECO / IGN)
// y el nombre que usa el visor para cada una.
export const DEMARCACIONES = {
  ES010: 'Miño-Sil',
  ES014: 'Galicia-Costa',
  ES017: 'Cantábrico Oriental',
  ES018: 'Cantábrico Occidental',
  ES020: 'Duero',
  ES030: 'Tajo',
  ES040: 'Guadiana',
  ES050: 'Guadalquivir',
  ES060: 'Mediterránea Andaluza',
  ES063: 'Guadalete y Barbate',
  ES064: 'Tinto, Odiel y Piedras',
  ES070: 'Segura',
  ES080: 'Júcar',
  ES091: 'Ebro',
  ES100: 'Internas de Cataluña',
}

export const CODIGO_POR_CUENCA = Object.fromEntries(Object.entries(DEMARCACIONES).map(([k, v]) => [v, k]))

// Agrupación de las cuencas por grandes regiones geográficas (para el panel izquierdo)
export const REGIONES = [
  { nombre: 'Noroeste', zona: 'Galicia y El Bierzo', cuencas: ['Miño-Sil', 'Galicia-Costa'] },
  { nombre: 'Cornisa Cantábrica', zona: 'Asturias, Cantabria, País Vasco y norte de Navarra', cuencas: ['Cantábrico Occidental', 'Cantábrico Oriental'] },
  { nombre: 'Meseta e interior', zona: 'Castilla y León, Madrid, Castilla-La Mancha y Extremadura', cuencas: ['Duero', 'Tajo', 'Guadiana'] },
  { nombre: 'Sur', zona: 'Andalucía', cuencas: ['Guadalquivir', 'Guadalete y Barbate', 'Tinto, Odiel y Piedras', 'Mediterránea Andaluza'] },
  { nombre: 'Levante', zona: 'Región de Murcia, Comunidad Valenciana y este de Castilla-La Mancha', cuencas: ['Segura', 'Júcar'] },
  { nombre: 'Noreste', zona: 'Aragón, La Rioja, Navarra y Cataluña', cuencas: ['Ebro', 'Internas de Cataluña'] },
]
