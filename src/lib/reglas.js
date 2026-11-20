// Asignación AUTOMÁTICA (orientativa) de especies a cualquier masa de agua,
// a partir de su cuenca, subcuenca, tipo, altitud y tamaño.
//
// Las masas "revisadas" de src/data/masas.js NO usan estas reglas: tienen su lista propia.
//
// Cómo funciona:
//   1. Cada región (demarcación o subcuenca) tiene su lista de especies posibles (REGIONES).
//   2. Cada especie tiene unos rasgos (RASGOS): en qué hábitats vive y en qué tramo.
//   3. Se filtra la lista de la región según el tipo de masa, la altitud y el tamaño.

import { norm } from './util.js'

// Hábitats: R = río  A = arroyo  E = embalse  L = lago/laguna de interior  M = lago de alta montaña
//           C = laguna costera / marisma  B = balsa o charca
// Tramo:    alto = zona de trucha · medio = zona de ciprínidos · bajo = cerca del mar · todo
// grande:   solo en ríos grandes (jerarquía 1-2) o embalses
const RASGOS = {
  trucha: { h: 'RAEM', tramo: 'alto' },
  salmon: { h: 'R', tramo: 'bajo', grande: true },
  anguila: { h: 'RACL', tramo: 'anguila' },
  lamprea_marina: { h: 'R', tramo: 'bajo', grande: true },
  sabalo: { h: 'R', tramo: 'bajo', grande: true },
  saboga: { h: 'R', tramo: 'bajo', grande: true },
  lisa: { h: 'RC', tramo: 'bajo' },
  platija: { h: 'RC', tramo: 'bajo' },
  pejerrey: { h: 'C', tramo: 'bajo' },
  espinoso: { h: 'RA', tramo: 'medio' },
  fraile: { h: 'RL', tramo: 'medio' },
  burtaina: { h: 'RA', tramo: 'medio' },
  samaruc: { h: 'C', tramo: 'bajo' },
  fartet: { h: 'C', tramo: 'bajo' },
  salinete: { h: 'C', tramo: 'bajo' },
  jarabugo: { h: 'RA', tramo: 'medio' },
  barbo_comun: { h: 'RAE', tramo: 'medio' },
  barbo_gitano: { h: 'RAE', tramo: 'medio' },
  barbo_graells: { h: 'RAE', tramo: 'medio' },
  barbo_mediterraneo: { h: 'RAE', tramo: 'medio' },
  barbo_comizo: { h: 'RE', tramo: 'medio', grande: true },
  barbo_cabecicorto: { h: 'RE', tramo: 'medio', grande: true },
  barbo_colirrojo: { h: 'RA', tramo: 'medio' },
  barbo_montana: { h: 'RA', tramo: 'medio' },
  madrilla: { h: 'RE', tramo: 'medio' },
  boga_duero: { h: 'RE', tramo: 'medio' },
  boga_tajo: { h: 'RE', tramo: 'medio' },
  boga_guadiana: { h: 'RE', tramo: 'medio' },
  loina: { h: 'R', tramo: 'medio' },
  madrija: { h: 'R', tramo: 'medio' },
  bermejuela: { h: 'RAL', tramo: 'medio' },
  sarda: { h: 'RA', tramo: 'medio' },
  pardilla: { h: 'RA', tramo: 'medio' },
  pardilla_oretana: { h: 'RA', tramo: 'medio' },
  calandino: { h: 'RA', tramo: 'medio' },
  cacho: { h: 'RAE', tramo: 'medio' },
  bordallo: { h: 'RAE', tramo: 'medio' },
  bagre: { h: 'RAE', tramo: 'medio' },
  cacho_valenciano: { h: 'RAE', tramo: 'medio' },
  bogardilla: { h: 'RA', tramo: 'medio' },
  gobio: { h: 'RA', tramo: 'medio' },
  piscardo: { h: 'RAM', tramo: 'todo' },
  lobo_rio: { h: 'RA', tramo: 'medio' },
  colmilleja: { h: 'RA', tramo: 'medio' },
  lamprehuela: { h: 'RA', tramo: 'medio' },
  colmilleja_alagon: { h: 'RA', tramo: 'medio' },
  tenca: { h: 'RELB', tramo: 'medio' },
  carpa: { h: 'RELBC', tramo: 'medio' },
  carpin: { h: 'RELBC', tramo: 'medio' },
  black_bass: { h: 'RELB', tramo: 'medio' },
  percasol: { h: 'RELB', tramo: 'medio' },
  lucio: { h: 'REL', tramo: 'medio' },
  lucioperca: { h: 'RE', tramo: 'medio', grande: true },
  perca: { h: 'EL', tramo: 'medio' },
  siluro: { h: 'RE', tramo: 'medio', grande: true },
  alburno: { h: 'RE', tramo: 'medio' },
  rutilo: { h: 'REL', tramo: 'medio' },
  gardi: { h: 'REL', tramo: 'medio' },
  blicca: { h: 'RE', tramo: 'medio', grande: true },
  pez_gato_negro: { h: 'REL', tramo: 'medio' },
  pez_gato_punteado: { h: 'R', tramo: 'bajo', grande: true },
  gambusia: { h: 'RALBC', tramo: 'gambusia' },
  salvelino: { h: 'M', tramo: 'todo' },
  chanchito: { h: 'RLA', tramo: 'gambusia' },
  fundulo: { h: 'C', tramo: 'bajo' },
  dojo: { h: 'C', tramo: 'bajo' },
  carpa_dorada: { h: 'ELB', tramo: 'medio' },
  carpa_herbivora: { h: 'ELB', tramo: 'medio' },
  brema_comun: { h: 'RE', tramo: 'medio', grande: true },
  aspio: { h: 'RE', tramo: 'medio', grande: true },
  pseudorasbora: { h: 'RAELB', tramo: 'medio' },
  hucho: { h: 'RE', tramo: 'medio' },
  cacho_malagueno: { h: 'RA', tramo: 'medio' },
  burtaina_garona: { h: 'RA', tramo: 'alto' },
  lamprea_arroyo: { h: 'RA', tramo: 'medio' },
  gobio_languedoc: { h: 'RA', tramo: 'medio' },
  piscardo_languedoc: { h: 'RAM', tramo: 'todo' },
  piscardo_garona: { h: 'RAM', tramo: 'todo' },
  bermejuela_numantina: { h: 'RAL', tramo: 'medio' },
  bermejuela_esla: { h: 'RAL', tramo: 'medio' },
  bermejuela_salmantina: { h: 'RA', tramo: 'medio' },
  bordallo_gallo: { h: 'RA', tramo: 'medio' },
  colmilleja_valle: { h: 'RA', tramo: 'medio' },
  colmilleja_atlantica: { h: 'RA', tramo: 'medio' },
  aguja_rio: { h: 'RC', tramo: 'bajo' },
}

