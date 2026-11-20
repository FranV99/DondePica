// Catálogo de especies de peces continentales de España.
//
// origen:
//   "endemica"  -> autóctona y endémica de la península ibérica
//   "nativa"    -> autóctona (no endémica)
//   "exotica"   -> introducida, no incluida en el Catálogo Español de Especies Exóticas Invasoras
//   "invasora"  -> introducida e incluida en el Catálogo Español de Especies Exóticas Invasoras (RD 630/2013)
//
// uicn: categoría global de la Lista Roja de la UICN (orientativa; consulta iucnredlist.org
//       para la evaluación vigente). null = no aplica / sin dato.
// ceea: categoría en el Catálogo Español de Especies Amenazadas / LESRPE (RD 139/2011).
// notaEEI: matices sobre el catálogo de invasoras.

export const ORIGENES = {
  endemica: { label: 'Endémica ibérica', color: '#1b7f5a' },
  nativa: { label: 'Autóctona', color: '#3a8fd1' },
  exotica: { label: 'Exótica', color: '#c98a1a' },
  invasora: { label: 'Exótica invasora', color: '#c8432f' },
}

export const UICN = {
  CR: { label: 'En peligro crítico', color: '#b3261e' },
  EN: { label: 'En peligro', color: '#d9622b' },
  VU: { label: 'Vulnerable', color: '#d9a21b' },
  NT: { label: 'Casi amenazada', color: '#8aa83a' },
  LC: { label: 'Preocupación menor', color: '#4f9a6b' },
  DD: { label: 'Datos insuficientes', color: '#888' },
}

const EXC_2018 =
  'Incluida en el catálogo, con la excepción de la Ley 7/2018 para las zonas donde se introdujo antes de 2007.'

