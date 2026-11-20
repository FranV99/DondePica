// Normativa de pesca continental por comunidad autónoma (temporada 2026).
//
// Resumen orientativo elaborado a partir de las órdenes y resoluciones oficiales de cada
// comunidad (enlazadas en `norma`). Las normas cambian cada año y cada tramo (coto, zona sin
// muerte, refugio…) puede tener condiciones propias: antes de pescar hay que consultar siempre
// la norma vigente y la señalización del tramo.
//
// Estructura de cada comunidad:
//   norma:     [{ titulo, url }]                     disposiciones de referencia
//   generales: [texto]                               reglas comunes (cañas, horario, cebos prohibidos…)
//   zonas:     { salmonidos: [{ tipo, reglas }], ciprinidos: [...] }   qué se permite en cada tipo de tramo
//   especies:  { idEspecie: regla }                  reglas por especie
//   porDefecto:{ autoctona: regla, exotica: regla }  si la especie no aparece en `especies`
//
// regla = { estado, resumen, periodo?, talla?, cupo?, notas?: [texto], zonas?: 'salmonidos' | 'ciprinidos' }
// estado: 'extractiva' (se puede retener), 'mixta' (según tramo), 'sin_muerte' (devolver siempre),
//         'zonas' (solo en zonas autorizadas), 'sacrificio' (no puede devolverse), 'prohibida',
//         'sin_dato' (la norma consultada no la detalla)

export const ESTADOS = {
  extractiva: { label: 'Se puede retener', color: '#2e7d4f' },
  mixta: { label: 'Con o sin muerte según tramo', color: '#3a7bbf' },
  sin_muerte: { label: 'Solo captura y suelta', color: '#2a8a9a' },
  zonas: { label: 'Solo en zonas autorizadas', color: '#b07a12' },
  sacrificio: { label: 'Sacrificio obligatorio', color: '#c8432f' },
  prohibida: { label: 'Pesca prohibida', color: '#8b1e1e' },
  sin_dato: { label: 'Sin datos en la norma', color: '#777' },
}

// Reglas que se repiten
const PROHIBIDA = { estado: 'prohibida', resumen: 'No es especie pescable. Si se captura por accidente, devolverla al agua de inmediato.' }
const NO_LISTADA = {
  estado: 'sin_dato',
  resumen: 'La norma consultada no la incluye entre las especies pescables. Si se captura, devolverla al agua con cuidado.',
}
const EXOTICA_SACRIFICIO = {
  estado: 'sacrificio',
  resumen: 'Especie exótica invasora: no puede devolverse al agua ni transportarse viva. Hay que sacrificarla en el lugar de captura.',
}

const CEBOS_PEZ = 'Prohibido usar peces vivos o muertos (o sus partes) como cebo, y cualquier especie exótica invasora.'