const T = 'Translocado / introducido en esta cuenca'
const EXOTICAS_COMUNES = ['carpa', 'carpin', 'black_bass', 'percasol', 'alburno', 'gambusia']

// Especies por región. Una entrada puede ser 'id', ['id', nota] o ['id', nota, [textos]]: en el
// último caso, la especie solo se asigna en esa región a las masas cuyo nombre contiene alguno de
// los textos (ríos concretos de la cuenca).
// Distribuciones revisadas con la Enciclopedia Virtual de los Vertebrados Españoles (MNCN-CSIC).
const REGIONES = {
  'Miño-Sil': ['colmilleja_atlantica', 'trucha', 'salmon', 'anguila', 'sabalo', 'saboga', 'lamprea_marina', 'lisa', 'platija', 'espinoso', 'boga_duero', 'bordallo',
    ['barbo_comun', null, ['limia', 'salas']], ['lamprehuela', 'Cabecera del Sil', ['rio sil']], 'bermejuela', ['gobio', T], ['colmilleja', 'Probablemente introducida'], 'carpa', 'black_bass'],
  'Galicia-Costa': ['salmon', 'trucha', 'anguila', 'lamprea_marina', ['sabalo', null, ['umia']], ['saboga', null, ['ulla', 'lerez', 'verdugo']], 'platija', 'lisa', 'espinoso', 'boga_duero', 'bordallo', ['colmilleja', 'Probablemente introducida', ['ulla']], 'carpa', 'black_bass', 'gambusia'],
  'Cantábrico Occidental': [['lamprea_arroyo', 'Muy escasa y localizada', ['deva', 'cares']], 'salmon', 'trucha', 'anguila', 'lamprea_marina', ['sabalo', null, ['ason', 'deva', 'sella', 'nalon', 'narcea', 'rio eo']], 'platija', 'lisa',
    ['piscardo', T], ['gobio', T, ['nalon', 'nansa']], ['colmilleja', 'Probablemente introducida', ['nalon']], ['barbo_graells', 'Introducido', ['ason']], ['salvelino', 'Introducido (Somiedo)']],
  'Cantábrico Oriental': [['lamprea_arroyo', 'Muy escasa y localizada', ['olabidea']], 'salmon', 'trucha', 'anguila', 'lamprea_marina', 'sabalo', 'platija', 'lisa', 'burtaina', 'piscardo', ['gobio', null, ['bidasoa', 'oria']], 'lobo_rio', 'madrilla',
    ['barbo_graells', null, ['oria', 'nervion', 'artibai', 'rio oka', 'rio oca']], ['espinoso', null, ['gobelas', 'galindo', 'udondo', 'leioa', 'jaizubia']], 'carpa', 'black_bass', 'percasol'],
  Duero: ['trucha', 'hucho', 'carpa_dorada', 'barbo_comun', 'boga_duero', 'bordallo', 'bermejuela_numantina', 'bermejuela_esla', 'bermejuela_salmantina', 'calandino', 'lamprehuela', 'sarda', 'colmilleja_alagon',
    ['colmilleja', 'Afluentes de la margen izquierda', ['tormes', 'adaja', 'eresma', 'voltoya', 'cega', 'duraton', 'riaza', 'huebra', 'yeltes', 'agueda', 'zapardiel', 'trabancos', 'guarena']],
    'tenca', ['gobio', T], ['lobo_rio', T], ['piscardo', T], ['salvelino', 'Introducido (Gredos)'], 'carpa', 'carpin', 'lucio', 'lucioperca', 'black_bass', 'percasol', 'alburno', 'gambusia'],
  Tajo: ['bermejuela_salmantina', 'bordallo_gallo', 'trucha', 'carpa_dorada', 'carpa_herbivora', 'pseudorasbora', 'barbo_comun', 'barbo_comizo', 'boga_tajo', 'cacho', 'calandino', 'pardilla', 'colmilleja', 'colmilleja_alagon', 'bermejuela',
    ['bordallo', 'Cabecera del Alberche', ['alberche']], ['lamprehuela', 'Cabeceras', ['lozoya', 'jarama', 'tajuna', 'manzanares']], 'tenca', ['gobio', T], ['salvelino', 'Introducido (Gredos)'],
    'carpa', 'carpin', 'lucio', 'lucioperca', 'siluro', 'perca', 'black_bass', 'percasol', 'alburno', 'pez_gato_negro', 'gambusia'],
  Guadiana: ['carpa_dorada', 'carpa_herbivora', 'pseudorasbora', 'barbo_comizo', 'barbo_cabecicorto', 'boga_guadiana', 'cacho', 'calandino', 'pardilla', 'colmilleja', 'jarabugo',
    ['barbo_gitano', 'Afluentes del tramo bajo', ['chanza', 'malagon']], ['barbo_mediterraneo', 'Alto Guadiana', ['ciguela', 'ruidera', 'penarroya']], ['fraile', 'Muy localizado'],
    'anguila', 'lamprea_marina', ['sabalo', 'Tramo bajo', ['guadiana']], ['saboga', 'Tramo bajo', ['guadiana']], 'lisa', ['fundulo', 'Desembocadura'], 'tenca', ['gobio', T], 'carpa', 'carpin', 'lucio', 'lucioperca', 'black_bass', 'percasol', 'alburno', 'rutilo', 'pez_gato_negro', 'chanchito', 'gambusia'],
  Guadalquivir: [['siluro', 'Introducción reciente, en expansión'], 'trucha', 'carpa_dorada', 'carpa_herbivora', 'pseudorasbora', 'barbo_gitano', 'boga_guadiana', 'cacho', 'calandino', 'pardilla', 'colmilleja', 'pardilla_oretana', 'bogardilla', 'jarabugo', 'salinete',
    'anguila', 'lamprea_marina', ['sabalo', 'Estuario', ['guadalquivir']], ['saboga', 'Estuario', ['guadalquivir']], 'lisa', 'pejerrey', ['gobio', T], 'carpa', 'carpin', 'black_bass', 'percasol', 'alburno', ['pez_gato_negro', 'Introducción reciente, en expansión'], 'chanchito', 'fundulo', 'gambusia'],
  'Guadalete y Barbate': ['colmilleja_valle', ['cacho_malagueno', null, ['guadalete', 'rio de la jara', 'rio de la vega', 'rio del valle']], 'barbo_gitano', 'boga_guadiana', 'colmilleja', 'anguila', 'lamprea_marina', 'lisa', 'pejerrey', 'salinete', 'fundulo',
    ['gobio', T, ['guadalete']], 'carpa', 'carpin', 'black_bass', 'percasol', 'alburno', 'gambusia'],
  'Tinto, Odiel y Piedras': ['barbo_gitano', 'boga_guadiana', 'cacho', 'calandino', 'colmilleja', 'anguila', 'lisa', 'pejerrey', 'fundulo', 'carpa', 'black_bass', 'percasol', 'gambusia'],
  'Mediterránea Andaluza': ['trucha', 'cacho_malagueno', 'carpa_dorada', 'barbo_gitano', 'cacho', ['colmilleja', null, ['guadalhorce', 'guadalmedina']], 'anguila', 'lisa', 'pejerrey', 'fartet',
    ['lamprea_marina', null, ['guadiaro']], ['sabalo', null, ['guadiaro', 'hozgarganta']], ['saboga', null, ['guadiaro']], ['fraile', 'Muy localizado', ['rio verde', 'guadaiza', 'hozgarganta']],
    'carpa', 'black_bass', 'percasol', 'gambusia'],
  Segura: ['trucha', 'carpa_dorada', 'barbo_gitano', 'cacho', ['colmilleja', 'Citas recientes'], 'anguila', 'lisa', 'pejerrey', 'fartet', ['gobio', T], 'carpa', 'carpin', 'black_bass', 'percasol', 'alburno', 'lucio', 'lucioperca', 'gambusia'],
  Júcar: [['siluro', 'Introducción reciente, en expansión'], 'aguja_rio', 'trucha', 'carpa_dorada', 'carpa_herbivora', 'pseudorasbora', 'barbo_mediterraneo', 'cacho_valenciano', 'colmilleja', 'anguila', 'lisa', 'pejerrey', 'samaruc', 'fartet',
    ['fraile', 'Muy localizado', ['bullent']], ['barbo_colirrojo', null, ['palancia', 'cenia', 'senia']], ['gobio', T], ['dojo', 'Arrozales y marjales'], 'lucioperca', 'pez_gato_negro', ...EXOTICAS_COMUNES],
  'Júcar|RIO JUCAR': ['loina', 'fraile', 'lucio', ['barbo_colirrojo', 'Citas recientes']],
  'Júcar|RIO TURIA': ['madrija', 'barbo_colirrojo'],
  'Júcar|RIO MIJARES': ['madrija', 'barbo_colirrojo'],
  Ebro: ['piscardo_garona', 'aguja_rio', 'trucha', 'burtaina_garona', 'brema_comun', 'aspio', 'pseudorasbora', 'carpa_dorada', 'carpa_herbivora', 'barbo_graells', 'madrilla', 'bagre', 'bermejuela', 'lamprehuela', 'gobio', 'piscardo', 'lobo_rio', 'fraile', 'barbo_colirrojo', 'colmilleja',
    ['cacho', null, ['baias', 'rio piedra', 'matarrana']], ['espinoso', 'Delta (Ullals de l\'Arispe)', ['arispe', 'ullals']], ['samaruc', 'Delta (reintroducciones)'],
    'anguila', ['lamprea_marina', 'Capturas esporádicas'], ['saboga', 'Tramo bajo'], 'lisa', 'fartet', 'pejerrey', 'salvelino', 'carpa', 'carpin', 'siluro', 'lucio', 'lucioperca', 'black_bass', 'percasol', 'alburno', 'rutilo', 'gardi', 'pez_gato_negro', 'pez_gato_punteado', 'blicca', 'perca', 'fundulo', 'dojo', 'gambusia'],
  'Internas de Cataluña': [['siluro', 'Introducción reciente, en expansión'], 'piscardo_garona', 'aguja_rio', 'trucha', 'burtaina_garona', 'brema_comun', 'pseudorasbora', 'carpa_dorada', 'barbo_graells', 'bagre', 'anguila', 'lisa', 'pejerrey', 'fartet', 'salvelino',
    ['fraile', 'Muy localizado', ['fluvia', 'banyoles']], ['colmilleja', 'Probablemente introducida', ['banyoles']], 'carpa', 'carpin', 'black_bass', 'percasol', 'alburno', 'rutilo', 'gardi', 'pez_gato_negro', 'lucioperca', 'gambusia'],
  'Internas de Cataluña|NE': ['gobio_languedoc', 'piscardo_languedoc', 'barbo_montana', 'espinoso', ['saboga', 'Tramo bajo', ['fluvia']]],
  'Internas de Cataluña|SUR': [['barbo_colirrojo', null, ['llobregat', 'cardener', 'anoia', 'francoli', 'foix', 'besos', 'gaia', 'riudecanyes']], 'madrilla', ['barbo_montana', null, ['daro', 'tordera', 'besos']], ['espinoso', null, ['daro', 'tordera', 'orlina']]],
}
const SUBCUENCAS_NE_CATALUNA = ['RIO TER', 'RIO FLUVIA', 'RIO MUGA']