export const ESPECIES = [
  // --- Migradoras / estuarinas ---
  { id: 'anguila', comun: 'Anguila', cientifico: 'Anguilla anguilla', familia: 'Anguillidae', origen: 'nativa', uicn: 'CR', nota: 'Migradora (se reproduce en el mar de los Sargazos). Su pesca está prohibida o muy restringida en casi todas las comunidades.' },
  { id: 'salmon', comun: 'Salmón atlántico', cientifico: 'Salmo salar', familia: 'Salmonidae', origen: 'nativa', uicn: 'NT', nota: 'Anádromo. En España solo remonta ríos cantábricos y gallegos.' },
  {
    id: 'trucha',
    comun: 'Trucha común',
    cientifico: 'Salmo trutta',
    familia: 'Salmonidae',
    origen: 'nativa',
    uicn: 'LC',
    nota: 'Tramos altos y aguas frías y oxigenadas. Incluye la forma migradora (reo) en el Cantábrico y Galicia.',
    variedades: [
      { nombre: 'Trucha de río', descripcion: 'Forma que pasa toda su vida en el río; puntos rojos y negros sobre fondo dorado o pardo.' },
      { nombre: 'Reo o trucha de mar', descripcion: 'Forma migradora de los ríos cantábricos y gallegos: baja al mar a engordar y vuelve plateada a frezar.' },
      { nombre: 'Trucha de lago o embalse', descripcion: 'Ejemplares de lagos y grandes embalses, más plateados y de mayor tamaño.' },
    ],
  },
  { id: 'lamprea_marina', comun: 'Lamprea marina', cientifico: 'Petromyzon marinus', familia: 'Petromyzontidae', origen: 'nativa', uicn: 'LC', ceea: 'En peligro de extinción (poblaciones del Guadiana, Guadalquivir, Ebro y cuencas del Sur)' },
  { id: 'sabalo', comun: 'Sábalo', cientifico: 'Alosa alosa', familia: 'Alosidae', origen: 'nativa', uicn: 'LC', nota: 'Anádromo; tramos bajos.' },
  { id: 'saboga', comun: 'Saboga', cientifico: 'Alosa fallax', familia: 'Alosidae', origen: 'nativa', uicn: 'LC', nota: 'Anádromo; tramos bajos y estuarios.' },
  { id: 'lisa', comun: 'Lisa / Mújol', cientifico: 'Chelon ramada', familia: 'Mugilidae', origen: 'nativa', uicn: 'LC', nota: 'Entra desde el mar en tramos bajos, estuarios y lagunas costeras.' },
  { id: 'platija', comun: 'Platija', cientifico: 'Platichthys flesus', familia: 'Pleuronectidae', origen: 'nativa', uicn: 'LC', nota: 'Estuarios y tramos bajos del norte.' },
  { id: 'pejerrey', comun: 'Pejerrey', cientifico: 'Atherina boyeri', familia: 'Atherinidae', origen: 'nativa', uicn: 'LC', nota: 'Lagunas costeras y estuarios.' },
  { id: 'espinoso', comun: 'Espinoso', cientifico: 'Gasterosteus aculeatus', familia: 'Gasterosteidae', origen: 'nativa', uicn: 'LC', nota: 'Muy localizado y en regresión en España.' },
  { id: 'fraile', comun: 'Fraile / Blenio de río', cientifico: 'Salaria fluviatilis', familia: 'Blenniidae', origen: 'nativa', uicn: 'LC', ceea: 'Vulnerable' },
  { id: 'burtaina', comun: 'Burtaina', cientifico: 'Cottus aturi', familia: 'Cottidae', origen: 'nativa', uicn: null, ceea: 'En peligro de extinción', nota: 'En España solo en la cuenca del Bidasoa.' },
  { id: 'burtaina_garona', alias: 'Cavilat', comun: 'Burtaina del Garona / Cabot', cientifico: 'Cottus hispaniolensis', familia: 'Cottidae', origen: 'nativa', uicn: 'NT', nota: 'En España solo en la cuenca del Garona (Val d\'Aran). Vive entre las piedras de aguas frías y bien oxigenadas.' },

  // --- Ciprinodontiformes autóctonos ---
  { id: 'samaruc', comun: 'Samaruc', cientifico: 'Valencia hispanica', familia: 'Valenciidae', origen: 'endemica', uicn: 'CR', ceea: 'En peligro de extinción', nota: 'Humedales costeros valencianos y catalanes (ullals, marjales).' },
  { id: 'fartet', comun: 'Fartet', cientifico: 'Aphanius iberus', familia: 'Aphaniidae', origen: 'endemica', uicn: 'EN', ceea: 'En peligro de extinción', nota: 'Lagunas y saladares costeros mediterráneos.' },
  { id: 'salinete', alias: 'Fartet atlántico', comun: 'Salinete', cientifico: 'Aphanius baeticus', familia: 'Aphaniidae', origen: 'endemica', uicn: 'EN', ceea: 'En peligro de extinción', nota: 'Arroyos salinos y marismas del bajo Guadalquivir y costa atlántica andaluza.' },

  // --- Ciprínidos endémicos ---
  { id: 'jarabugo', comun: 'Jarabugo', cientifico: 'Anaecypris hispanica', familia: 'Leuciscidae', origen: 'endemica', uicn: 'EN', ceea: 'En peligro de extinción', nota: 'Pequeños afluentes del Guadiana (no en el propio río) y río Bembézar (Guadalquivir). Ha desaparecido de casi la mitad de sus poblaciones en los últimos años.' },
  { id: 'barbo_comun', comun: 'Barbo común', cientifico: 'Luciobarbus bocagei', familia: 'Cyprinidae', origen: 'endemica', uicn: 'LC' },
  { id: 'barbo_comizo', comun: 'Barbo comizo', cientifico: 'Luciobarbus comizo', familia: 'Cyprinidae', origen: 'endemica', uicn: 'VU', nota: 'El mayor barbo ibérico; propio de grandes ríos y embalses de Tajo y Guadiana.' },
  { id: 'barbo_cabecicorto', comun: 'Barbo cabecicorto', cientifico: 'Luciobarbus microcephalus', familia: 'Cyprinidae', origen: 'endemica', uicn: 'VU' },
  { id: 'barbo_gitano', comun: 'Barbo gitano', cientifico: 'Luciobarbus sclateri', familia: 'Cyprinidae', origen: 'endemica', uicn: 'LC' },
  { id: 'barbo_mediterraneo', comun: 'Barbo mediterráneo', cientifico: 'Luciobarbus guiraonis', familia: 'Cyprinidae', origen: 'endemica', uicn: 'VU' },
  { id: 'barbo_graells', comun: 'Barbo de Graells', cientifico: 'Luciobarbus graellsii', familia: 'Cyprinidae', origen: 'endemica', uicn: 'LC', nota: 'Barbo propio del Ebro.' },
  { id: 'barbo_colirrojo', comun: 'Barbo colirrojo', cientifico: 'Barbus haasi', familia: 'Cyprinidae', origen: 'endemica', uicn: 'VU' },
  { id: 'barbo_montana', comun: 'Barbo de montaña', cientifico: 'Barbus meridionalis', familia: 'Cyprinidae', origen: 'nativa', uicn: 'NT', nota: 'En España solo en ríos del nordeste de Cataluña.' },
  { id: 'madrilla', comun: 'Madrilla', cientifico: 'Parachondrostoma miegii', familia: 'Leuciscidae', origen: 'endemica', uicn: 'LC' },
  { id: 'loina', comun: 'Loína', cientifico: 'Parachondrostoma arrigonis', familia: 'Leuciscidae', origen: 'endemica', uicn: 'CR', ceea: 'En peligro de extinción' },
  { id: 'madrija', comun: 'Madrija', cientifico: 'Parachondrostoma turiense', familia: 'Leuciscidae', origen: 'endemica', uicn: 'EN' },
  { id: 'boga_duero', comun: 'Boga del Duero', cientifico: 'Pseudochondrostoma duriense', familia: 'Leuciscidae', origen: 'endemica', uicn: 'VU' },
  { id: 'boga_tajo', comun: 'Boga de río', cientifico: 'Pseudochondrostoma polylepis', familia: 'Leuciscidae', origen: 'endemica', uicn: 'LC' },
  { id: 'boga_guadiana', comun: 'Boga del Guadiana', cientifico: 'Pseudochondrostoma willkommii', familia: 'Leuciscidae', origen: 'endemica', uicn: 'VU' },
  { id: 'bermejuela', comun: 'Bermejuela', cientifico: 'Achondrostoma arcasii', nota: 'En 2023 las bermejuelas del Duero y del Alagón se separaron en especies propias (bermejuela numantina, del Esla y salmantina).', familia: 'Leuciscidae', origen: 'endemica', uicn: 'VU', ceea: 'Listado de Especies en Régimen de Protección Especial' },
  { id: 'sarda', comun: 'Sarda', cientifico: 'Achondrostoma salmantinum', familia: 'Leuciscidae', origen: 'endemica', uicn: 'EN', ceea: 'En peligro de extinción' },
  { id: 'pardilla', comun: 'Pardilla', cientifico: 'Iberochondrostoma lemmingii', familia: 'Leuciscidae', origen: 'endemica', uicn: 'EN' },
  { id: 'pardilla_oretana', comun: 'Pardilla oretana', cientifico: 'Iberochondrostoma oretanum', familia: 'Leuciscidae', origen: 'endemica', uicn: 'CR', nota: 'Solo en el río Robledillo, afluente del Jándula (Guadalquivir).' },
  { id: 'calandino', alias: 'Iberocypris alburnoides', comun: 'Calandino', cientifico: 'Squalius alburnoides', familia: 'Leuciscidae', origen: 'endemica', uicn: 'VU', nota: 'Complejo híbrido de origen poliploide.' },
  { id: 'cacho', comun: 'Cacho', cientifico: 'Squalius pyrenaicus', familia: 'Leuciscidae', origen: 'endemica', uicn: 'NT' },
  { id: 'bordallo', comun: 'Bordallo', cientifico: 'Squalius carolitertii', familia: 'Leuciscidae', origen: 'endemica', uicn: 'LC' },
  { id: 'bagre', comun: 'Bagre', cientifico: 'Squalius laietanus', familia: 'Leuciscidae', origen: 'nativa', uicn: 'NT' },
  { id: 'cacho_malagueno', comun: 'Cacho malagueño', cientifico: 'Squalius malacitanus', familia: 'Leuciscidae', origen: 'endemica', uicn: 'EN', nota: 'Ríos de Málaga y Cádiz: Guadiaro (con el Genal y el Hozgarganta), Guadaiza, Guadalmina, Piquero, Guadalmesí, Vaquero, Miel, Guadalete y los ríos de Tarifa (Jara, Vega y Valle).' },
  { id: 'cacho_valenciano', alias: 'Cacho levantino', comun: 'Cacho valenciano', cientifico: 'Squalius valentinus', familia: 'Leuciscidae', origen: 'endemica', uicn: 'EN' },
  { id: 'bogardilla', alias: 'Iberocypris palaciosi', comun: 'Bogardilla', cientifico: 'Squalius palaciosi', familia: 'Leuciscidae', origen: 'endemica', uicn: 'CR', ceea: 'En peligro de extinción' },
  { id: 'gobio', comun: 'Gobio', cientifico: 'Gobio lozanoi', familia: 'Gobionidae', origen: 'nativa', uicn: 'LC', nota: 'Autóctono del Ebro y Bidasoa; translocado al resto de cuencas.' },
  { id: 'piscardo', comun: 'Piscardo / Chipa', cientifico: 'Phoxinus bigerri', familia: 'Leuciscidae', origen: 'nativa', uicn: 'LC', nota: 'Autóctono del Ebro y cuencas cantábricas orientales; introducido como cebo vivo en otras cuencas y lagos de montaña.' },
  { id: 'lobo_rio', comun: 'Lobo de río', cientifico: 'Barbatula hispanica', alias: 'Barbatula quignardi', nota: 'Citado antes como Barbatula quignardi o B. barbatula.', familia: 'Nemacheilidae', origen: 'nativa', uicn: 'LC' },
  { id: 'colmilleja', comun: 'Colmilleja', cientifico: 'Cobitis paludica', familia: 'Cobitidae', origen: 'endemica', uicn: 'VU' },
  { id: 'lamprehuela', comun: 'Lamprehuela', cientifico: 'Cobitis calderoni', familia: 'Cobitidae', origen: 'endemica', uicn: 'EN' },
  { id: 'colmilleja_alagon', comun: 'Colmilleja del Alagón', cientifico: 'Cobitis vettonica', familia: 'Cobitidae', origen: 'endemica', uicn: 'EN' },
  { id: 'tenca', comun: 'Tenca', cientifico: 'Tinca tinca', familia: 'Tincidae', origen: 'nativa', uicn: 'LC', nota: 'Estatus discutido: autóctona para unos autores, introducción muy antigua para otros.' },

  // --- Exóticas ---
  {
    id: 'carpa',
    comun: 'Carpa',
    cientifico: 'Cyprinus carpio',
    familia: 'Cyprinidae',
    origen: 'invasora',
    uicn: null,
    notaEEI: EXC_2018,
    nota: 'Todas las variedades (común, espejo, royal, cuero, koi) son la misma especie: solo cambia la cantidad y la disposición de las escamas o el color, fruto de la cría en piscifactorías.',
    variedades: [
      { id: 'comun', nombre: 'Carpa común o escamosa', descripcion: 'Cuerpo cubierto por completo de escamas regulares. Es la forma silvestre y la más abundante.' },
      { id: 'espejo', nombre: 'Carpa espejo', descripcion: 'Pocas escamas, grandes y brillantes, repartidas de forma irregular sobre la piel desnuda.' },
      { id: 'royal', nombre: 'Carpa royal (espejo lineal)', descripcion: 'Variante de la carpa espejo con una hilera ordenada de escamas grandes a lo largo de la línea lateral; muy apreciada en carpfishing.' },
      { id: 'cuero', nombre: 'Carpa cuero', descripcion: 'Casi sin escamas (como mucho alguna junto a la aleta dorsal): piel lisa de aspecto de cuero.' },
      { id: 'koi', nombre: 'Carpa koi', descripcion: 'Variedad ornamental de colores (rojo, blanco, naranja, negro). Aparece en estanques y, por sueltas, en algunas masas de agua.' },
    ],
  },
  { id: 'carpin', alias: 'Carpa prusiana', comun: 'Carpín / Carpín prusiano', cientifico: 'Carassius gibelio', familia: 'Cyprinidae', origen: 'exotica', uicn: null, nota: 'Muy parecido a la carpa, pero sin barbillas. Abundante en aguas lentas, embalses y charcas.' },
  {
    id: 'carpa_dorada', alias: 'Pez rojo',
    comun: 'Carpa dorada / Carpín dorado',
    cientifico: 'Carassius auratus',
    familia: 'Cyprinidae',
    origen: 'exotica',
    uicn: null,
    nota: 'El "pez rojo" de acuario. Las sueltas en estanques, charcas y embalses han creado poblaciones asilvestradas que, con las generaciones, vuelven al color pardo verdoso.',
    variedades: [
      { nombre: 'Asilvestrada (parda o verdosa)', descripcion: 'Color natural de la especie; es la forma que domina en el medio natural.' },
      { nombre: 'Roja o dorada (pez rojo)', descripcion: 'Forma ornamental, liberada en estanques y charcas.' },
    ],
  },
  { id: 'carpa_herbivora', comun: 'Carpa herbívora / Amur', cientifico: 'Ctenopharyngodon idella', familia: 'Xenocyprididae', origen: 'exotica', uicn: null, nota: 'Introducida para controlar la vegetación acuática en embalses, canales y balsas. En España apenas se reproduce: sus poblaciones dependen de las sueltas.' },
  { id: 'brema_comun', comun: 'Brema común', cientifico: 'Abramis brama', familia: 'Leuciscidae', origen: 'exotica', uicn: null, nota: 'Ciprínido de cuerpo alto y comprimido, introducido en el bajo Ebro y en algunos ríos catalanes.' },
  { id: 'aspio', comun: 'Aspio', cientifico: 'Leuciscus aspius', familia: 'Leuciscidae', origen: 'exotica', uicn: null, nota: 'Ciprínido depredador de aguas abiertas, de introducción reciente en el bajo Ebro.' },
  { id: 'pseudorasbora', comun: 'Pseudorasbora / Gobio de boca súpera', cientifico: 'Pseudorasbora parva', familia: 'Gobionidae', origen: 'invasora', uicn: null, nota: 'Pequeño pez asiático que llega mezclado con sueltas de otras especies. Transmite un parásito muy dañino para los ciprínidos autóctonos.' },
  { id: 'black_bass', comun: 'Black-bass / Perca americana', cientifico: 'Micropterus salmoides', familia: 'Centrarchidae', origen: 'invasora', uicn: null, notaEEI: EXC_2018 },
  { id: 'percasol', comun: 'Pez sol / Percasol', cientifico: 'Lepomis gibbosus', familia: 'Centrarchidae', origen: 'invasora', uicn: null },
  { id: 'lucio', comun: 'Lucio', cientifico: 'Esox lucius', familia: 'Esocidae', origen: 'invasora', uicn: null, notaEEI: EXC_2018 },
  { id: 'lucioperca', comun: 'Lucioperca', cientifico: 'Sander lucioperca', familia: 'Percidae', origen: 'invasora', uicn: null },
  { id: 'perca', comun: 'Perca de río', cientifico: 'Perca fluviatilis', familia: 'Percidae', origen: 'invasora', uicn: null },
  { id: 'siluro', comun: 'Siluro', cientifico: 'Silurus glanis', familia: 'Siluridae', origen: 'invasora', uicn: null },
  { id: 'alburno', comun: 'Alburno', cientifico: 'Alburnus alburnus', familia: 'Leuciscidae', origen: 'invasora', uicn: null },
  { id: 'rutilo', comun: 'Rutilo', cientifico: 'Rutilus rutilus', familia: 'Leuciscidae', origen: 'invasora', uicn: null },
  { id: 'gardi', comun: 'Gardí', cientifico: 'Scardinius erythrophthalmus', familia: 'Leuciscidae', origen: 'invasora', uicn: null },
  { id: 'blicca', comun: 'Brema blanca', cientifico: 'Blicca bjoerkna', familia: 'Leuciscidae', origen: 'exotica', uicn: null },
  { id: 'pez_gato_negro', comun: 'Pez gato negro', cientifico: 'Ameiurus melas', familia: 'Ictaluridae', origen: 'invasora', uicn: null },
  { id: 'pez_gato_punteado', comun: 'Pez gato punteado', cientifico: 'Ictalurus punctatus', familia: 'Ictaluridae', origen: 'invasora', uicn: null },
  { id: 'gambusia', comun: 'Gambusia', cientifico: 'Gambusia holbrooki', familia: 'Poeciliidae', origen: 'invasora', uicn: null },
  { id: 'trucha_arcoiris', comun: 'Trucha arcoíris', cientifico: 'Oncorhynchus mykiss', familia: 'Salmonidae', origen: 'invasora', uicn: null, notaEEI: EXC_2018 + ' Se repuebla en cotos intensivos.' },
  { id: 'hucho', comun: 'Huchón / Salmón del Danubio', cientifico: 'Hucho hucho', familia: 'Salmonidae', origen: 'exotica', uicn: null, nota: 'Gran salmónido del Danubio introducido en 1968. En España solo se aclimató en el río Tormes (Salamanca): vive entre la presa de Santa Teresa y Huerta, incluido el coto de Villagonzalo, y en el embalse de La Almendra. Se mantiene con repoblaciones. En peligro en su área de origen.' },
  { id: 'salvelino', comun: 'Salvelino', cientifico: 'Salvelinus fontinalis', familia: 'Salmonidae', origen: 'invasora', uicn: null },
  { id: 'chanchito', comun: 'Chanchito', cientifico: 'Australoheros facetus', familia: 'Cichlidae', origen: 'invasora', uicn: null },
  { id: 'fundulo', comun: 'Fúndulo', cientifico: 'Fundulus heteroclitus', familia: 'Fundulidae', origen: 'invasora', uicn: null },
  { id: 'dojo', comun: 'Dojo', cientifico: 'Misgurnus anguillicaudatus', familia: 'Cobitidae', origen: 'invasora', uicn: null },
  // --- Añadidas a partir de la lista de la Enciclopedia Virtual de los Vertebrados Españoles (MNCN) ---
  { id: 'lamprea_arroyo', comun: 'Lamprea de arroyo', cientifico: 'Lampetra planeri', familia: 'Petromyzontidae', origen: 'nativa', uicn: 'LC', nota: 'Lamprea pequeña que no migra al mar: pasa toda su vida en arroyos de aguas limpias. En España solo se conoce en el río Olabidea (Navarra) y en la cuenca del Deva (Asturias).' },
  { id: 'gobio_languedoc', comun: 'Gobio del Languedoc', cientifico: 'Gobio occitaniae', familia: 'Gobionidae', origen: 'nativa', uicn: 'LC', nota: 'Autóctono de los ríos del nordeste de Cataluña (Muga, Fluvià, Ter), compartidos con el sur de Francia.' },
  { id: 'piscardo_languedoc', comun: 'Piscardo del Languedoc', cientifico: 'Phoxinus septimaniae', familia: 'Leuciscidae', origen: 'nativa', uicn: 'LC', nota: 'Piscardo de los ríos mediterráneos del nordeste de Cataluña y el sur de Francia.' },
  { id: 'piscardo_garona', comun: 'Piscardo del Garona', cientifico: 'Phoxinus dragarum', familia: 'Leuciscidae', origen: 'nativa', uicn: null, nota: 'En España solo en la cuenca del Garona (Val d\'Aran).' },
  { id: 'bermejuela_numantina', comun: 'Bermejuela numantina', cientifico: 'Achondrostoma numantinum', familia: 'Leuciscidae', origen: 'endemica', uicn: null, nota: 'Descrita en 2023. Bermejuela de la cuenca del Duero, salvo el Esla y el Corneja.' },
  { id: 'bermejuela_esla', comun: 'Bermejuela del Esla', cientifico: 'Achondrostoma asturicense', familia: 'Leuciscidae', origen: 'endemica', uicn: null, nota: 'Descrita en 2023. Solo en la subcuenca del Esla (Duero).' },
  { id: 'bermejuela_salmantina', comun: 'Bermejuela salmantina', cientifico: 'Achondrostoma garzonorum', familia: 'Leuciscidae', origen: 'endemica', uicn: null, nota: 'Descrita en 2023. Solo en los ríos Alagón y Cuerpo de Hombre (Tajo) y Corneja (Duero).' },
  { id: 'bordallo_gallo', comun: 'Bordallo del Gallo', cientifico: 'Squalius castellanus', familia: 'Leuciscidae', origen: 'endemica', uicn: 'CR', nota: 'Solo en el río Gallo y sus afluentes (cuenca del Tajo, Guadalajara). En peligro crítico.' },
  { id: 'colmilleja_valle', comun: 'Colmilleja del Valle', cientifico: 'Cobitis mellaria', familia: 'Cobitidae', origen: 'endemica', uicn: null, nota: 'Descrita en 2023. Solo vive en el río del Valle (Tarifa, Cádiz), en menos de 5 km²; sus autores proponen catalogarla En peligro crítico. En los ríos vecinos solo hay colmilleja común.' },
  { id: 'colmilleja_atlantica', comun: 'Colmilleja atlántica', cientifico: 'Cobitis atlantica', familia: 'Cobitidae', origen: 'endemica', uicn: null, nota: 'Descrita en 2023. Ríos atlánticos del norte de Portugal; en España, en el río Tea (cuenca del Miño, Pontevedra) y en el Limia (Lobios, Ourense).' },
  { id: 'aguja_rio', comun: 'Aguja de río', cientifico: 'Syngnathus abaster', familia: 'Syngnathidae', origen: 'nativa', uicn: 'LC', nota: 'Pariente de los caballitos de mar. Vive entre la vegetación de lagunas costeras, deltas y desembocaduras mediterráneas.' },
]