export const NORMATIVA = {
  // ─────────────────────────────── Cataluña ───────────────────────────────
  CT: {
    norma: [
      { titulo: 'Resolució ARP/902/2026, de 25 de març (DOGC núm. 9635, 30/03/2026)', url: 'https://cido.diba.cat/legislacio/21330923/resolucio-arp9022026-de-25-de-marc-per-la-qual-sordena-la-pesca-a-les-aigues-continentals-de-catalunya-durant-la-temporada-2026-departament-dagricultura-ramaderia-pesca-i-alimentacio' },
      { titulo: "Val d'Aran: Resolución 044/2026 del Conselh Generau d'Aran (BOP de Lleida núm. 52, 17/03/2026)", url: 'https://www.conselharan.org/wp-content/uploads/2026/03/EDICTE-DE-PESCA.pdf' },
    ],
    generales: [
      'Horario: de una hora antes de la salida del sol a una hora después de la puesta. Pesca nocturna solo en competiciones (excepto en la zona EB-01, embalses de Riba-roja y Flix, abierta las 24 h).',
      'Solo se permite la caña: hasta dos cañas separadas menos de 10 m; en aguas de salmónidos, una sola caña (salvo en embalses).',
      'Salabre obligatorio en aguas de salmónidos y en zonas de pesca controlada intensivas.',
      'Plomo prohibido en toda Cataluña. Prohibidas las suelas de fieltro; hay que limpiar, desinfectar y secar el material.',
      'Cebos prohibidos en todas las aguas: peces vivos o muertos, crustáceos, moluscos y sus restos, insectos que no sean de la fauna local, huevas y caracol manzana.',
      'Con cebo natural, máximo dos anzuelos por línea. Cebado (engodo) prohibido, salvo competidores federados en zonas de ciprínidos.',
      'Las aguas de salmónidos incluyen los Pirineos y sus estanys (excepto el de Montcortès).',
    ],
    zonas: {
      salmonidos: [
        {
          tipo: 'Zonas de pesca controlada con muerte (baja y alta montaña)',
          reglas: [
            'Anzuelo simple sin arponcillo o con el arponcillo completamente aplastado.',
            'Cebos artificiales: cucharillas, ninfas, moscas e imitaciones de peces.',
            'Cebos naturales solo de la dieta de la trucha: lombriz de tierra, moscas adultas y larvas de insectos acuáticos.',
            'Prohibidos en aguas de salmónidos: larva de cera (Galleria), asticot y masillas.',
            'Plomo de arrastre solo en embalses.',
          ],
        },
        {
          tipo: 'Zonas sin muerte (controladas y libres)',
          reglas: ['Solo cebos artificiales (mosca, ninfa, cucharilla, imitaciones).', 'Anzuelo simple sin arponcillo o con arponcillo aplastado.', 'Devolución inmediata de todas las capturas.'],
        },
        { tipo: 'Zonas de pesca controlada intensivas', reglas: ['Además del anzuelo simple, se permiten triples sin arponcillo o con los arpones aplastados.'] },
        {
          tipo: "Val d'Aran (plan propio)",
          reglas: [
            'Alta montaña: con muerte del 1 de mayo al 31 de agosto, sin muerte hasta el 30 de septiembre; lagos del 1 de junio al 30 de septiembre.',
            'Zonas sin muerte: cola de rata, pesca al hilo o con boya, máximo 2 moscas por línea sin arponcillo (o aplastado), o cucharilla de un solo anzuelo sin arponcillo.',
            'Resto de tramos: señuelos artificiales con arponcillo permitido y cebo natural (lombriz, gusano de cera, larvas, saltamontes, moscas adultas) con un anzuelo del n.º 1 al 10.',
            'Sin talla mínima; talla máxima de 22 cm en ríos (30 cm en el Garona, la Bassa d’Oles y la presa d’Aiguamòg). Cupo de 6 a 12 truchas según el tramo.',
          ],
        },
      ],
      ciprinidos: [
        {
          tipo: 'Aguas de ciprínidos',
          reglas: [
            'Con cebo natural: anzuelo simple sin arponcillo o aplastado.',
            'Con señuelo artificial: anzuelos simples o triples sin arponcillo.',
            'Curricán solo en embalses de ciprínidos y en la zona EB-01 (máximo dos cañas por embarcación).',
          ],
        },
        {
          tipo: 'Zonas de carpa, black bass, siluro y lucioperca (anexo VI)',
          reglas: ['Anzuelos con o sin arponcillo: simples con cebo natural; simples o triples con señuelo artificial.', 'Los ejemplares capturados se sacrifican.'],
        },
      ],
    },
    especies: {
      trucha: {
        estado: 'mixta',
        resumen: 'Con muerte solo en zonas de pesca controlada con muerte; en el resto de aguas, sin muerte.',
        periodo: 'Baja montaña: con muerte del 21/03 al 30/08 y sin muerte del 21/03 al 12/10. Alta montaña: con muerte del 09/05 al 30/08 y sin muerte del 09/05 al 12/10.',
        talla: '22 cm (los planes de cada zona pueden fijar una talla máxima)',
        cupo: '3 por pescador y día (2 en reservas genéticas de trucha)',
        zonas: 'salmonidos',
      },
      bagre: { estado: 'sin_muerte', resumen: 'Pescable solo en modalidad sin muerte: devolución inmediata.', zonas: 'ciprinidos' },
      barbo_graells: { estado: 'sin_muerte', resumen: 'Pescable solo en modalidad sin muerte: devolución inmediata.', zonas: 'ciprinidos' },
      cacho: { estado: 'sin_muerte', resumen: 'La bagra (Squalius) es pescable solo sin muerte.', zonas: 'ciprinidos' },
      anguila: { estado: 'prohibida', resumen: 'Pesca recreativa prohibida; solo con licencia profesional.' },
      barbo_montana: PROHIBIDA,
      barbo_colirrojo: PROHIBIDA,
      carpa: { estado: 'zonas', resumen: 'Solo dentro de las áreas del anexo VI. Sacrificio inmediato obligatorio, sea cual sea su tamaño.', zonas: 'ciprinidos' },
      black_bass: { estado: 'zonas', resumen: 'Solo dentro de las áreas del anexo VI. Sacrificio inmediato obligatorio.', zonas: 'ciprinidos' },
      siluro: { estado: 'zonas', resumen: 'Solo dentro de las áreas del anexo VI. Sacrificio inmediato obligatorio.', zonas: 'ciprinidos' },
      lucioperca: { estado: 'zonas', resumen: 'Solo dentro de las áreas del anexo VI. Sacrificio inmediato obligatorio.', zonas: 'ciprinidos' },
      trucha_arcoiris: { estado: 'zonas', resumen: 'Solo dentro de las áreas del anexo VI. Sacrificio obligatorio; prohibido soltarla en cualquier masa de agua.', zonas: 'salmonidos' },
      salvelino: { estado: 'zonas', resumen: 'Solo dentro de las áreas del anexo VI. Sacrificio obligatorio.', zonas: 'salmonidos' },
      lucio: { estado: 'sacrificio', resumen: 'No se puede pescar intencionadamente. Las capturas accidentales deben sacrificarse.' },
      tenca: { estado: 'sacrificio', resumen: 'Se trata como exótica: si se captura por accidente, debe sacrificarse.' },
      carpin: { estado: 'sacrificio', resumen: 'Si se captura por accidente, debe sacrificarse.' },
    },
    porDefecto: {
      autoctona: NO_LISTADA,
      exotica: { estado: 'sacrificio', resumen: 'No se puede pescar intencionadamente. Las capturas accidentales deben sacrificarse.' },
    },
  },

  // ─────────────────────────────── Aragón ───────────────────────────────
  AR: {
    norma: [{ titulo: 'Orden MAT/1888/2025, de 17 de diciembre: Plan General de Pesca de Aragón para 2026', url: 'https://www.aragon.es/documents/d/guest/la-pesca-en-aragon-temporada-2026' }],
    generales: [
      'Horario: de una hora antes de la salida del sol a una hora después de su puesta.',
      'Una caña en aguas trucheras; hasta dos en aguas ciprinícolas (pescador a menos de 10 m de sus cañas).',
      CEBOS_PEZ,
      'Prohibido pescar a mano, con arpón, boya de fondo o palangre; curricán solo en cotos que lo autoricen. Prohibidas las suelas de fieltro.',
      'Prohibido mantener peces vivos o muertos en el agua con rejones o redes. Distancia mínima de 50 m aguas abajo de presas.',
    ],
    zonas: {
      salmonidos: [
        {
          tipo: 'Aguas trucheras en captura y suelta',
          reglas: [
            'Solo cebos artificiales: cucharilla, pez artificial y mosca (seca, ahogada, streamer o ninfa), máximo cuatro moscas por aparejo.',
            'Anzuelo de una sola punta, sin arponcillo ni rebaba.',
            'Prohibidos el cebo natural y el cebado. Prohibido lastrar el aparejo fuera de las moscas; boyas solo flotantes.',
          ],
        },
        {
          tipo: 'Aguas trucheras extractivas (aguas libres y cotos sociales)',
          reglas: [
            'Cebos artificiales; anzuelo de una punta sin arponcillo, de al menos 7 mm de apertura y 2 cm de longitud.',
            'Cebo natural prohibido, salvo para mayores de 65 años: lombriz, draga, canutillo, grillo y saltamontes.',
            'Sin pesca extractiva los miércoles y jueves no festivos.',
          ],
        },
        { tipo: 'Alta montaña, ibones y lagos', reglas: ['Solo los cebos artificiales de captura y suelta (mosca, cucharilla, pez artificial) con anzuelo sin arponcillo.'] },
        { tipo: 'Cotos deportivos', reglas: ['Se rigen por su plan técnico, siempre más restrictivo que la norma general.'] },
      ],
      ciprinidos: [
        {
          tipo: 'Aguas ciprinícolas',
          reglas: [
            'Hasta dos cañas, un aparejo por caña y máximo dos anzuelos (simples o de varias puntas).',
            'Cebos naturales: vegetales y alimentos, insectos y lombrices autóctonos, partes de animales (no de peces).',
            'Cualquier cebo artificial.',
            'Cebado prohibido, salvo entrenamientos y campeonatos federados en masas catalogadas.',
          ],
        },
      ],
    },
    especies: {
      trucha: {
        estado: 'mixta',
        resumen: 'Captura y suelta en la mayoría de aguas trucheras; extractiva solo en aguas libres y cotos sociales señalados. En aguas ciprinícolas, devolución obligatoria.',
        periodo: 'Captura y suelta: del tercer sábado de marzo al 15/10 (alta montaña, lagos e ibones del 01/06 al 15/10). Extractiva: del tercer sábado de marzo al 31/08 (alta montaña del 01/06 al 31/08).',
        talla: 'Según tramo (ver el Plan General)',
        cupo: '3 por pescador y día en pesca extractiva',
        zonas: 'salmonidos',
      },
      barbo_graells: { estado: 'sin_muerte', resumen: 'Captura y suelta en aguas ciprinícolas.', zonas: 'ciprinidos' },
      pez_gato_negro: { estado: 'sacrificio', resumen: 'Debe sacrificarse en todas las aguas de Aragón.' },
      pez_gato_punteado: { estado: 'sacrificio', resumen: 'Debe sacrificarse en todas las aguas de Aragón.' },
    },
    porDefecto: {
      autoctona: NO_LISTADA,
      exotica: {
        estado: 'sacrificio',
        resumen: 'Sin cupo ni talla. Hay que sacrificarla al momento y retirarla del medio, salvo en los tramos del río Gállego donde se permite la suelta voluntaria.',
        zonas: 'ciprinidos',
      },
    },
  },

  // ─────────────────────────────── Castilla y León ───────────────────────────────
  CL: {
    norma: [
      { titulo: 'Orden MAV/1506/2025: Plan General de Pesca 2026 (BOCyL 09/01/2026)', url: 'https://bocyl.jcyl.es/' },
      { titulo: 'Orden MAV/1570/2024: normas reguladoras de la pesca (BOCyL 31/12/2024)', url: 'https://bocyl.jcyl.es/boletines/2024/12/31/pdf/BOCYL-D-31122024-1.pdf' },
    ],
    generales: [
      'Horario: de una hora antes del amanecer a una hora después del ocaso.',
      'Una caña en aguas trucheras; hasta dos en no trucheras.',
      'Prohibido el pez vivo como cebo en todas las aguas, y el pez muerto salvo para cangrejo (nunca especies exóticas).',
      'Prohibidas las huevas, los animales que no sean de la fauna local y los señuelos con pilas o luces. Prohibidas la plomada sobre el hilo con señuelo artificial y los plomos de arrastre o fondo.',
      'Cebado prohibido en aguas trucheras; en las no trucheras solo para pescar sin muerte y con cebo biodegradable.',
    ],
    zonas: {
      salmonidos: [
        {
          tipo: 'Aguas trucheras libres (cupo cero)',
          reglas: ['La trucha se devuelve siempre.', 'Solo mosca artificial, cucharilla de un anzuelo y peces artificiales de un anzuelo, todos sin arponcillo (salvo que el plan autorice otros).'],
        },
        { tipo: 'Cotos', reglas: ['Se rigen por su plan de pesca; algunos permiten retener truchas con su propia talla y cupo.'] },
        { tipo: 'Escenarios deportivo-sociales', reglas: ['La pesca con caña es siempre sin muerte.'] },
        { tipo: 'Aguas en régimen especial controlado (AREC)', reglas: ['Según su plan de gestión.'] },
      ],
      ciprinidos: [{ tipo: 'Aguas no trucheras', reglas: ['Hasta dos cañas.', 'Cebado solo para pescar sin muerte y con cebo biodegradable.'] }],
    },
    especies: {
      trucha: {
        estado: 'sin_muerte',
        resumen: 'Cupo cero en todas las aguas libres: se devuelve siempre. Solo puede retenerse en cotos o aguas cuyo plan lo permita.',
        periodo: 'Aguas trucheras: desde el 21/03 (Ávila, Salamanca, Segovia, Valladolid) o el 28/03 (Burgos, León, Palencia, Soria, Zamora) hasta el 31/07. Cotos y AREC según su plan.',
        talla: 'En cotos, la de su plan',
        cupo: '0 en aguas libres',
        zonas: 'salmonidos',
      },
      barbo_comun: { estado: 'extractiva', resumen: 'Pescable todo el año en aguas libres; cupo cero del 1/5 al 15/7.', talla: '24 cm', cupo: '2 por día', zonas: 'ciprinidos' },
      boga_duero: { estado: 'extractiva', resumen: 'Cupo cero del 1/5 al 15/7.', talla: '18 cm', cupo: '2 por día', zonas: 'ciprinidos' },
      madrilla: { estado: 'extractiva', resumen: 'Cupo cero del 1/5 al 15/7.', talla: '18 cm', cupo: '2 por día', zonas: 'ciprinidos' },
      bordallo: { estado: 'extractiva', resumen: 'Cupo cero del 1/5 al 15/7.', talla: '18 cm', cupo: '2 por día', zonas: 'ciprinidos' },
      cacho: { estado: 'extractiva', resumen: 'Cupo cero del 1/5 al 15/7.', talla: '18 cm', cupo: '2 por día', zonas: 'ciprinidos' },
      tenca: { estado: 'extractiva', resumen: 'Pescable en aguas libres.', talla: '25 cm', cupo: '2 por día', zonas: 'ciprinidos' },
      gobio: { estado: 'extractiva', resumen: 'Pescable en aguas libres.', talla: '8 cm', cupo: '2 por día', zonas: 'ciprinidos' },
      piscardo: { estado: 'extractiva', resumen: 'Sin talla ni cupo, salvo en la cuenca del Ebro (8 cm y 2 por día).', zonas: 'ciprinidos' },
      carpa: { estado: 'zonas', resumen: 'Pescable en todas sus modalidades en las masas de agua delimitadas (Orden FYM/339/2019), donde puede devolverse. Fuera de ellas no puede devolverse.', zonas: 'ciprinidos' },
      black_bass: { estado: 'zonas', resumen: 'Pescable en las masas de agua delimitadas (Orden FYM/339/2019), donde puede devolverse. Fuera de ellas no puede devolverse.', zonas: 'ciprinidos' },
      trucha_arcoiris: { estado: 'sacrificio', resumen: 'No puede devolverse al agua. En cotos, según su plan de pesca.' },
      hucho: { estado: 'mixta', resumen: 'Sin cupo en las aguas trucheras de Salamanca; cupo cero (devolver) en las no trucheras de Salamanca.' },
    },
    porDefecto: { autoctona: NO_LISTADA, exotica: EXOTICA_SACRIFICIO },
  },

  // ─────────────────────────────── Castilla-La Mancha ───────────────────────────────
  CM: {
    norma: [{ titulo: 'Orden 20/2026, de 4 de febrero, de vedas de pesca (DOCM 12/02/2026)', url: 'https://transparencia.castillalamancha.es/sites/default/files/migrate/actuaciones/cef0a6a6_20._publicacion_docm_12-02-2026_orden_de_vedas_de_pesca_2026.pdf' }],
    generales: [
      'Prohibido usar como cebo peces, cangrejos o moluscos vivos, y especies exóticas invasoras muertas o sus partes.',
      'Prohibidas todas las redes. Prohibido pescar en refugios y a menos de 50 m de pasos de peces en aguas trucheras (10 m en el resto).',
      'En aguas trucheras: prohibidos el cebado y la pesca desde embarcación (los patos no se consideran embarcación).',
    ],
    zonas: {
      salmonidos: [
        { tipo: 'Aguas trucheras de máxima protección', reglas: ['Solo mosca artificial, con anzuelo sin arponcillo.'] },
        { tipo: 'Aguas trucheras de conservación', reglas: ['Mosca y cucharilla, con anzuelo sin arponcillo.'] },
        { tipo: 'Aguas trucheras de recuperación y degradadas', reglas: ['Mosca, cucharilla y señuelos artificiales con anzuelo simple sin arponcillo.'] },
        { tipo: 'Cotos intensivos', reglas: ['Según el anexo II; en general también señuelos con anzuelo simple.'] },
        { tipo: 'Ciprínidos durante la temporada de trucha', reglas: ['Cebo natural de origen vegetal con anzuelo simple sin arponcillo (no en tramos de máxima protección).'] },
      ],
      ciprinidos: [{ tipo: 'Aguas no trucheras', reglas: ['Cebado solo con determinados materiales vegetales, asticot y cebos similares.', 'Algunos embalses limitan anzuelos y señuelos (ver la orden).'] }],
    },
    especies: {
      trucha: {
        estado: 'sin_muerte',
        resumen: 'Solo pesca sin muerte: devolución inmediata.',
        periodo: 'Baja montaña: 01/04 al 30/09. Alta montaña: 01/05 al 15/10 (con excepciones por provincia).',
        zonas: 'salmonidos',
      },
      barbo_comun: { estado: 'mixta', resumen: 'Sin muerte en la mayoría de provincias; donde se autoriza la pesca extractiva, talla mínima de 18 cm (Ciudad Real: 5 por día).', talla: '18 cm (donde es extractiva)', zonas: 'ciprinidos' },
      boga_tajo: { estado: 'mixta', resumen: 'Talla mínima de 10 cm; sin muerte en Toledo.', talla: '10 cm', zonas: 'ciprinidos' },
      cacho: { estado: 'mixta', resumen: 'Debe devolverse vivo en algunos tramos (Júcar desde Alarcón, Gallo).', zonas: 'ciprinidos' },
      bordallo: { estado: 'mixta', resumen: 'Debe devolverse vivo en algunos tramos.', zonas: 'ciprinidos' },
      tenca: { estado: 'extractiva', resumen: 'Pescable; es la única especie autóctona que puede comercializarse.', zonas: 'ciprinidos' },
      barbo_comizo: { estado: 'prohibida', resumen: 'No pescable en el Tajo (Toledo); sin muerte en Ruidera y Peñarroya.' },
      anguila: PROHIBIDA,
      carpin: { estado: 'extractiva', resumen: 'Exótica que se pesca para controlar su población.', zonas: 'ciprinidos' },
      trucha_arcoiris: { estado: 'zonas', resumen: 'En aguas privadas y cotos intensivos (allí puede soltarse con aviso previo).', zonas: 'salmonidos' },
    },
    porDefecto: {
      autoctona: NO_LISTADA,
      exotica: { estado: 'zonas', resumen: 'Solo en las zonas del anexo III. Las capturas fuera de esas zonas deben sacrificarse de inmediato.', zonas: 'ciprinidos' },
    },
  },

  // ─────────────────────────────── Comunidad de Madrid ───────────────────────────────
  MD: {
    norma: [{ titulo: 'Orden 815/2026, de 27 de marzo, de vedas y pesca continental (BOCM núm. 83, 09/04/2026)', url: 'https://www.bocm.es/boletin/CM_Orden_BOCM/2026/04/09/BOCM-20260409-43.PDF' }],
    generales: [
      'Horario: de una hora antes de la salida del sol a una hora después de la puesta.',
      'Máximo dos cañas al alcance de la mano; una en la zona truchera.',
      'Señuelos de máximo tres anzuelos y aparejos de máximo tres posturas (el buldó, hasta cuatro).',
      'Prohibido usar especies exóticas invasoras como cebo. Distancia de 50 m a presas y 10 m entre pescadores.',
      'Los lunes, captura y suelta obligatoria de las especies autóctonas en todas las aguas. Los jueves no festivos son inhábiles en la zona truchera.',
    ],
    zonas: {
      salmonidos: [
        {
          tipo: 'Zona truchera',
          reglas: [
            'Cebos naturales: solo lombriz, canutillo y gusarapa, con anzuelo sencillo.',
            'Señuelos artificiales, salvo masillas y moscas con plomada de arrastre o de fondo.',
            'Prohibidos el asticot, las huevas, las masas o masillas y el pez vivo o muerto.',
          ],
        },
        {
          tipo: 'Captura y suelta',
          reglas: ['Anzuelos sencillos sin arponcillo.', 'En la zona truchera, solo mosca, ninfa o streamer (excepcionalmente, cucharilla de un solo anzuelo sin muerte).'],
        },
        { tipo: 'Cotos I, II y III', reglas: ['Un solo anzuelo por montaje, sin poteras.'] },
      ],
      ciprinidos: [
        {
          tipo: 'Fuera de la zona truchera',
          reglas: [
            'Cebos naturales: lombriz, canutillo, gusarapa, asticot, maíz, patata cocida, ova de río y mezclas naturales.',
            'Señuelos: cucharilla, mosca, streamer, imitaciones, vinilos y masillas.',
          ],
        },
      ],
    },
    especies: {
      trucha: { estado: 'sin_muerte', resumen: 'Captura y suelta: devolución inmediata, manipulándola lo mínimo.', periodo: 'Zona truchera: del segundo domingo de marzo al tercer domingo de julio.', zonas: 'salmonidos' },
      barbo_comun: { estado: 'extractiva', resumen: 'Pescable.', talla: '18 cm', cupo: '12 por día', zonas: 'ciprinidos' },
      boga_tajo: { estado: 'extractiva', resumen: 'Pescable.', talla: '12 cm', cupo: '8 por día', zonas: 'ciprinidos' },
      cacho: { estado: 'extractiva', resumen: 'Pescable.', talla: '12 cm', cupo: '8 por día', zonas: 'ciprinidos' },
      gobio: { estado: 'extractiva', resumen: 'Pescable.', talla: '8 cm', cupo: '8 por día', zonas: 'ciprinidos' },
      tenca: { estado: 'extractiva', resumen: 'Pescable.', talla: '18 cm', cupo: '8 por día', zonas: 'ciprinidos' },
      carpin: { estado: 'extractiva', resumen: 'Sin talla ni cupo.', zonas: 'ciprinidos' },
      anguila: PROHIBIDA,
      barbo_comizo: PROHIBIDA,
      calandino: PROHIBIDA,
      lamprehuela: PROHIBIDA,
      bermejuela: PROHIBIDA,
      colmilleja: PROHIBIDA,
      pardilla: PROHIBIDA,
      alburno: { estado: 'sacrificio', resumen: 'Exótica objeto de pesca, sin talla ni cupo. No puede devolverse al medio.', zonas: 'ciprinidos' },
      black_bass: { estado: 'sacrificio', resumen: 'Exótica objeto de pesca, sin talla ni cupo. No puede devolverse al medio.', zonas: 'ciprinidos' },
      carpa: { estado: 'sacrificio', resumen: 'Exótica objeto de pesca, sin talla ni cupo. No puede devolverse al medio.', zonas: 'ciprinidos' },
      lucio: { estado: 'sacrificio', resumen: 'Exótica objeto de pesca, sin talla ni cupo. No puede devolverse al medio.', zonas: 'ciprinidos' },
      lucioperca: { estado: 'sacrificio', resumen: 'Exótica objeto de pesca, sin talla ni cupo. No puede devolverse al medio.', zonas: 'ciprinidos' },
      trucha_arcoiris: { estado: 'extractiva', resumen: 'Exótica objeto de pesca; solo se suelta en masas autorizadas (ejemplares estériles). Algún coto fija cupo.', zonas: 'salmonidos' },
      pez_gato_negro: { estado: 'sacrificio', resumen: 'Exótica que no es objeto de pesca: no puede devolverse.' },
    },
    porDefecto: { autoctona: NO_LISTADA, exotica: EXOTICA_SACRIFICIO },
  },

  // ─────────────────────────────── Andalucía ───────────────────────────────
  AN: {
    norma: [
      { titulo: 'Orden de 13 de enero de 2023: vedas, periodos hábiles y condiciones de la pesca continental (BOJA núm. 15, 24/01/2023), con sus modificaciones', url: 'https://www.juntadeandalucia.es/boja/2023/15/BOJA23-015-00027-1274-01_00276351.pdf' },
      { titulo: 'Junta de Andalucía: vedas y periodos hábiles vigentes', url: 'https://www.juntadeandalucia.es/medioambiente/portal/web/caza-y-pesca/pesca-continental/vedas-periodos-habiles' },
    ],
    generales: [
      'Horario: de una hora antes del orto a una hora después del ocaso (en embalses con mejillón cebra, solo de sol a sol).',
      'Solo caña, con un sedal y un anzuelo (o un triple para masilla, cucharilla y peces artificiales).',
      'Una caña en aguas trucheras; dos en el resto (a menos de 10 m).',
      'Prohibidos como cebo: peces, especies exóticas invasoras e imitaciones de huevas. Prohibido cebar las aguas, salvo en competiciones federadas.',
    ],
    zonas: {
      salmonidos: [
        {
          tipo: 'Aguas trucheras y cotos de trucha común',
          reglas: ['Solo cebos artificiales sin muerte con un único anzuelo sin flecha (sin arponcillo).', 'Cucharillas de un anzuelo sin flecha y hasta tres moscas en anzuelos simples sin flecha.', 'No se permite cebar ni pescar carpa (salvo excepciones).'],
        },
        { tipo: 'Cotos de trucha arcoíris', reglas: ['Según el plan técnico de cada coto (algunos permiten masilla y cereales; otros excluyen los vinilos).'] },
      ],
      ciprinidos: [{ tipo: 'Aguas no trucheras', reglas: ['Se pueden usar todos los cebos autorizados: naturales, artificiales y artificiales sin muerte.'] }],
    },
    especies: {
      trucha: { estado: 'sin_muerte', resumen: 'Solo captura y suelta, en cotos de trucha común y aguas trucheras que no sean refugio.', periodo: '01/05 al 15/10 (río Zumeta, tramo libre: 01/04 al 30/09).', zonas: 'salmonidos' },
      barbo_gitano: { estado: 'sin_muerte', resumen: 'Captura y suelta obligatoria.', periodo: '01/07 al 25/02', zonas: 'ciprinidos' },
      barbo_comun: { estado: 'sin_muerte', resumen: 'Captura y suelta obligatoria.', periodo: '01/07 al 25/02', zonas: 'ciprinidos' },
      barbo_comizo: { estado: 'sin_muerte', resumen: 'Captura y suelta obligatoria.', periodo: '01/07 al 25/02', zonas: 'ciprinidos' },
      barbo_cabecicorto: { estado: 'sin_muerte', resumen: 'Captura y suelta obligatoria.', periodo: '01/07 al 25/02', zonas: 'ciprinidos' },
      boga_guadiana: { estado: 'sin_muerte', resumen: 'Captura y suelta obligatoria.', periodo: '01/05 al 31/01', zonas: 'ciprinidos' },
      boga_tajo: { estado: 'sin_muerte', resumen: 'Captura y suelta obligatoria.', periodo: '01/05 al 31/01', zonas: 'ciprinidos' },
      cacho: { estado: 'prohibida', resumen: 'Ha dejado de ser especie pescable.' },
      tenca: { estado: 'prohibida', resumen: 'Ha dejado de ser especie pescable.' },
      anguila: { estado: 'prohibida', resumen: 'Pesca prohibida para la recuperación de la especie.' },
      carpin: { estado: 'extractiva', resumen: 'Sin limitación de tallas, en aguas libres donde esté presente (no en aguas trucheras ni refugios).', zonas: 'ciprinidos' },
      carpa: { estado: 'zonas', resumen: 'Pescable en general salvo en aguas trucheras (con excepciones). Fuera de las áreas delimitadas, las capturas deben sacrificarse.', zonas: 'ciprinidos' },
      black_bass: { estado: 'zonas', resumen: 'Solo en las áreas de la Resolución de 19 de diciembre de 2019. Fuera de ellas, sacrificio obligatorio.', zonas: 'ciprinidos' },
      lucio: { estado: 'zonas', resumen: 'Solo en las áreas de la Resolución de 19 de diciembre de 2019. Fuera de ellas, sacrificio obligatorio.', zonas: 'ciprinidos' },
      trucha_arcoiris: { estado: 'zonas', resumen: 'Solo en los cotos del anexo II (periodo y cupo según su plan técnico). Fuera de ellos, sacrificio obligatorio.', zonas: 'salmonidos' },
      siluro: { estado: 'sacrificio', resumen: 'Pesca no autorizada; las capturas deben sacrificarse (p. ej., embalse de Iznájar).' },
    },
    porDefecto: { autoctona: NO_LISTADA, exotica: EXOTICA_SACRIFICIO },
  },

  // ─────────────────────────────── Región de Murcia ───────────────────────────────
  MC: {
    norma: [{ titulo: 'Orden de disposiciones generales de vedas para la pesca fluvial del año 2026 (BORM núm. 100, 04/05/2026)', url: 'https://borm.es/services/anuncio/ano/2026/numero/1936/pdf?id=842618' }],
    generales: [
      'Horario: de una hora antes de la salida del sol a una hora después de la puesta (los cotos tienen horarios propios).',
      'Dos cañas al alcance de la mano, con dos anzuelos por aparejo. Prohibido pescar a menos de 50 m de presas y pasos de peces.',
      'Prohibidos el pez vivo como cebo, las especies exóticas invasoras (vivas, muertas o sus partes), el recebado (salvo competiciones), las redes y las suelas de fieltro.',
    ],
    zonas: {
      salmonidos: [
        {
          tipo: 'Cotos de trucha arcoíris (El Cenajo, El Esparragal, Hoya García, El Jarral, La Cierva)',
          reglas: ['Con cebo, una caña y un solo anzuelo; o buldó con hasta tres moscas.', 'Se permiten cucharillas con ancoreta o potera de tres puntas.', 'Periodo, días y horario según cada coto.'],
        },
      ],
      ciprinidos: [
        { tipo: 'Tramos sin muerte (Segura en Murcia y Olivarejo, embalses de Ojós y Argos)', reglas: ['Anzuelo sin arponcillo o con el arponcillo inutilizado.', 'Devolución de todas las capturas autóctonas.'] },
      ],
    },
    especies: {
      barbo_gitano: { estado: 'sin_muerte', resumen: 'Sin muerte todo el año en todas las aguas (retención temporal solo en competiciones).', zonas: 'ciprinidos' },
      barbo_mediterraneo: { estado: 'sin_muerte', resumen: 'Los barbos son sin muerte todo el año.', zonas: 'ciprinidos' },
      boga_tajo: { estado: 'sin_muerte', resumen: 'Sin muerte todo el año en todas las aguas.', zonas: 'ciprinidos' },
      gobio: { estado: 'extractiva', resumen: 'Pescable.', talla: '10 cm', zonas: 'ciprinidos' },
      trucha_arcoiris: { estado: 'zonas', resumen: 'Solo en los cinco cotos autorizados. No puede devolverse al agua.', zonas: 'salmonidos' },
      black_bass: { estado: 'zonas', resumen: 'Río Segura desde la presa del Cenajo, embalses de Cárcabo, La Cierva, Mayés, Pliego y Azud de Ojós, y canal del trasvase. No puede devolverse.', zonas: 'ciprinidos' },
      carpa: { estado: 'sacrificio', resumen: 'Pescable en todas las aguas continentales. No puede devolverse.', zonas: 'ciprinidos' },
      lucio: { estado: 'zonas', resumen: 'Segura desde el Cenajo hasta el Azud de Ojós. No puede devolverse.', zonas: 'ciprinidos' },
      lucioperca: { estado: 'zonas', resumen: 'Todo el río Segura, canal del trasvase y embalses del Mayés, La Cierva y Algeciras. No puede devolverse.', zonas: 'ciprinidos' },
      carpin: { estado: 'sacrificio', resumen: 'No puede devolverse al agua.' },
    },
    porDefecto: { autoctona: NO_LISTADA, exotica: EXOTICA_SACRIFICIO },
  },

  // ─────────────────────────────── Comunitat Valenciana ───────────────────────────────
  VC: {
    norma: [
      { titulo: 'Orden 7/2012, de 30 de abril: periodos hábiles y normas generales de la pesca en aguas continentales (con sus modificaciones; la última, DOGV núm. 9961, 21/10/2024)', url: 'https://mediambient.gva.es/documents/20551003/173798778/2024_10_21_Resoluci%C3%B3n+modificaci%C3%B3n+Orden+periodos+habiles+pesca.pdf/fe09f69d-da31-3f4b-483c-b9a6ca35ba3f?t=1729494961231' },
    ],
    generales: [
      'Horario: de una hora antes de la salida del sol a una hora después de la puesta. Pesca nocturna prohibida (con excepciones).',
      'Cebos prohibidos: cangrejo vivo o muerto, huevas, anfibios, peces vivos o muertos. La lombriz, el asticot y la cola precocinada de cangrejo americano solo se permiten en aguas no trucheras.',
      'En desembocaduras al mar se permite pescado marino muerto comprado (sardina, boquerón, caballa…).',
      'Redes prohibidas. Los cotos tienen sus propias normas de cebos, cupos y horarios.',
      'Nota: es la norma general de 2012 con sus modificaciones. Comprueba las reglas de especies exóticas en la versión vigente.',
    ],
    zonas: {
      salmonidos: [
        {
          tipo: 'Tramos de trucha común (Cabriel, Ebrón, Turia, Palancia, Villahermosa y cotos)',
          reglas: ['Siempre sin muerte, con un solo anzuelo sin arponcillo.', 'Señuelos artificiales, insectos acuáticos e insectos terrestres adultos (en el Cabriel).', 'Una sola caña, sin abandonarla. Cebado prohibido.'],
        },
        { tipo: 'Aguas de trucha arcoíris con trucha común', reglas: ['Solo mosca artificial o cucharilla, con un único anzuelo sin arponcillo por caña.'] },
        { tipo: 'Otras aguas de trucha arcoíris (con muerte)', reglas: ['Mosca, cucharilla, ova y fruta del tiempo.', 'Cupo de 6 truchas por pescador y día en aguas libres.'] },
      ],
      ciprinidos: [{ tipo: 'Aguas no trucheras', reglas: ['Pesca todo el año, con las medidas complementarias de cada tramo.', 'Carpa y barbo: cupo conjunto de 6 por pescador y día.'] }],
    },
    especies: {
      trucha: { estado: 'sin_muerte', resumen: 'Prohibida salvo en los tramos listados, donde es sin muerte. Fuera de ellos, devolución inmediata.', periodo: 'En aguas libres, en general del primer domingo de abril (1 de abril en el Cabriel) al 31 de agosto o 30 de septiembre, en días fijados.', zonas: 'salmonidos' },
      trucha_arcoiris: { estado: 'extractiva', resumen: 'Del tercer domingo de marzo al 31 de agosto (río Chelva/Tuéjar todo el año); viernes, sábados, domingos y festivos.', cupo: '6 por día (aguas libres)', zonas: 'salmonidos' },
      barbo_mediterraneo: { estado: 'mixta', resumen: 'Pescable todo el año en aguas no trucheras; sin muerte en algunos tramos de Castellón y del límite con Albacete.', cupo: '6 por día (junto con la carpa)', zonas: 'ciprinidos' },
      barbo_graells: { estado: 'mixta', resumen: 'Pescable en aguas no trucheras; sin muerte en algunos tramos.', cupo: '6 por día (junto con la carpa)', zonas: 'ciprinidos' },
      carpa: { estado: 'extractiva', resumen: 'Pescable todo el año en aguas no trucheras.', cupo: '6 por día (junto con el barbo)', zonas: 'ciprinidos' },
      black_bass: { estado: 'zonas', resumen: 'Pescable en embalses; del 1/4 al 31/5 (freza) la orden de 2012 obliga a soltarlo. Comprueba en la norma vigente si debe sacrificarse.', zonas: 'ciprinidos' },
      siluro: { estado: 'sacrificio', resumen: 'Prohibido devolverlo al agua, poseerlo o transportarlo vivo o muerto. Hay que comunicar la captura a los agentes medioambientales.' },
      anguila: { estado: 'prohibida', resumen: 'En peligro crítico: pesca muy restringida. Consulta la norma vigente.' },
      samaruc: PROHIBIDA,
      fartet: PROHIBIDA,
    },
    porDefecto: { autoctona: NO_LISTADA, exotica: EXOTICA_SACRIFICIO },
  },

  // ─────────────────────────────── Extremadura ───────────────────────────────
  EX: {
    norma: [
      { titulo: 'Orden de 7 de noviembre de 2022, General de Vedas de Pesca (plurianual), actualizada por resoluciones', url: 'https://doe.juntaex.es/otrosFormatos/html.php?xml=2024060655&anio=2024&doe=390o' },
    ],
    generales: ['Consulta el cuadro de tramos vigente: cada tramo indica su régimen (sin muerte, tradicional, vedado, coto).', 'Algunos tramos de embalses (Orellana, Alange, Puerto Peña, Alcántara) tienen horario libre de pesca.'],
    zonas: {
      salmonidos: [
        { tipo: 'Tramos sin muerte de trucha con temporada', reglas: ['Pescables todos los días del tercer domingo de marzo al 31 de julio; fuera de ese periodo, prohibido (también en afluentes).', 'Solo cebo artificial con un anzuelo sin muerte (sin arponcillo).'] },
        { tipo: 'Vedados', reglas: ['Pesca prohibida (p. ej., Alto Jerte y Garganta de los Buitres).'] },
      ],
      ciprinidos: [
        { tipo: 'Tramos de pesca tradicional (solo especies autóctonas)', reglas: ['Devolución de las capturas; un solo anzuelo sin arponcillo.', 'Prohibido el lance con cucharilla, vinilo o pez artificial.'] },
        { tipo: 'Frezaderos de barbos, bogas y cachos', reglas: ['Pesca sin muerte.'] },
      ],
    },
    especies: {
      trucha: { estado: 'sin_muerte', resumen: 'Solo en tramos sin muerte de trucha con temporada.', periodo: 'Del tercer domingo de marzo al 31 de julio.', zonas: 'salmonidos' },
      carpa: { estado: 'zonas', resumen: 'Pescable en aguas embalsadas creadas antes de 2007, donde puede retenerse o soltarse; no puede devolverse en ríos.', zonas: 'ciprinidos' },
      siluro: { estado: 'prohibida', resumen: 'No es especie pescable.' },
      lucioperca: { estado: 'prohibida', resumen: 'No es especie pescable.' },
    },
    porDefecto: {
      autoctona: { estado: 'sin_dato', resumen: 'Depende del tramo (en frezaderos y tramos tradicionales, sin muerte). Consulta la orden.', zonas: 'ciprinidos' },
      exotica: { estado: 'sin_dato', resumen: 'Consulta la orden: según la especie y el tipo de agua, la suelta es opcional o el sacrificio obligatorio.' },
    },
  },

  // ─────────────────────────────── Galicia ───────────────────────────────
  GA: {
    norma: [{ titulo: 'Orden de 11 de diciembre de 2025: normas de pesca en aguas continentales de Galicia para 2026 (DOG núm. 246, 22/12/2025)', url: 'https://gaia.xunta.gal/sites/default/files/lexislacion/16c79a85-a0fe-42ed-a1f7-b4cf6ff7ec70/967d6eed-665f-484e-8e7a-f32fcac0c55fOr%2011-12-2025_es.pdf' }],
    generales: [
      'Lunes inhábiles (salvo festivos). Los jueves solo se puede pescar sin muerte.',
      'Horario: de una hora antes de la salida del sol a una hora después de la puesta.',
      'Una caña por persona (a menos de 3 m) y salabre o lazo. Desde embarcación, una caña por persona y máximo tres por barca. Dos cañas en estuarios y en los embalses de los anexos VII y VIII.',
      'Cebos naturales permitidos excepto huevas y peces enteros, con anzuelos de tamaño mínimo (anexo I).',
    ],
    zonas: {
      salmonidos: [
        { tipo: 'Aguas generales', reglas: ['Artificiales: mosca, cucharilla y pez artificial.', 'Naturales, salvo huevas y peces enteros, con el anzuelo mínimo del anexo I.'] },
        { tipo: 'Aguas salmoneras (anexo III)', reglas: ['Cucharillas de 6,5 cm como máximo.', 'Cebo natural prohibido.'] },
        { tipo: 'Río Eo compartido', reglas: ['Desde el 1 de junio, prohibidas cucharillas, devones y peces artificiales; desde el 16 de junio, solo mosca.'] },
        { tipo: 'Aguas del anexo IX', reglas: ['Cebo natural prohibido desde el 1 de julio.'] },
        { tipo: 'Sin muerte', reglas: ['Solo cebos artificiales con un único anzuelo sin arponcillo.', 'Cebo natural prohibido; devolución de todas las capturas.'] },
      ],
      ciprinidos: [{ tipo: 'Embalses de los anexos VII y VIII', reglas: ['Dos cañas desde la orilla; máximo dos anzuelos por caña para ciprínidos.'] }],
    },
    especies: {
      trucha: {
        estado: 'extractiva',
        resumen: 'Se puede retener respetando talla y cupo (en tramos sin muerte, devolución).',
        periodo: 'En general del 15/03 al 31/07; aguas salmonícolas, de reo y cabeceras de montaña del 01/05 al 31/07; cotos intensivos del 15/03 al 30/09.',
        talla: '19 cm (21 cm en el anexo VI, 23 cm en embalses, 25 cm en el Eo)',
        cupo: '6 por día (4 en el anexo VI y el Eo, 3 en embalses)',
        zonas: 'salmonidos',
      },
      salmon: { estado: 'prohibida', resumen: 'Pesca cerrada en todas las aguas continentales (salvo las excepciones del art. 18).' },
      black_bass: { estado: 'zonas', resumen: 'Todo el año en los embalses y tramos del Miño y del Sil listados. Sacrificio inmediato en el lugar de captura.', zonas: 'ciprinidos' },
      carpa: { estado: 'zonas', resumen: 'Todo el año en los embalses y tramos del Miño y del Sil listados. Sacrificio inmediato en el lugar de captura.', zonas: 'ciprinidos' },
    },
    porDefecto: { autoctona: NO_LISTADA, exotica: EXOTICA_SACRIFICIO },
  },

  // ─────────────────────────────── Principado de Asturias ───────────────────────────────
  AS: {
    norma: [{ titulo: 'Resolución de 24 de octubre de 2025: normas para la pesca en aguas continentales durante la campaña 2026 (BOPA 30/10/2025)', url: 'https://noticias.juridicas.com/base_datos/CCAA/976384-r-medio-rural-y-politica-agraria-24-oct-2025-ca-asturias-normas-para-el-ejercicio.html' }],
    generales: [
      'Jueves inhábiles para todas las especies. Los lunes solo pesca sin muerte (y en embalses de pesca intensiva).',
      'Solo caña; las capturas se sacan con sacadera o lazo.',
      'Cebo natural: un anzuelo por caña de más de 4,5 mm de alto y 5 mm de base. Señuelos: hasta 4 anzuelos por aparejo; para especies distintas del salmón, anzuelos simples de una punta (cucharillas de tres anzuelos solo en zonas no salmoneras).',
      'Prohibidos el pez vivo, las huevas, el "bingo" y el cebado. Prohibida la plomada detrás o sobre el hilo con moscas.',
      'Distancia entre pescadores de 15 m (30 m en salmón o mosca).',
    ],
    zonas: {
      salmonidos: [
        { tipo: 'Zonas libres y cotos', reglas: ['Cebos naturales y artificiales con los anzuelos indicados.', 'Talla mínima: 19 cm en general, 17 cm en zonas de montaña y 21 cm en zonas salmoneras.'] },
        { tipo: 'Tramos sin muerte', reglas: ['Desanzuelar con el pez dentro del agua y las manos mojadas; devolución inmediata.', 'La trucha arcoíris sí puede sacrificarse.'] },
        { tipo: 'Salmón', reglas: ['Anzuelos de al menos 7 × 8 mm para mosca y señuelos, y 13 × 14 mm para cebo natural.', 'Cucharillas y devones hasta el 15 de junio.'] },
      ],
    },
    especies: {
      trucha: {
        estado: 'extractiva',
        resumen: 'Trucha y reo: se pueden retener con talla y cupo; al completar el cupo, solo captura y suelta.',
        periodo: 'Del tercer domingo de marzo al 15/08. Zonas de montaña desde el tercer domingo de mayo. Tramos sin muerte no salmoneros hasta el 15/10.',
        talla: '19 cm (17 en montaña, 21 en zonas salmoneras, 25 en el Eo)',
        cupo: '6 por día (3 en Alfilorios y Enguilu)',
        zonas: 'salmonidos',
      },
      salmon: {
        estado: 'extractiva',
        resumen: 'Cupos por río; cada salmón se declara y precinta. Asturias ha anunciado la veda del salmón para 2027.',
        periodo: 'Del tercer sábado de abril al 15/07',
        talla: '45 cm',
        cupo: '1 por día y 2 por año (solo 1 puede sacrificarse)',
        zonas: 'salmonidos',
      },
      anguila: { estado: 'prohibida', resumen: 'Pesca cerrada salvo la pesquería de angula.' },
      sabalo: PROHIBIDA,
      saboga: PROHIBIDA,
      trucha_arcoiris: { estado: 'sacrificio', resumen: 'Puede sacrificarse incluso en tramos sin muerte.' },
    },
    porDefecto: { autoctona: NO_LISTADA, exotica: EXOTICA_SACRIFICIO },
  },

  // ─────────────────────────────── Cantabria ───────────────────────────────
  CB: {
    norma: [{ titulo: 'Orden DES/02/2026, de 12 de enero, sobre pesca en aguas continentales para 2026 (BOC núm. 12, 20/01/2026)', url: 'https://vhispagua.cedex.es/sites/default/files/hispagua_legislacion/cantabria/20260217/verAnuncioAction.do_idAnuBlob_429642.pdf' }],
    generales: [
      'Días hábiles: martes, miércoles, viernes, sábados, domingos y festivos. Horario por meses (por ejemplo, de 6:30 a 23:00 en junio).',
      'Una caña por pescador, al alcance de la mano. Prohibido pescar desde embarcación o flotador.',
      'Cebos prohibidos: pez vivo o muerto, huevos de peces, larvas de mosca de la carne, pulga de mar, larvas de efemerópteros y plecópteros, y el "bingo".',
      'Cebo natural: un solo anzuelo sencillo de al menos 4,5 mm de alto y 5 mm de base.',
    ],
    zonas: {
      salmonidos: [
        { tipo: 'Trucha (general)', reglas: ['Solo anzuelos sencillos.', 'Prohibidas cucharillas y peces artificiales de más de 7 cm con pala de más de 4 cm (salvo en el embalse del Ebro y aguas abajo).'] },
        { tipo: 'Tramos solo mosca (Asón, Pas, Nansa y Deva)', reglas: ['Solo mosca seca y mosca ahogada.'] },
        { tipo: 'Cotos de trucha', reglas: ['Cebo natural prohibido, salvo excepciones (p. ej., Caranceja en el Saja).'] },
        { tipo: 'Captura y suelta (cotos y zonas libres)', reglas: ['Señuelos artificiales con un único anzuelo simple sin arponcillo.', 'Sacadera obligatoria.'] },
        { tipo: 'Salmón', reglas: ['Mosca (incluidas ninfas), cucharilla, devón y pez artificial con las medidas indicadas, lombriz y quisquilla.', 'Solo en los tramos autorizados de cada río.'] },
      ],
      ciprinidos: [{ tipo: 'Ciprínidos', reglas: ['Solo engodos y cebos vegetales.', 'En el embalse del Ebro, carpfishing con dos cañas.'] }],
    },
    especies: {
      trucha: { estado: 'extractiva', resumen: 'Al completar el cupo hay que dejar de pescar ese día, incluso sin muerte.', periodo: 'Del 01/04 al 31/07 (muchos tramos abren el 15/05; en el Ebro hasta el 15/10, solo sin muerte desde agosto).', talla: '21 cm', cupo: '5 por día (2 en el embalse del Ebro)', zonas: 'salmonidos' },
      salmon: { estado: 'extractiva', resumen: 'Cupos por río (Asón 12, Pas 15, Nansa 6, Deva 5). Las capturas de talla legal no se devuelven, salvo en captura y suelta con una única mosca.', periodo: 'Del 01/05 hasta agotar el cupo del río o el 30/06', talla: '45 cm', cupo: '1 por pescador y temporada', zonas: 'salmonidos' },
    },
    porDefecto: { autoctona: { ...NO_LISTADA, zonas: 'ciprinidos' }, exotica: EXOTICA_SACRIFICIO },
  },

  // ─────────────────────────────── País Vasco ───────────────────────────────
  PV: {
    norma: [
      { titulo: 'Bizkaia: Orden Foral 2084/2026, de 24 de marzo (pesca continental 2026)', url: 'https://www.bizkaia.eus/Home2/archivos/DPTO2/Temas/Pdf/Pesca%20Fluvial%202026.pdf?idioma=CA' },
    ],
    generales: [
      'En el País Vasco cada diputación foral aprueba su orden de pesca. Este resumen sigue la de Bizkaia; Gipuzkoa y Álava tienen la suya.',
      'Dos cañas por pescador, al alcance de la mano. Martes no festivos inhábiles en tramos libres.',
      'Prohibidos como cebo: peces vivos o muertos; huevas, larvas, pupas, ninfas e invertebrados no locales; asticot; masas de queso o carne; mejillón cebra.',
      'Lombriz: prohibidos los anzuelos menores del n.º 3. Desinfección obligatoria de botas y material (mejillón cebra).',
    ],
    zonas: {
      salmonidos: [
        { tipo: 'Tramos libres', reglas: ['Normas generales.'] },
        { tipo: 'Captura y suelta (sin muerte)', reglas: ['Solo mosca artificial y cucharilla, cada una con un único anzuelo simple sin arponcillo.', 'Sacadera obligatoria (malla de 5 mm sin nudos).'] },
        { tipo: 'Cotos de Arratia, Lea, Oka, Sopuerta y Trucios', reglas: ['Cebo natural prohibido toda la temporada. En el Oka está prohibido el pez artificial y las cucharillas solo pueden llevar un anzuelo.'] },
      ],
      ciprinidos: [{ tipo: 'Aguas de ciprínidos', reglas: ['Cupo de 4 por día; las truchas capturadas se devuelven.'] }],
    },
    especies: {
      trucha: { estado: 'extractiva', resumen: 'Se puede retener en tramos libres y cotos de primavera.', periodo: 'Tramos libres: del primer domingo de abril al 31/07 (cotos según su anexo).', talla: '22 cm', cupo: '2 en tramos libres (2–3 en cotos)', zonas: 'salmonidos' },
      salmon: { estado: 'prohibida', resumen: 'Prohibido en todos los ríos de Bizkaia.' },
      sabalo: { estado: 'prohibida', resumen: 'Prohibido en todos los ríos de Bizkaia.' },
      tenca: { estado: 'sacrificio', resumen: 'Considerada no autóctona: si se captura, sacrificarla y comunicarlo.' },
    },
    porDefecto: {
      autoctona: { estado: 'extractiva', resumen: 'Ciprínidos: del primer domingo de 2026 al 15/03/2027 (salvo agosto y septiembre).', cupo: '4 por día', zonas: 'ciprinidos' },
      exotica: { estado: 'sacrificio', resumen: 'No puede retenerse viva: cualquier captura accidental debe sacrificarse y comunicarse.' },
    },
  },

  // ─────────────────────────────── Navarra ───────────────────────────────
  NA: {
    norma: [
      { titulo: 'Orden Foral 87E/2025, de 21 de marzo: disposición general de vedas de pesca (plurianual, BON núm. 72)', url: 'https://bon.navarra.es/es/anuncio/-/texto/2025/72/15' },
      { titulo: 'Resolución 108E/2026, de 25 de febrero: condiciones para la pesca en 2026', url: 'https://www.navarra.es/documents/48192/6652441/condiciones-para-la-pesca-2026-resolucion-108E-2026.pdf' },
    ],
    generales: [
      'Martes no festivos inhábiles. Horario por meses (de 6:30 a 22:30 de mayo a julio).',
      'En la región salmonícola están prohibidos como cebo: peces vivos o muertos, queso, masas y sólidos grasos, huevas y asticot; también los montajes con gusanera o puro y las boyas lastradas.',
      'Fechas y tallas tomadas de la orden de 2025; la resolución de 2026 actualiza las condiciones anuales.',
    ],
    zonas: {
      salmonidos: [
        { tipo: 'Región salmonícola superior', reglas: ['Solo captura y suelta, con permiso diario.', 'Solo señuelos artificiales (máximo 3 por aparejo), cada uno con un anzuelo simple sin arponcillo; cucharillas, peces artificiales y vinilos con un solo anzuelo simple.', 'Cebo natural prohibido. Una caña.'] },
        { tipo: 'Región salmonícola mixta', reglas: ['Mismos señuelos y anzuelos, salvo en los tramos extractivos de cotos intensivos (cebo natural permitido).', 'Una caña más otra de repuesto montada.'] },
        { tipo: 'Tramos extractivos', reglas: ['Se pueden retener truchas dentro de la franja de talla y el cupo.'] },
      ],
      ciprinidos: [{ tipo: 'Región ciprinícola', reglas: ['Barbo, tenca y cacho todo el año; hasta dos cañas.', 'Los peces artificiales pueden llevar más de un triple.'] }],
    },
    especies: {
      trucha: {
        estado: 'mixta',
        resumen: 'Captura y suelta salvo en tramos extractivos.',
        periodo: 'Superior: 01/05 al 30/06 (Baztan-Bidasoa, Oria-Urumea, Ega-Urederra y coto de Zudaire). Mixta: 02/04 al 30/09; extractiva hasta el 31/07.',
        talla: 'Franja de 20 a 35 cm en tramos extractivos',
        cupo: '2 por día (5 en cotos intensivos)',
        zonas: 'salmonidos',
      },
      salmon: { estado: 'prohibida', resumen: 'Cerrado en 2025 por el declive de la especie (comprueba la resolución de 2026).' },
      barbo_graells: { estado: 'extractiva', resumen: 'Pescable todo el año en la región ciprinícola.', zonas: 'ciprinidos' },
      tenca: { estado: 'extractiva', resumen: 'Pescable todo el año en la región ciprinícola.', zonas: 'ciprinidos' },
      cacho: { estado: 'extractiva', resumen: 'Pescable todo el año en la región ciprinícola.', zonas: 'ciprinidos' },
      bagre: { estado: 'extractiva', resumen: 'Pescable todo el año en la región ciprinícola.', zonas: 'ciprinidos' },
      carpa: { estado: 'mixta', resumen: 'Sacrificio obligatorio, salvo en la región ciprinícola, donde es opcional.', zonas: 'ciprinidos' },
      lucioperca: { estado: 'sacrificio', resumen: 'Prohibida su pesca; si se captura, sacrificarla.' },
      perca: { estado: 'sacrificio', resumen: 'Prohibida su pesca; si se captura, sacrificarla.' },
      percasol: { estado: 'sacrificio', resumen: 'Prohibida su pesca; si se captura, sacrificarla.' },
      rutilo: { estado: 'sacrificio', resumen: 'Prohibida su pesca; si se captura, sacrificarla.' },
    },
    porDefecto: { autoctona: NO_LISTADA, exotica: { ...EXOTICA_SACRIFICIO, zonas: 'ciprinidos' } },
  },

  // ─────────────────────────────── La Rioja ───────────────────────────────
  RI: {
    norma: [{ titulo: 'Orden AGM/6/2026, de 19 de febrero: periodos hábiles de pesca (BOR 23/02/2026)', url: 'https://noticias.juridicas.com/base_datos/CCAA/989717-orden-agm-6-2026-de-19-de-feb-la-rioja-fija-periodos-habiles-de-pesca-y.html' }],
    generales: [
      'Una caña en aguas trucheras; hasta dos en ciprinícolas. Prohibida la embarcación en aguas trucheras.',
      'Horario en aguas trucheras por meses (por ejemplo, de 6:30 a 22:30 en junio y julio); en ciprinícolas, de una hora antes de la salida del sol a una hora después de la puesta.',
      'Prohibidos el pez vivo o muerto como cebo (salvo pez muerto no exótico para cangrejo) y el cebado (salvo en el Ebro o donde se autorice).',
    ],
    zonas: {
      salmonidos: [
        {
          tipo: 'Tramos tradicionales (con muerte)',
          reglas: [
            'Cebo natural permitido, salvo masillas, huevas artificiales, asticot, tresillos y poteras, y aparejos de más de dos anzuelos.',
            'Cucharilla con un solo anzuelo sin arponcillo (triple sin arponcillo en las zonas listadas). Pez artificial con uno o dos anzuelos simples sin arponcillo.',
            'Mosca permitida; prohibidos la boya lastrada, la gusanera y el puro.',
          ],
        },
        { tipo: 'Tramos sin muerte', reglas: ['Solo señuelos artificiales de un anzuelo o hasta tres moscas, sin arponcillo.', 'Sacadera no metálica obligatoria. Prohibido llevar truchas.'] },
        { tipo: 'Cotos', reglas: ['Permiso diario; los intensivos pueden permitir captura y suelta según su plan.'] },
      ],
      ciprinidos: [{ tipo: 'Aguas ciprinícolas (Ebro y afluentes, embalses de riego)', reglas: ['Pesca todo el año, hasta dos cañas.'] }],
    },
    especies: {
      trucha: {
        estado: 'mixta',
        resumen: 'Con muerte en tramos tradicionales; sin muerte en tramos señalados, en agosto y los lunes y jueves no festivos. Martes y viernes no son hábiles para la trucha.',
        periodo: 'Del 29/03 al 31/08 (agosto solo sin muerte).',
        talla: 'Más de 23 cm',
        cupo: '3 por día',
        zonas: 'salmonidos',
      },
      barbo_graells: { estado: 'extractiva', resumen: 'Pescable en aguas ciprinícolas; cupo cero en tramos sin muerte.', talla: '35 cm', cupo: '2 por día', zonas: 'ciprinidos' },
      tenca: { estado: 'extractiva', resumen: 'Pescable.', talla: '15 cm', cupo: '5 por día', zonas: 'ciprinidos' },
      piscardo: { estado: 'extractiva', resumen: 'Pescable, sin cupo.', talla: '8 cm', zonas: 'ciprinidos' },
      fraile: PROHIBIDA,
      carpa: { estado: 'mixta', resumen: 'Exótica invasora: puede soltarse voluntariamente en aguas ciprinícolas; fuera de ellas, sacrificio.', zonas: 'ciprinidos' },
      black_bass: { estado: 'mixta', resumen: 'Exótica invasora: puede soltarse voluntariamente en aguas ciprinícolas; fuera de ellas, sacrificio.', zonas: 'ciprinidos' },
      carpin: { estado: 'extractiva', resumen: 'Sin talla ni cupo.', zonas: 'ciprinidos' },
    },
    porDefecto: { autoctona: NO_LISTADA, exotica: { ...EXOTICA_SACRIFICIO, zonas: 'ciprinidos' } },
  },
}