// Especies muy localizadas: solo en masas cuyo nombre contenga alguno de estos textos
const SOLO_EN = {
  sarda: ['huebra', 'uces', 'yeltes', 'camaces'],
  colmilleja_alagon: ['alagon', 'arrago', 'huebra', 'yeltes', 'agueda', 'tormes'],
  pardilla_oretana: ['robledillo'],
  bogardilla: ['jandula', 'rumblar', 'robledillo'],
  // ríos donde sigue presente (se han perdido Alcarrache, Múrtigas, Aljucén, Guadalupejo, Fresnedoso, Esteras y Valdeazogues)
  jarabugo: ['albarragena', 'albarregas', 'albuera', 'alcorneo', 'ardila', 'calaboza', 'estena', 'estenilla', 'garbayuela', 'gevora', 'guadamez', 'guadarranque', 'guadalemar', 'matachel', 'quejigares', 'rio retin', 'sansustre', 'del sillo', 'siruela', 'bembezar'],
  burtaina: ['bidasoa'],
  hucho: ['tormes'],
  cacho_malagueno: ['guadiaro', 'genal', 'hozgarganta', 'guadaiza', 'guadalmina', 'piquero', 'guadalmesi', 'vaquero', 'rio de la miel', 'guadalete', 'rio de la jara', 'rio de la vega', 'rio del valle'],
  piscardo_garona: ['garona', 'garonne', 'joeu', 'nere', 'unhola', 'valarties', 'aiguamog', 'varrados', 'toran', 'ruda'],
  bermejuela_esla: ['esla', 'porma', 'curueno', 'bernesga', 'torio', 'orbigo', 'luna', 'omana', 'tuerto', 'duerna', 'rio eria', 'rio tera', 'rio cea', 'valderaduey'],
  bermejuela_salmantina: ['alagon', 'cuerpo de hombre', 'corneja'],
  bordallo_gallo: ['rio gallo'],
  colmilleja_valle: ['rio del valle', 'rio valle'],
  colmilleja_atlantica: ['rio mino', 'rio tea', 'limia', 'macaco'],
  burtaina_garona: ['garona', 'garonne', 'joeu', 'nere', 'unhola', 'valarties', 'aiguamog', 'varradòs', 'varrados', 'toran', 'ruda'],
}
const SOLO_SUBCUENCA = { burtaina: ['RIO BIDASOA'] }
// Especies que NO están en masas cuyo nombre contenga estos textos (allí las sustituye otra)
const GARONA = ['garona', 'garonne', 'joeu', 'nere', 'unhola', 'valarties', 'aiguamog', 'varrados', 'toran', 'ruda']
const EXCEPTO_EN = {
  piscardo: GARONA,
  cacho: ['guadiaro', 'genal', 'hozgarganta', 'guadaiza', 'guadalmina', 'piquero', 'guadalmesi', 'vaquero', 'rio de la miel'],
  colmilleja: ['rio del valle'],
  bermejuela_numantina: ['esla', 'porma', 'curueno', 'bernesga', 'torio', 'orbigo', 'luna', 'omana', 'tuerto', 'duerna', 'rio eria', 'rio tera', 'rio cea', 'valderaduey', 'corneja'],
}

