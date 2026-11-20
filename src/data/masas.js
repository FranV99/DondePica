// Masas de agua y especies presentes.
//
// tipo: 'rio' | 'embalse' | 'lago' | 'laguna' | 'humedal'
// punto: [lat, lon] para el marcador (embalses, lagos) o para ríos sin trazado en geometria.json
// especies: id de ESPECIES o { id, nota } cuando hay un matiz local.
//
// La asignación es orientativa y se basa en la distribución conocida por cuenca
// (Doadrio, Atlas y Libro Rojo de los Peces Continentales de España, y bibliografía posterior).
// Las poblaciones cambian (nuevas introducciones, extinciones locales): contrasta con los
// datos de tu comunidad autónoma y la normativa de pesca vigente.

const T = (id) => ({ id, nota: 'Translocado / introducido en esta cuenca' })

export const CUENCAS = {
  // tonos de agua y vegetación; se evita el coral, reservado para la selección
  'Miño-Sil': '#3f78a6',
  'Galicia-Costa': '#4fa3a5',
  'Cantábrico Occidental': '#4d9157',
  'Cantábrico Oriental': '#8aa64a',
  Duero: '#8a5a9e',
  Tajo: '#6a9a3c',
  Guadiana: '#6b6fb5',
  Guadalquivir: '#8c6b4f',
  'Mediterránea Andaluza': '#b2638f',
  Segura: '#7f8a84',
  Júcar: '#c2a32c',
  Ebro: '#2e6aa6',
  'Internas de Cataluña': '#2aa1b8',
  'Guadalete y Barbate': '#9e8573',
  'Tinto, Odiel y Piedras': '#6f6435',
}