// Nombre en castellano de cada familia y algunos ejemplos (para el filtro por familia)
export const FAMILIAS = {
  Leuciscidae: { nombre: 'Leucíscidos', ejemplos: 'bogas, cachos, bermejuelas, alburno, rutilo' },
  Cyprinidae: { nombre: 'Ciprínidos', ejemplos: 'barbos, carpa, carpín' },
  Cobitidae: { nombre: 'Cobítidos', ejemplos: 'colmillejas, lamprehuela, dojo' },
  Salmonidae: { nombre: 'Salmónidos', ejemplos: 'truchas, salmón, salvelino, huchón' },
  Gobionidae: { nombre: 'Gobiónidos', ejemplos: 'gobios, pseudorasbora' },
  Petromyzontidae: { nombre: 'Lampreas', ejemplos: 'lamprea marina, lamprea de arroyo' },
  Alosidae: { nombre: 'Alósidos', ejemplos: 'sábalo, saboga' },
  Cottidae: { nombre: 'Cótidos', ejemplos: 'burtainas' },
  Aphaniidae: { nombre: 'Afánidos', ejemplos: 'fartet, salinete' },
  Centrarchidae: { nombre: 'Centrárquidos', ejemplos: 'black-bass, pez sol' },
  Percidae: { nombre: 'Pércidos', ejemplos: 'perca, lucioperca' },
  Ictaluridae: { nombre: 'Peces gato', ejemplos: 'pez gato negro y punteado' },
  Anguillidae: { nombre: 'Anguílidos', ejemplos: 'anguila' },
  Mugilidae: { nombre: 'Mugílidos', ejemplos: 'lisa o mújol' },
  Pleuronectidae: { nombre: 'Pleuronéctidos', ejemplos: 'platija' },
  Atherinidae: { nombre: 'Aterínidos', ejemplos: 'pejerrey' },
  Gasterosteidae: { nombre: 'Gasterosteidos', ejemplos: 'espinoso' },
  Blenniidae: { nombre: 'Blénidos', ejemplos: 'fraile' },
  Valenciidae: { nombre: 'Valencíidos', ejemplos: 'samaruc' },
  Nemacheilidae: { nombre: 'Nemaqueílidos', ejemplos: 'lobo de río' },
  Tincidae: { nombre: 'Tíncidos', ejemplos: 'tenca' },
  Xenocyprididae: { nombre: 'Xenociprídidos', ejemplos: 'carpa herbívora' },
  Esocidae: { nombre: 'Esócidos', ejemplos: 'lucio' },
  Siluridae: { nombre: 'Silúridos', ejemplos: 'siluro' },
  Poeciliidae: { nombre: 'Poecílidos', ejemplos: 'gambusia' },
  Cichlidae: { nombre: 'Cíclidos', ejemplos: 'chanchito' },
  Fundulidae: { nombre: 'Fundúlidos', ejemplos: 'fúndulo' },
  Syngnathidae: { nombre: 'Singnátidos', ejemplos: 'aguja de río' },
}

export const ESPECIES_POR_ID = Object.fromEntries(ESPECIES.map((e) => [e.id, e]))

/** Texto en el que se busca una especie: nombre común, científico, otros nombres y nombres de sus variedades */
export const textoEspecie = (e) => `${e.comun} ${e.cientifico} ${e.alias || ''} ${(e.variedades || []).map((v) => v.nombre).join(' ')}`