// Altitud mínima (m) a la que llega la cabecera para que haya trucha, por región
const ALT_TRUCHA = {
  'Miño-Sil': 0, 'Galicia-Costa': 0, 'Cantábrico Occidental': 0, 'Cantábrico Oriental': 0,
  Duero: 750, Ebro: 700, Tajo: 800, Júcar: 800, 'Internas de Cataluña': 500,
  Guadiana: 1100, Guadalquivir: 1000, Segura: 900, 'Mediterránea Andaluza': 1000,
  'Guadalete y Barbate': 99999, 'Tinto, Odiel y Piedras': 99999,
}
const NORTE = new Set(['Miño-Sil', 'Galicia-Costa', 'Cantábrico Occidental', 'Cantábrico Oriental'])
const SIN_PECES = ['rio tinto']

// Altitud máxima (m) a la que suele encontrarse cada especie (sobre todo exóticas de grandes
// embalses y tramos bajos, que no han colonizado las cabeceras)
const ALT_MAX = {
  siluro: 450, blicca: 300, pez_gato_punteado: 250, rutilo: 600, pez_gato_negro: 550, lucioperca: 750,
  perca: 900, lucio: 1150, black_bass: 1100, alburno: 900, chanchito: 300, gardi: 700, tenca: 1200,
  barbo_comizo: 600, barbo_cabecicorto: 700, fraile: 700, pejerrey: 20, samaruc: 20, fartet: 20, salinete: 20,
  aguja_rio: 20, colmilleja_atlantica: 400, colmilleja_valle: 300,
  carpa_dorada: 1000, carpa_herbivora: 800, brema_comun: 250, aspio: 250, pseudorasbora: 800, hucho: 1000,
} // aguas ácidas, prácticamente sin peces