export const MASAS = [
  // ───────────── MIÑO-SIL ─────────────
  {
    id: 'mino', nombre: 'Río Miño', tipo: 'rio', cuenca: 'Miño-Sil',
    descripcion: 'Principal río gallego. Los migradores solo alcanzan el tramo internacional, aguas abajo de la presa de Frieira.',
    especies: ['trucha', { id: 'salmon', nota: 'Tramo bajo internacional' }, 'anguila', 'sabalo', 'saboga', 'lamprea_marina', 'lisa', 'platija', 'espinoso', 'boga_duero', 'bordallo', { id: 'colmilleja_atlantica', nota: 'Tramo bajo (río Tea)' }, { id: 'colmilleja', nota: 'Probablemente introducida' }, T('gobio'), 'carpa', 'black_bass'],
  },
  {
    id: 'sil', nombre: 'Río Sil', tipo: 'rio', cuenca: 'Miño-Sil',
    descripcion: 'Afluente principal del Miño, muy regulado por embalses hidroeléctricos (Cañón del Sil).',
    especies: ['trucha', 'boga_duero', 'bordallo', 'bermejuela', { id: 'lamprehuela', nota: 'Cabecera' }, T('gobio'), 'carpa', 'black_bass'],
  },
  {
    id: 'belesar', nombre: 'Embalse de Belesar', alias: ['Encoro de Belesar'], tipo: 'embalse', cuenca: 'Miño-Sil', punto: [42.65, -7.65],
    descripcion: 'Gran embalse del Miño en la Ribeira Sacra.',
    especies: ['trucha', 'boga_duero', 'bordallo', T('gobio'), 'carpa', 'black_bass'],
  },

  // ───────────── GALICIA-COSTA ─────────────
  {
    id: 'ulla', nombre: 'Río Ulla', tipo: 'rio', cuenca: 'Galicia-Costa', punto: [42.77, -8.4],
    descripcion: 'Río salmonero gallego que desemboca en la ría de Arousa.',
    especies: ['salmon', 'trucha', 'anguila', 'lamprea_marina', 'saboga', { id: 'sabalo', nota: 'Cita dudosa: hoy solo hay saboga' }, 'platija', 'lisa', 'espinoso', 'boga_duero', 'bordallo', { id: 'colmilleja', nota: 'Probablemente introducida' }],
  },

  // ───────────── CANTÁBRICO ─────────────
  {
    id: 'narcea', nombre: 'Río Narcea', tipo: 'rio', cuenca: 'Cantábrico Occidental',
    descripcion: 'Uno de los ríos salmoneros más conocidos de Asturias.',
    especies: ['salmon', 'trucha', 'anguila', 'lamprea_marina', 'sabalo', 'platija', 'lisa'],
  },
  {
    id: 'nalon', nombre: 'Río Nalón', tipo: 'rio', cuenca: 'Cantábrico Occidental', punto: [43.3, -5.68],
    descripcion: 'Mayor río de Asturias; recibe al Narcea antes de desembocar en San Esteban de Pravia.',
    especies: ['trucha', { id: 'salmon', nota: 'Sobre todo en el tramo bajo y a través del Narcea' }, 'anguila', 'lamprea_marina', 'sabalo', 'platija', 'lisa', T('piscardo'), T('gobio'), { id: 'colmilleja', nota: 'Probablemente introducida' }],
  },
  {
    id: 'sella', nombre: 'Río Sella', tipo: 'rio', cuenca: 'Cantábrico Occidental', punto: [43.35, -5.13],
    descripcion: 'Río salmonero emblemático (Cangas de Onís, Arriondas, Ribadesella).',
    especies: ['salmon', 'trucha', 'anguila', 'lamprea_marina', 'sabalo', 'platija', 'lisa'],
  },
  {
    id: 'bidasoa', nombre: 'Río Bidasoa', tipo: 'rio', cuenca: 'Cantábrico Oriental', punto: [43.28, -1.69],
    descripcion: 'Río navarro-guipuzcoano, frontera con Francia en su tramo final. Único enclave español de la burtaina.',
    especies: ['salmon', 'trucha', 'anguila', 'lamprea_marina', 'sabalo', 'platija', 'lisa', 'burtaina', 'piscardo', 'gobio', 'lobo_rio', 'madrilla'],
  },

  // ───────────── DUERO ─────────────
  {
    id: 'duero', nombre: 'Río Duero', tipo: 'rio', cuenca: 'Duero',
    descripcion: 'Tercer río más largo de la península. Truchero en cabecera (Urbión) y ciprinícola en la meseta.',
    especies: ['trucha', 'barbo_comun', 'boga_duero', 'bordallo', 'bermejuela_numantina', { id: 'bermejuela_esla', nota: 'Subcuenca del Esla' }, { id: 'bermejuela_salmantina', nota: 'Río Corneja' }, 'calandino', 'lamprehuela', { id: 'colmilleja', nota: 'Afluentes de la margen izquierda' }, { id: 'sarda', nota: 'Solo en afluentes salmantinos (Huebra, Uces, Yeltes)' }, 'tenca', T('gobio'), T('lobo_rio'), T('piscardo'), 'carpa', 'carpin', 'lucio', 'lucioperca', 'black_bass', 'percasol', 'alburno', 'gambusia'],
  },
  {
    id: 'esla', nombre: 'Río Esla', tipo: 'rio', cuenca: 'Duero',
    descripcion: 'Gran afluente leonés del Duero; truchero en la montaña y con embalses en su tramo final.',
    especies: ['trucha', 'barbo_comun', 'boga_duero', 'bordallo', 'bermejuela_esla', 'lamprehuela', 'tenca', T('gobio'), T('piscardo'), 'carpa', 'lucio', 'black_bass', 'percasol'],
  },
  {
    id: 'pisuerga', nombre: 'Río Pisuerga', tipo: 'rio', cuenca: 'Duero',
    descripcion: 'Nace en la montaña palentina y desemboca en el Duero aguas abajo de Valladolid.',
    especies: ['trucha', 'barbo_comun', 'boga_duero', 'bordallo', 'bermejuela_numantina', 'lamprehuela', 'tenca', T('gobio'), T('lobo_rio'), T('piscardo'), 'carpa', 'lucio', 'black_bass', 'percasol', 'alburno'],
  },
  {
    id: 'tormes', nombre: 'Río Tormes', tipo: 'rio', cuenca: 'Duero',
    descripcion: 'Nace en Gredos y pasa por Salamanca antes de unirse al Duero en los Arribes.',
    especies: ['trucha', 'barbo_comun', 'boga_duero', 'bordallo', 'calandino', 'colmilleja_alagon', 'colmilleja', 'bermejuela_numantina', { id: 'bermejuela_salmantina', nota: 'Afluente Corneja' }, 'tenca', T('gobio'), { id: 'hucho', nota: 'Entre la presa de Santa Teresa y Huerta (coto de Villagonzalo); única población de España' }, 'carpa', 'lucio', 'black_bass', 'percasol', 'alburno'],
  },
  {
    id: 'ricobayo', nombre: 'Embalse de Ricobayo', tipo: 'embalse', cuenca: 'Duero', punto: [41.58, -5.95],
    descripcion: 'Gran embalse del Esla en Zamora, muy frecuentado por pescadores de depredadores.',
    especies: ['barbo_comun', 'boga_duero', 'bordallo', 'tenca', 'carpa', 'carpin', 'lucio', 'lucioperca', 'black_bass', 'percasol', 'alburno'],
  },
  {
    id: 'almendra', nombre: 'Embalse de Almendra', tipo: 'embalse', cuenca: 'Duero', punto: [41.2, -6.22],
    descripcion: 'Embalse del Tormes, uno de los mayores de España por capacidad.',
    especies: ['barbo_comun', 'boga_duero', 'tenca', { id: 'hucho', nota: 'Repoblaciones' }, 'carpa', 'carpin', 'lucio', 'black_bass', 'percasol', 'alburno'],
  },
  {
    id: 'cuerdapozo', nombre: 'Embalse de la Cuerda del Pozo', alias: ['Embalse de Cuerda del Pozo'], tipo: 'embalse', cuenca: 'Duero', punto: [41.87, -2.73],
    descripcion: 'Embalse de cabecera del Duero, en Soria.',
    especies: ['trucha', 'barbo_comun', 'boga_duero', 'bermejuela_numantina', T('gobio'), 'carpa', 'lucio'],
  },
  {
    id: 'sanabria', nombre: 'Lago de Sanabria', tipo: 'lago', cuenca: 'Duero', punto: [42.12, -6.72],
    descripcion: 'Mayor lago glaciar de la península, atravesado por el río Tera.',
    especies: ['trucha', { id: 'bermejuela_esla', nota: 'Cuenca del Tera (Esla)' }, 'boga_duero', 'bordallo', 'tenca', T('gobio'), T('piscardo')],
  },

  // ───────────── TAJO ─────────────
  {
    id: 'tajo', nombre: 'Río Tajo', tipo: 'rio', cuenca: 'Tajo',
    descripcion: 'El río más largo de la península. Truchero en el Alto Tajo; en Aranjuez, Toledo y Extremadura dominan ciprínidos y especies introducidas.',
    especies: ['trucha', 'barbo_comun', 'barbo_comizo', 'boga_tajo', 'cacho', 'calandino', 'pardilla', 'colmilleja', 'tenca', T('gobio'), 'carpa', 'carpin', 'lucio', 'lucioperca', 'siluro', 'perca', 'black_bass', 'percasol', 'alburno', 'pez_gato_negro', 'gambusia'],
  },
  {
    id: 'jarama', nombre: 'Río Jarama', tipo: 'rio', cuenca: 'Tajo', punto: [40.21, -3.57],
    descripcion: 'Principal afluente madrileño del Tajo (recibe al Lozoya, Henares y Manzanares).',
    especies: [{ id: 'trucha', nota: 'Cabecera y Lozoya' }, 'barbo_comun', 'boga_tajo', 'cacho', 'bermejuela', 'colmilleja', { id: 'lamprehuela', nota: 'Cabecera' }, T('gobio'), 'carpa', 'carpin', 'black_bass', 'percasol', 'alburno', 'gambusia'],
  },
  {
    id: 'alberche', nombre: 'Río Alberche', tipo: 'rio', cuenca: 'Tajo',
    descripcion: 'Nace en Gredos y desemboca en el Tajo en Talavera de la Reina.',
    especies: ['trucha', 'barbo_comun', 'boga_tajo', 'cacho', { id: 'bordallo', nota: 'Cabecera' }, 'calandino', 'colmilleja', 'carpa', 'black_bass', 'percasol', 'alburno'],
  },
  {
    id: 'tietar', nombre: 'Río Tiétar', tipo: 'rio', cuenca: 'Tajo',
    descripcion: 'Recorre el sur de Gredos y la Vera; gargantas trucheras y tramo bajo en Monfragüe.',
    especies: ['trucha', 'barbo_comun', 'barbo_comizo', 'boga_tajo', 'cacho', 'calandino', 'pardilla', 'colmilleja', 'carpa', { id: 'siluro', nota: 'Introducción reciente, en expansión' }, 'black_bass', 'percasol'],
  },
  {
    id: 'alagon', nombre: 'Río Alagón', tipo: 'rio', cuenca: 'Tajo',
    descripcion: 'Afluente salmantino-cacereño del Tajo; hábitat de la colmilleja del Alagón.',
    especies: ['trucha', 'barbo_comun', 'barbo_comizo', 'boga_tajo', 'cacho', 'calandino', 'pardilla', 'colmilleja', 'colmilleja_alagon', { id: 'bermejuela_salmantina', nota: 'Alagón alto y Cuerpo de Hombre' }, 'carpa', { id: 'siluro', nota: 'Introducción reciente, en expansión' }, 'black_bass', 'percasol'],
  },
  {
    id: 'entrepenas', nombre: 'Embalse de Entrepeñas', tipo: 'embalse', cuenca: 'Tajo', punto: [40.55, -2.7],
    descripcion: 'Uno de los "mares de Castilla" en el Tajo (Guadalajara).',
    especies: ['barbo_comun', 'boga_tajo', 'cacho', 'carpa', 'lucio', 'black_bass', 'percasol', 'alburno'],
  },
  {
    id: 'buendia', nombre: 'Embalse de Buendía', tipo: 'embalse', cuenca: 'Tajo', punto: [40.4, -2.75],
    descripcion: 'Embalse en el Guadiela, unido a Entrepeñas.',
    especies: ['barbo_comun', 'boga_tajo', 'cacho', 'carpa', 'carpin', 'lucio', 'black_bass', 'percasol', 'alburno'],
  },
  {
    id: 'sanjuan', nombre: 'Embalse de San Juan', tipo: 'embalse', cuenca: 'Tajo', punto: [40.39, -4.32],
    descripcion: 'Embalse del Alberche, conocido como "la playa de Madrid".',
    especies: ['barbo_comun', 'boga_tajo', 'cacho', 'carpa', 'black_bass', 'percasol', 'alburno'],
  },
  {
    id: 'gabriel', nombre: 'Embalse de Gabriel y Galán', tipo: 'embalse', cuenca: 'Tajo', punto: [40.25, -6.12],
    descripcion: 'Embalse del Alagón en el norte de Cáceres.',
    especies: ['barbo_comun', 'boga_tajo', 'cacho', 'carpa', 'lucio', 'black_bass', 'percasol'],
  },
  {
    id: 'valdecanas', nombre: 'Embalse de Valdecañas', tipo: 'embalse', cuenca: 'Tajo', punto: [39.8, -5.45],
    descripcion: 'Embalse del Tajo en el Campo Arañuelo (Cáceres).',
    especies: ['barbo_comizo', 'barbo_comun', 'boga_tajo', 'carpa', 'siluro', 'black_bass', 'percasol', 'alburno'],
  },
  {
    id: 'alcantara', nombre: 'Embalse de Alcántara', alias: ['Embalse de José María de Oriol', 'Embalse de Alcántara II', 'Embalse de José María de Oriol - Alcántara II'], tipo: 'embalse', cuenca: 'Tajo', punto: [39.75, -6.55],
    descripcion: 'Embalse José María de Oriol, el mayor del Tajo.',
    especies: ['barbo_comizo', 'barbo_comun', 'boga_tajo', 'carpa', 'carpin', 'lucio', 'lucioperca', 'siluro', 'black_bass', 'percasol', 'alburno'],
  },

  // ───────────── GUADIANA ─────────────
  {
    id: 'guadiana', nombre: 'Río Guadiana', tipo: 'rio', cuenca: 'Guadiana',
    descripcion: 'Nace en las Lagunas de Ruidera y atraviesa La Mancha y Extremadura hasta Ayamonte.',
    especies: ['barbo_comizo', 'barbo_cabecicorto', 'boga_guadiana', 'cacho', 'calandino', 'pardilla', 'colmilleja', { id: 'jarabugo', nota: 'Solo en pequeños afluentes (Estena, Gévora, Ardila, Matachel…); no en el propio Guadiana' }, { id: 'barbo_gitano', nota: 'Afluentes del tramo bajo' }, { id: 'barbo_mediterraneo', nota: 'Alto Guadiana (Ruidera, Cigüela)' }, { id: 'fraile', nota: 'Muy localizado' }, 'anguila', { id: 'lamprea_marina', nota: 'Tramo bajo' }, { id: 'sabalo', nota: 'Tramo bajo' }, { id: 'saboga', nota: 'Tramo bajo' }, { id: 'lisa', nota: 'Tramo bajo' }, { id: 'fundulo', nota: 'Desembocadura' }, 'tenca', T('gobio'), 'carpa', 'carpin', 'lucio', 'lucioperca', 'black_bass', 'percasol', 'alburno', 'rutilo', 'pez_gato_negro', 'chanchito', 'gambusia'],
  },
  {
    id: 'zujar', nombre: 'Río Zújar', tipo: 'rio', cuenca: 'Guadiana',
    descripcion: 'Afluente del Guadiana que forma el embalse de La Serena.',
    especies: ['barbo_comizo', 'barbo_cabecicorto', 'boga_guadiana', 'cacho', 'calandino', 'pardilla', 'colmilleja', 'carpa', 'black_bass', 'percasol', 'gambusia'],
  },
  {
    id: 'serena', nombre: 'Embalse de La Serena', tipo: 'embalse', cuenca: 'Guadiana', punto: [38.9, -5.25],
    descripcion: 'El mayor embalse de España por capacidad (río Zújar).',
    especies: ['barbo_comizo', 'barbo_cabecicorto', 'boga_guadiana', 'carpa', 'carpin', 'lucio', 'black_bass', 'percasol', 'alburno'],
  },
  {
    id: 'orellana', nombre: 'Embalse de Orellana', tipo: 'embalse', cuenca: 'Guadiana', punto: [39.02, -5.4],
    descripcion: 'Embalse del Guadiana con playa de agua dulce con bandera azul.',
    especies: ['barbo_comizo', 'barbo_cabecicorto', 'boga_guadiana', 'carpa', 'carpin', 'lucio', 'black_bass', 'percasol', 'alburno'],
  },
  {
    id: 'cijara', nombre: 'Embalse de Cíjara', tipo: 'embalse', cuenca: 'Guadiana', punto: [39.35, -4.88],
    descripcion: 'Embalse del Guadiana entre Badajoz y Ciudad Real, rodeado de reserva de caza.',
    especies: ['barbo_comizo', 'boga_guadiana', 'carpa', 'lucio', 'black_bass', 'percasol', 'alburno'],
  },
  {
    id: 'alqueva', nombre: 'Embalse de Alqueva', tipo: 'embalse', cuenca: 'Guadiana', punto: [38.4, -7.4],
    descripcion: 'Gran embalse hispano-portugués; la presa está en Portugal.',
    especies: ['barbo_comizo', 'barbo_cabecicorto', 'boga_guadiana', 'carpa', 'carpin', 'lucioperca', 'black_bass', 'percasol', 'alburno', 'chanchito'],
  },
  {
    id: 'ruidera', nombre: 'Lagunas de Ruidera', tipo: 'laguna', cuenca: 'Guadiana', punto: [38.93, -2.85],
    descripcion: 'Rosario de 15 lagunas escalonadas en el nacimiento del Guadiana.',
    especies: [{ id: 'barbo_mediterraneo', nota: 'Entre las lagunas y el embalse de Peñarroya' }, 'cacho', 'tenca', 'carpa', 'lucio', 'black_bass', 'percasol', 'gambusia'],
  },
  {
    id: 'daimiel', nombre: 'Tablas de Daimiel', tipo: 'humedal', cuenca: 'Guadiana', punto: [39.14, -3.7],
    descripcion: 'Humedal manchego (Parque Nacional). La fauna piscícola nativa casi ha desaparecido.',
    especies: ['carpa', 'carpin', { id: 'lucio', nota: 'Muy abundante en el pasado' }, 'gambusia'],
  },

  // ───────────── GUADALQUIVIR ─────────────
  {
    id: 'guadalquivir', nombre: 'Río Guadalquivir', tipo: 'rio', cuenca: 'Guadalquivir',
    descripcion: 'Nace en Cazorla y desemboca en Sanlúcar de Barrameda tras atravesar Doñana.',
    especies: [{ id: 'trucha', nota: 'Cabecera (Cazorla)' }, 'barbo_gitano', 'boga_guadiana', 'cacho', 'calandino', 'pardilla', 'colmilleja', { id: 'pardilla_oretana', nota: 'Solo en el río Robledillo (afluente del Jándula)' }, { id: 'bogardilla', nota: 'Afluentes de Sierra Morena' }, { id: 'salinete', nota: 'Marismas y arroyos salinos del bajo Guadalquivir' }, 'anguila', { id: 'lamprea_marina', nota: 'Tramo bajo' }, { id: 'sabalo', nota: 'Estuario' }, { id: 'saboga', nota: 'Estuario' }, 'lisa', { id: 'pejerrey', nota: 'Estuario y marismas' }, T('gobio'), 'carpa', 'carpin', { id: 'siluro', nota: 'Bajo Guadalquivir, en expansión' }, 'black_bass', 'percasol', 'alburno', { id: 'pez_gato_negro', nota: 'Introducción reciente, en expansión' }, 'chanchito', { id: 'fundulo', nota: 'Marismas' }, 'gambusia'],
  },
  {
    id: 'genil', nombre: 'Río Genil', tipo: 'rio', cuenca: 'Guadalquivir',
    descripcion: 'Nace en Sierra Nevada, pasa por Granada y forma el embalse de Iznájar.',
    especies: [{ id: 'trucha', nota: 'Sierra Nevada' }, 'barbo_gitano', 'boga_guadiana', 'cacho', 'colmilleja', 'carpa', 'black_bass', 'percasol', 'alburno', 'gambusia'],
  },
  {
    id: 'iznajar', nombre: 'Embalse de Iznájar', tipo: 'embalse', cuenca: 'Guadalquivir', punto: [37.27, -4.33],
    descripcion: 'El mayor embalse de Andalucía, en el río Genil.',
    especies: ['barbo_gitano', 'boga_guadiana', 'carpa', 'carpin', { id: 'siluro', nota: 'Introducción reciente, en expansión' }, 'black_bass', 'percasol', 'alburno'],
  },
  {
    id: 'tranco', nombre: 'Embalse del Tranco de Beas', alias: ['Embalse del Tranco'], tipo: 'embalse', cuenca: 'Guadalquivir', punto: [38.17, -2.82],
    descripcion: 'Embalse de cabecera del Guadalquivir en el P. N. de Cazorla, Segura y Las Villas.',
    especies: ['trucha', 'barbo_gitano', 'boga_guadiana', 'cacho', 'carpa', 'black_bass'],
  },

  // ───────────── MEDITERRÁNEA ANDALUZA ─────────────
  {
    id: 'guadalhorce', nombre: 'Río Guadalhorce', tipo: 'rio', cuenca: 'Mediterránea Andaluza', punto: [36.71, -4.63],
    descripcion: 'Principal río de Málaga; desemboca junto al aeropuerto.',
    especies: ['barbo_gitano', 'cacho', 'anguila', 'lisa', 'carpa', 'black_bass', 'percasol', 'gambusia'],
  },

  // ───────────── GUADALETE Y BARBATE ─────────────
  {
    id: 'valle_tarifa', nombre: 'Río del Valle', alias: ['Río del Valle (Tarifa)', 'Arroyo del Valle'], tipo: 'rio', cuenca: 'Guadalete y Barbate', punto: [36.0981, -5.7007],
    descripcion: 'Pequeño río de Tarifa (Cádiz), entre Facinas y la costa. Es el único lugar del mundo donde vive la colmilleja del Valle, descrita en 2023.',
    especies: [{ id: 'colmilleja_valle', nota: 'Única población conocida (menos de 5 km²); ha desaparecido de algunos puntos desde 2010' }, 'cacho_malagueno'],
  },

  // ───────────── SEGURA ─────────────
  {
    id: 'segura', nombre: 'Río Segura', tipo: 'rio', cuenca: 'Segura',
    descripcion: 'Nace en la Sierra de Segura y desemboca en Guardamar; muy regulado.',
    especies: [{ id: 'trucha', nota: 'Cabecera' }, 'barbo_gitano', 'cacho', { id: 'colmilleja', nota: 'Citas recientes' }, 'anguila', 'lisa', T('gobio'), 'carpa', 'black_bass', 'percasol', 'alburno', 'lucioperca', 'gambusia'],
  },
  {
    id: 'cenajo', nombre: 'Embalse del Cenajo', tipo: 'embalse', cuenca: 'Segura', punto: [38.37, -1.85],
    descripcion: 'Mayor embalse de la cuenca del Segura.',
    especies: ['barbo_gitano', 'cacho', 'carpa', 'lucio', 'black_bass', 'percasol', 'alburno'],
  },

  // ───────────── JÚCAR ─────────────
  {
    id: 'jucar', nombre: 'Río Júcar', tipo: 'rio', cuenca: 'Júcar',
    descripcion: 'Nace en la Serranía de Cuenca y desemboca en Cullera. Refugio de la loína.',
    especies: ['trucha', 'barbo_mediterraneo', 'cacho_valenciano', 'loina', 'colmilleja', 'fraile', 'anguila', 'lisa', 'carpa', 'carpin', 'lucio', 'black_bass', 'percasol', 'alburno', 'gambusia'],
  },
  {
    id: 'cabriel', nombre: 'Río Cabriel', tipo: 'rio', cuenca: 'Júcar',
    descripcion: 'Uno de los ríos mejor conservados del Mediterráneo; forma el embalse de Contreras.',
    especies: ['trucha', 'barbo_mediterraneo', 'cacho_valenciano', 'loina', 'fraile', 'carpa', 'black_bass'],
  },
  {
    id: 'turia', nombre: 'Río Turia', tipo: 'rio', cuenca: 'Júcar',
    descripcion: 'Nace como Guadalaviar en Albarracín y llega a Valencia.',
    especies: ['trucha', 'barbo_mediterraneo', 'cacho_valenciano', 'madrija', 'anguila', 'carpa', 'black_bass', 'percasol', 'alburno', 'gambusia'],
  },
  {
    id: 'mijares', nombre: 'Río Mijares', tipo: 'rio', cuenca: 'Júcar',
    descripcion: 'Río turolense-castellonense que desemboca cerca de Almassora.',
    especies: ['trucha', 'barbo_mediterraneo', 'barbo_colirrojo', 'cacho_valenciano', 'madrija', 'anguila', 'carpa', 'black_bass'],
  },
  {
    id: 'alarcon', nombre: 'Embalse de Alarcón', tipo: 'embalse', cuenca: 'Júcar', punto: [39.57, -2.1],
    descripcion: 'Gran embalse del Júcar en Cuenca.',
    especies: ['barbo_mediterraneo', 'cacho_valenciano', 'carpa', 'carpin', { id: 'siluro', nota: 'Introducción reciente, en expansión' }, 'lucio', 'black_bass', 'alburno'],
  },
  {
    id: 'contreras', nombre: 'Embalse de Contreras', tipo: 'embalse', cuenca: 'Júcar', punto: [39.62, -1.5],
    descripcion: 'Embalse del Cabriel entre Cuenca y Valencia.',
    especies: ['barbo_mediterraneo', 'carpa', 'lucio', 'black_bass', 'alburno'],
  },
  {
    id: 'benageber', nombre: 'Embalse de Benagéber', tipo: 'embalse', cuenca: 'Júcar', punto: [39.72, -1.07],
    descripcion: 'Embalse del Turia en la Serranía valenciana.',
    especies: ['barbo_mediterraneo', 'carpa', 'black_bass', 'alburno', 'trucha_arcoiris'],
  },
  {
    id: 'albufera', nombre: "L'Albufera de València", alias: ['Albufera de Valencia', "L'Albufera", 'La Albufera'], tipo: 'laguna', cuenca: 'Júcar', punto: [39.33, -0.35],
    descripcion: 'Laguna litoral rodeada de arrozales, Parque Natural.',
    especies: ['anguila', 'lisa', 'pejerrey', { id: 'samaruc', nota: 'Ullals y marjales del entorno' }, 'barbo_mediterraneo', 'colmilleja', { id: 'fartet', nota: 'Ullals y marjales del entorno' }, { id: 'fraile', nota: 'Extinguido' }, 'carpa', 'carpin', 'gambusia', 'percasol'],
  },

  // ───────────── EBRO ─────────────
  {
    id: 'ebro', nombre: 'Río Ebro', tipo: 'rio', cuenca: 'Ebro',
    descripcion: 'El río más caudaloso de España. Truchero en Cantabria; en Aragón y Cataluña, reino del siluro.',
    especies: [{ id: 'trucha', nota: 'Cabecera' }, 'barbo_graells', 'madrilla', 'bagre', 'bermejuela', { id: 'lamprehuela', nota: 'Afluentes riojanos y navarros' }, 'gobio', 'piscardo', 'lobo_rio', 'fraile', 'colmilleja', { id: 'cacho', nota: 'Solo afluentes del alto Ebro (Baias) y Matarraña' }, { id: 'espinoso', nota: 'Delta (Ullals de l\'Arispe)' }, { id: 'samaruc', nota: 'Delta (reintroducciones)' }, 'anguila', { id: 'lamprea_marina', nota: 'Capturas esporádicas' }, { id: 'saboga', nota: 'Tramo bajo' }, { id: 'lisa', nota: 'Tramo bajo y delta' }, { id: 'fartet', nota: 'Lagunas del delta' }, { id: 'aguja_rio', nota: 'Delta' }, 'carpa', 'carpin', 'siluro', 'lucio', 'lucioperca', 'black_bass', 'percasol', 'alburno', 'rutilo', 'gardi', 'pez_gato_negro', 'pez_gato_punteado', 'blicca', 'perca', { id: 'brema_comun', nota: 'Tramo bajo' }, { id: 'aspio', nota: 'Tramo bajo (introducción reciente)' }, 'pseudorasbora', { id: 'fundulo', nota: 'Delta' }, { id: 'dojo', nota: 'Delta y arrozales' }, 'gambusia'],
  },
  {
    id: 'segre', nombre: 'Río Segre', tipo: 'rio', cuenca: 'Ebro',
    descripcion: 'Nace en la Cerdaña francesa y se une al Ebro en Mequinenza.',
    especies: ['trucha', 'barbo_graells', 'barbo_colirrojo', 'madrilla', 'bagre', 'gobio', 'piscardo', 'lobo_rio', 'fraile', 'carpa', 'siluro', 'black_bass', 'alburno', 'rutilo', 'pez_gato_negro'],
  },
  {
    id: 'cinca', nombre: 'Río Cinca', tipo: 'rio', cuenca: 'Ebro',
    descripcion: 'Río pirenaico oscense que desemboca en el Segre.',
    especies: ['trucha', 'barbo_graells', 'barbo_colirrojo', 'madrilla', 'bagre', 'gobio', 'piscardo', 'lobo_rio', 'carpa', 'siluro', 'black_bass', 'alburno'],
  },
  {
    id: 'gallego', nombre: 'Río Gállego', tipo: 'rio', cuenca: 'Ebro', punto: [41.87, -0.79],
    descripcion: 'Río pirenaico que desemboca en el Ebro en Zaragoza.',
    especies: ['trucha', 'barbo_graells', 'barbo_colirrojo', 'madrilla', 'bagre', 'gobio', 'piscardo', 'lobo_rio', 'carpa', 'alburno'],
  },
  {
    id: 'aragon', nombre: 'Río Aragón', tipo: 'rio', cuenca: 'Ebro',
    descripcion: 'Nace en Canfranc, pasa por Jaca y el embalse de Yesa, y desemboca en el Ebro en Navarra.',
    especies: ['trucha', 'barbo_graells', 'barbo_colirrojo', 'madrilla', 'bagre', 'lamprehuela', 'gobio', 'piscardo', 'lobo_rio', 'carpa', 'black_bass', 'alburno'],
  },
  {
    id: 'jalon', nombre: 'Río Jalón', tipo: 'rio', cuenca: 'Ebro',
    descripcion: 'Afluente por la derecha del Ebro; recibe al Piedra y al Jiloca.',
    especies: ['trucha', 'barbo_graells', 'barbo_colirrojo', 'madrilla', 'bagre', 'bermejuela', 'gobio', 'lobo_rio', 'carpa', 'black_bass', 'alburno'],
  },
  {
    id: 'e_ebro', nombre: 'Embalse del Ebro', alias: ['Pantano del Ebro'], tipo: 'embalse', cuenca: 'Ebro', punto: [43.0, -3.95],
    descripcion: 'Embalse de cabecera entre Cantabria y Burgos.',
    especies: ['trucha', 'barbo_graells', 'madrilla', 'gobio', 'piscardo', 'lobo_rio', 'carpa', 'lucio', 'trucha_arcoiris'],
  },
  {
    id: 'yesa', nombre: 'Embalse de Yesa', tipo: 'embalse', cuenca: 'Ebro', punto: [42.62, -1.2],
    descripcion: 'El "mar del Pirineo", en el río Aragón.',
    especies: ['trucha', 'barbo_graells', 'madrilla', 'bagre', 'carpa', 'black_bass', 'alburno'],
  },
  {
    id: 'mediano', nombre: 'Embalse de Mediano', tipo: 'embalse', cuenca: 'Ebro', punto: [42.33, 0.17],
    descripcion: 'Embalse del Cinca en el Sobrarbe (famoso por la iglesia sumergida).',
    especies: ['barbo_graells', 'madrilla', 'carpa', 'black_bass', 'alburno'],
  },
  {
    id: 'mequinenza', nombre: 'Embalse de Mequinenza', alias: ['Mar de Aragón'], tipo: 'embalse', cuenca: 'Ebro', punto: [41.28, 0.1],
    descripcion: 'El "Mar de Aragón", destino internacional de pesca del siluro y la carpa.',
    especies: ['barbo_graells', 'madrilla', 'carpa', 'carpin', 'siluro', 'lucioperca', 'lucio', 'black_bass', 'percasol', 'alburno', 'rutilo', 'blicca', 'carpa_herbivora'],
  },
  {
    id: 'ribaroja', nombre: 'Embalse de Riba-roja', alias: ['Embalse de Ribarroja', "Embassament de Riba-roja d'Ebre", 'Embalse de Riba-roja de Ebro'], tipo: 'embalse', cuenca: 'Ebro', punto: [41.25, 0.42],
    descripcion: 'Aguas abajo de Mequinenza; siluros de gran tamaño.',
    especies: ['barbo_graells', 'madrilla', 'carpa', 'siluro', 'lucioperca', 'black_bass', 'alburno', 'rutilo', 'blicca', 'pez_gato_punteado'],
  },
  {
    id: 'santmaurici', nombre: 'Estany de Sant Maurici', alias: ['Lago de San Mauricio', 'Estany de Sant Maurici'], tipo: 'lago', cuenca: 'Ebro', punto: [42.582, 1.0],
    descripcion: "Lago de alta montaña en el P. N. d'Aigüestortes. Originalmente sin peces, como la mayoría de lagos pirenaicos.",
    especies: [{ id: 'trucha', nota: 'Introducida en el lago' }, 'salvelino', { id: 'piscardo', nota: 'Introducido como cebo vivo' }],
  },

  // ───────────── INTERNAS DE CATALUÑA ─────────────
  {
    id: 'llobregat', nombre: 'Río Llobregat', tipo: 'rio', cuenca: 'Internas de Cataluña', punto: [41.67, 1.86],
    descripcion: 'Nace en Castellar de n\'Hug y desemboca en el delta junto a Barcelona.',
    especies: ['trucha', 'barbo_graells', 'barbo_colirrojo', 'madrilla', 'bagre', 'anguila', 'lisa', 'carpa', { id: 'siluro', nota: 'Introducción reciente, en expansión' }, 'black_bass', 'percasol', 'alburno', 'gambusia'],
  },
  {
    id: 'ter', nombre: 'Río Ter', tipo: 'rio', cuenca: 'Internas de Cataluña', punto: [41.98, 2.82],
    descripcion: 'Nace en Ulldeter, pasa por Girona y desemboca en L\'Estartit.',
    especies: ['trucha', 'barbo_montana', 'bagre', 'espinoso', 'gobio_languedoc', 'piscardo_languedoc', 'anguila', 'lisa', 'barbo_graells', 'carpa', { id: 'siluro', nota: 'Introducción reciente, en expansión' }, 'black_bass', 'percasol', 'alburno', 'rutilo', 'gardi', 'gambusia'],
  },
  {
    id: 'sau', nombre: 'Embalse de Sau', alias: ['Pantà de Sau', 'Embassament de Sau'], tipo: 'embalse', cuenca: 'Internas de Cataluña', punto: [41.99, 2.38],
    descripcion: 'Embalse del Ter (Osona), con el campanario de Sant Romà emergiendo en sequías.',
    especies: ['carpa', 'carpin', { id: 'siluro', nota: 'Citado desde 2003' }, 'lucioperca', 'black_bass', 'perca', 'alburno', 'rutilo', 'gardi'],
  },
  {
    id: 'banyoles', nombre: 'Estany de Banyoles', alias: ['Lago de Bañolas', 'Estany de Banyoles'], tipo: 'lago', cuenca: 'Internas de Cataluña', punto: [42.125, 2.755],
    descripcion: 'Mayor lago de Cataluña, de origen cárstico. Muy afectado por especies introducidas.',
    especies: ['anguila', { id: 'barbo_montana', nota: 'En las lagunas y canales del entorno, no en el lago' }, 'bagre', { id: 'fraile', nota: 'Casi desaparecido' }, { id: 'colmilleja', nota: 'Probablemente introducida' }, 'carpa', 'black_bass', 'percasol', 'perca', 'rutilo', 'gardi', 'pez_gato_negro', 'gambusia'],
  },
]