/** Hábitat (letra de RASGOS.h) de una masa de agua */
function habitat(m) {
  const elev = m.elev ?? m.zmin ?? 0
  switch (m.tipo) {
    case 'rio': return 'R'
    case 'arroyo': return 'A'
    case 'embalse': return 'E'
    case 'balsa': return 'B'
    case 'lago':
    case 'laguna':
    case 'humedal':
      if (elev <= 10) return 'C'
      if (elev >= (NORTE.has(m.cuenca) ? 1200 : 1500)) return 'M'
      return 'L'
    default: return 'R'
  }
}

/**
 * Devuelve [{ id, nota }] con las especies probables en una masa generada automáticamente.
 * También devuelve avisos sobre la masa (curso estacional, lago de montaña…).
 */
export function especiesAuto(m) {
  const nombre = norm(m.nombre || '')
  const avisos = []
  if (SIN_PECES.some((s) => nombre.includes(s))) {
    return { especies: [], avisos: ['Aguas muy ácidas por la minería: prácticamente sin peces.'] }
  }

  let lista = [...(REGIONES[m.cuenca] || [])]
  if (m.subcuenca && REGIONES[`${m.cuenca}|${m.subcuenca}`]) lista.push(...REGIONES[`${m.cuenca}|${m.subcuenca}`])
  if (m.cuenca === 'Internas de Cataluña') lista.push(...REGIONES[`Internas de Cataluña|${SUBCUENCAS_NE_CATALUNA.includes(m.subcuenca) ? 'NE' : 'SUR'}`])

  const h = habitat(m)
  const zmin = m.zmin ?? m.elev ?? 0
  const zmax = m.zmax ?? m.elev ?? 0
  const grande = m.tipo === 'embalse' || (m.tipo === 'rio' && (m.jer ?? 4) <= 2)
  const altTrucha = ALT_TRUCHA[m.cuenca] ?? 900
  const limiteCiprinidos = NORTE.has(m.cuenca) ? 700 : 1400

  const vistos = new Set()
  const res = []
  for (const e of lista) {
    const [id, notaRegion, soloNombres] = Array.isArray(e) ? e : [e, null, null]
    if (vistos.has(id)) continue
    if (soloNombres && !soloNombres.some((t) => nombre.includes(t))) continue
    const r = RASGOS[id]
    if (!r || !r.h.includes(h)) continue
    if (r.grande && !grande) continue
    if (SOLO_EN[id] && !SOLO_EN[id].some((s) => nombre.includes(s))) continue
    if (EXCEPTO_EN[id]?.some((s) => nombre.includes(s))) continue
    if (ALT_MAX[id] != null && zmin > ALT_MAX[id]) continue
    if (SOLO_SUBCUENCA[id] && !SOLO_SUBCUENCA[id].includes(m.subcuenca)) continue

    let nota = notaRegion
    if (h === 'M') {
      // lago de alta montaña: originalmente sin peces
      if (!['trucha', 'piscardo', 'salvelino'].includes(id)) continue
      if (id === 'salvelino' && zmax < (NORTE.has(m.cuenca) ? 1400 : 1800)) continue
      nota = id === 'trucha' ? 'Introducida en el lago' : 'Introducido'
    } else if (r.tramo === 'alto') {
      if (h === 'E' || h === 'L') {
        if (zmax < altTrucha + (NORTE.has(m.cuenca) ? 300 : 200)) continue
      } else if (zmax < altTrucha) continue
      if (!NORTE.has(m.cuenca) && zmin < altTrucha && h !== 'E') nota = nota || 'Tramos altos'
    } else if (r.tramo === 'medio') {
      if (zmin > limiteCiprinidos) continue
    } else if (r.tramo === 'bajo') {
      if (h !== 'C' && zmin > 60) continue
      if (h === 'R' && zmax > 300) nota = nota || 'Tramo bajo'
    } else if (r.tramo === 'anguila') {
      if (zmin > 200) continue
      if (h === 'R' && zmax > 400) nota = nota || 'Tramo bajo'
    } else if (r.tramo === 'gambusia') {
      if (zmin > 800) continue
    }
    if (id === 'salmon' && !((m.jer ?? 4) <= 3 && NORTE.has(m.cuenca))) continue

    vistos.add(id)
    res.push({ id, nota })
  }

  // avisos sobre la masa
  if (h === 'M') avisos.push('Lago de alta montaña: casi todos eran originalmente sin peces; los que hay suelen ser introducidos, y muchos siguen sin peces.')
  if (m.tipo === 'balsa') avisos.push('Balsa o charca artificial: su fauna depende de lo que se haya soltado. Muchas no tienen peces.')
  if (m.persist === 'estacional' || m.persist === 'intermitente') avisos.push('Curso de agua no permanente: puede secarse en verano y no tener peces todo el año.')
  if (/^(rambla|barranco)\b/.test(nombre) && ['Segura', 'Júcar', 'Mediterránea Andaluza'].includes(m.cuenca))
    avisos.push('Las ramblas y barrancos del sureste suelen estar secos la mayor parte del año.')
  if (!res.length && !avisos.length) avisos.push('Con los datos disponibles no se puede estimar qué peces hay aquí.')

  return { especies: res, avisos }
}
