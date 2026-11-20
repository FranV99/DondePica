// Cómo se pesca cada especie: modalidades, equipo, señuelos, cebos y anzuelos.
// Es una guía orientativa de pesca recreativa. Lo que está permitido en cada sitio (cebos,
// anzuelos, cupos…) lo fija la normativa de cada comunidad: ver src/data/normativa.js.
//
// Cada modalidad: { nombre, cana, carrete, linea, senuelos, cebos, anzuelos, montaje }
// (todos opcionales salvo el nombre). noPescable: texto para las especies que no son
// objeto de pesca recreativa (protegidas, muy pequeñas o sin interés deportivo).

const MOSCA_TRUCHA = {
  nombre: 'Pesca a mosca',
  cana: 'Caña de mosca de 8 a 9 pies (2,4–2,7 m), línea del n.º 3 al 5',
  carrete: 'Carrete de mosca sencillo, con línea flotante',
  linea: 'Bajo de línea cónico de 9 pies terminado en 0,10–0,16 mm',
  senuelos: ['Mosca seca (efémeras, tricópteros, hormigas)', 'Ninfa (lastrada o tungsteno en corriente)', 'Mosca ahogada', 'Streamer en pozas profundas'],
  anzuelos: 'Del n.º 12 al 20; sin arponcillo donde la norma lo exige (en muchos tramos es obligatorio)',
}
const SPINNING_TRUCHA = {
  nombre: 'Lance ligero (spinning)',
  cana: 'Caña de 1,80–2,40 m, acción rápida, potencia 2–10 g',
  carrete: 'Carrete de tamaño 1000–2000',
  linea: 'Monofilamento 0,16–0,20 mm o trenzado fino con bajo de fluorocarbono',
  senuelos: ['Cucharilla giratoria del n.º 0 al 2', 'Pececillo artificial de 3 a 7 cm (minnow)', 'Vinilo pequeño (donde esté permitido)'],
  anzuelos: 'Cada vez más tramos exigen un solo anzuelo simple sin arponcillo en lugar del triple',
}

const BARBO = {
  resumen: 'Pez de fondo, desconfiado y muy luchador. Se pesca sobre todo a fondo o a la inglesa con cebos vegetales, y en verano también a mosca o con pequeños señuelos.',
  modalidades: [
    {
      nombre: 'Pesca a fondo (feeder o plomo corredizo)',
      cana: 'Caña de feeder o de fondo de 3–3,6 m, 40–80 g',
      carrete: 'Tamaño 3000–4000 con freno suave',
      linea: 'Madre 0,22–0,28 mm, bajo 0,16–0,20 mm',
      cebos: ['Maíz dulce', 'Pan o masa', 'Lombriz (donde se permita)', 'Asticot (donde se permita)', 'Pellets'],
      anzuelos: 'Simple del n.º 8 al 14',
      montaje: 'Plomo corredizo o cebador; si se pesca sin muerte, anzuelo sin arponcillo',
    },
    {
      nombre: 'Pesca a la inglesa o al coup',
      cana: 'Caña inglesa de 3,9–4,2 m o enchufable',
      linea: 'Madre 0,14–0,18 mm, bajo 0,12–0,14 mm',
      cebos: ['Maíz', 'Pan', 'Asticot (donde se permita)'],
      anzuelos: 'Simple del n.º 12 al 16',
    },
    {
      nombre: 'Mosca y lance ligero (en verano)',
      cana: 'Mosca del n.º 5–6 o spinning de 2,1 m, 3–15 g',
      senuelos: ['Ninfa', 'Mosca seca grande (saltamontes)', 'Vinilo pequeño', 'Pececillo artificial de 4–5 cm'],
      anzuelos: 'Simple del n.º 8 al 14',
    },
  ],
  epoca: 'De primavera a otoño; mejor en verano, con el agua templada',
  horario: 'Amanecer, atardecer y días nublados',
  consejos: ['Cebar poco y a menudo (donde el cebado esté permitido).', 'Mojar las manos y devolverlo rápido: en muchas comunidades es obligatorio soltarlo.'],
}

const BOGA = {
  resumen: 'Pez gregario de corriente que se alimenta raspando algas. Muy activo durante la remontada de primavera.',
  modalidades: [
    {
      nombre: 'Pesca a la inglesa o al coup',
      cana: 'Caña inglesa de 3,9 m o enchufable ligera',
      linea: 'Madre 0,12–0,16 mm, bajo 0,10–0,12 mm',
      cebos: ['Pan', 'Masa', 'Lombriz pequeña', 'Asticot (donde se permita)'],
      anzuelos: 'Simple del n.º 14 al 18',
    },
    {
      nombre: 'Mosca y cucharilla',
      cana: 'Mosca del n.º 3–5 o spinning ultraligero de 1–5 g',
      senuelos: ['Ninfa pequeña', 'Mosca ahogada', 'Cucharilla del n.º 00–0'],
      anzuelos: 'Simple del n.º 14 al 18',
    },
  ],
  epoca: 'Primavera (remontada) y otoño',
  horario: 'Todo el día en corrientes; amanecer y atardecer en verano',
  consejos: ['Respetar los frezaderos en primavera: muchos tramos son sin muerte o vedados en esa época.'],
}

const CACHO = {
  resumen: 'Ciprínido omnívoro y oportunista, de pozas y corrientes lentas. Ataca bien señuelos pequeños.',
  modalidades: [
    {
      nombre: 'Lance ultraligero',
      cana: 'Spinning de 1,8–2,1 m, 1–7 g',
      senuelos: ['Cucharilla del n.º 0–1', 'Pececillo artificial de 3–4 cm', 'Vinilo pequeño'],
      anzuelos: 'Simple del n.º 10 al 14',
    },
    {
      nombre: 'Coup o boya',
      cana: 'Caña enchufable o inglesa',
      linea: 'Bajo 0,10–0,14 mm',
      cebos: ['Pan', 'Lombriz', 'Saltamontes', 'Fruta (cereza, higo)'],
      anzuelos: 'Simple del n.º 12 al 16',
    },
    { nombre: 'Mosca', cana: 'Mosca del n.º 3–5', senuelos: ['Mosca seca', 'Hormiga', 'Ninfa'], anzuelos: 'Del n.º 12 al 18' },
  ],
  epoca: 'Primavera a otoño',
  horario: 'Mañana y tarde',
  consejos: ['Pez muy desconfiado: acercarse con sigilo y sin sombra sobre el agua.'],
}

const COUP_PEQUENOS = {
  resumen: 'Pez pequeño que se pesca con aparejos muy finos y cebos diminutos.',
  modalidades: [
    {
      nombre: 'Pesca al coup',
      cana: 'Caña enchufable o telescópica ligera de 3–5 m',
      linea: 'Madre 0,10–0,12 mm, bajo 0,08–0,10 mm, boya muy sensible',
      cebos: ['Asticot o pinkies (donde se permita)', 'Lombriz pequeña', 'Pan', 'Masa'],
      anzuelos: 'Simple del n.º 18 al 22',
    },
  ],
  epoca: 'Primavera a otoño',
  horario: 'Todo el día',
}

const DEPREDADOR_LANCE = (extra) => ({
  nombre: 'Lance con señuelos (spinning / casting)',
  cana: 'Caña de 2,1–2,7 m; potencia según el tamaño del señuelo',
  carrete: 'Spinning 2500–4000 o carrete de casting',
  linea: 'Trenzado 0,10–0,20 mm con bajo de fluorocarbono',
  ...extra,
})

export const TECNICAS = {
  trucha: {
    resumen: 'La especie más regulada de la pesca continental. Vive en aguas frías y oxigenadas y se pesca sobre todo a mosca y a lance ligero; el cebo natural solo se permite en algunos tramos con muerte.',
    modalidades: [
      MOSCA_TRUCHA,
      SPINNING_TRUCHA,
      {
        nombre: 'Cebo natural',
        cana: 'Caña telescópica de 4–6 m o de lance ligero',
        linea: 'Monofilamento 0,14–0,18 mm, plomada ligera',
        cebos: ['Lombriz', 'Canutillo (larva de tricóptero)', 'Saltamontes', 'Gusarapa'],
        anzuelos: 'Simple del n.º 6 al 10; varias comunidades fijan un tamaño mínimo para no dañar ejemplares pequeños',
        montaje: 'Solo donde la norma lo permite (tramos con muerte); prohibido en tramos sin muerte, alta montaña en muchas comunidades y aguas salmoneras',
      },
      {
        nombre: 'Pesca a la ninfa al hilo (estilo checo / francés)',
        cana: 'Caña de 10–11 pies, línea del n.º 2–3',
        linea: 'Bajo largo de 0,10–0,14 mm con indicador',
        senuelos: ['Ninfas lastradas con tungsteno'],
        anzuelos: 'Del n.º 12 al 18, sin arponcillo',
      },
    ],
    epoca: 'Primavera (eclosiones de efémeras) e inicio de verano; en alta montaña, de junio a septiembre',
    horario: 'Primeras y últimas horas del día; en verano, al atardecer',
    consejos: ['Usar anzuelos sin arponcillo facilita soltarla sin daño.', 'Mojarse las manos, no sacarla del agua y usar sacadera de malla sin nudos.', 'No pisar los frezaderos (zonas de grava limpia) en invierno.'],
  },
  salmon: {
    resumen: 'El trofeo de los ríos cantábricos y gallegos. Su pesca está muy limitada (cupos por río y por pescador) y en varias comunidades cerrada por el declive de la especie.',
    modalidades: [
      {
        nombre: 'Pesca a mosca',
        cana: 'Caña de dos manos de 13–15 pies (spey) o de una mano de 10 pies, línea del n.º 8–10',
        linea: 'Bajo 0,30–0,40 mm',
        senuelos: ['Moscas de salmón tipo tubo', 'Moscas clásicas y de pelo'],
        anzuelos: 'Doble o simple; varias normas fijan un tamaño mínimo',
      },
      {
        nombre: 'Lance (cucharilla y devón)',
        cana: 'Caña de 2,7–3,3 m, 15–40 g',
        carrete: 'Tamaño 4000',
        linea: 'Monofilamento 0,30–0,35 mm',
        senuelos: ['Cucharilla giratoria', 'Devón', 'Pez artificial'],
      },
      { nombre: 'Cebo natural (donde se permita)', cebos: ['Lombriz', 'Quisquilla'], anzuelos: 'Tamaño mínimo reglamentario' },
    ],
    epoca: 'Primavera e inicio de verano, con la entrada de salmones del mar',
    horario: 'Amanecer, atardecer y tras crecidas',
    consejos: ['Cada captura debe declararse y precintarse en la mayoría de comunidades.'],
  },
  trucha_arcoiris: {
    resumen: 'Exótica de repoblación en cotos intensivos y embalses. Se pesca como la trucha común, y también con cebos y masillas donde se permiten.',
    modalidades: [
      { ...MOSCA_TRUCHA, senuelos: ['Ninfa', 'Streamer (woolly bugger)', 'Mosca seca'] },
      SPINNING_TRUCHA,
      { nombre: 'Cebo y masilla (cotos)', cana: 'Caña de lance o boloñesa', cebos: ['Masilla para truchas', 'Lombriz', 'Maíz (donde se permita)'], anzuelos: 'Simple del n.º 8 al 12' },
    ],
    epoca: 'Según el calendario de sueltas de cada coto',
    horario: 'Todo el día en cotos',
    consejos: ['Es exótica invasora: fuera de los cotos autorizados no puede devolverse al agua.'],
  },
  salvelino: {
    resumen: 'Salmónido exótico de lagos de alta montaña. Se pesca con las mismas técnicas que la trucha.',
    modalidades: [MOSCA_TRUCHA, SPINNING_TRUCHA],
    epoca: 'Verano (lagos de montaña deshelados)',
    horario: 'Mañana y atardecer',
    consejos: ['Es exótica invasora: no se devuelve al agua.'],
  },

  barbo_comun: BARBO,
  barbo_graells: BARBO,
  barbo_gitano: BARBO,
  barbo_comizo: {
    ...BARBO,
    resumen: 'El barbo ibérico más grande, también depredador de peces. Se pesca a fondo y a lance; está protegido o es sin muerte en muchas zonas.',
    modalidades: [
      BARBO.modalidades[0],
      DEPREDADOR_LANCE({ senuelos: ['Vinilo de 7–10 cm', 'Pez artificial de 7–9 cm', 'Cucharilla grande'], anzuelos: 'Simple o triple sin arponcillo' }),
    ],
  },
  barbo_cabecicorto: BARBO,
  barbo_mediterraneo: BARBO,
  boga_tajo: BOGA,
  boga_duero: BOGA,
  boga_guadiana: BOGA,
  madrilla: BOGA,
  cacho: CACHO,
  bordallo: CACHO,
  bagre: CACHO,
  tenca: {
    resumen: 'Pez de aguas quietas y fondos fangosos (lagunas, charcas, embalses con vegetación). Muy tranquila: se pesca a boya o a fondo con cebos naturales.',
    modalidades: [
      { nombre: 'Pesca a boya o al coup', cana: 'Caña inglesa o boloñesa de 4–5 m', linea: 'Madre 0,16–0,20 mm, bajo 0,14–0,16 mm', cebos: ['Lombriz', 'Maíz', 'Asticot (donde se permita)', 'Pan'], anzuelos: 'Simple del n.º 10 al 14' },
      { nombre: 'Feeder o fondo', cana: 'Caña de feeder de 3,3–3,6 m', cebos: ['Maíz', 'Lombriz', 'Pellets'], anzuelos: 'Simple del n.º 10 al 12' },
    ],
    epoca: 'Final de primavera y verano',
    horario: 'Amanecer y atardecer, también de noche donde se permita',
  },
  gobio: COUP_PEQUENOS,
  piscardo: COUP_PEQUENOS,
  alburno: { ...COUP_PEQUENOS, consejos: ['Es exótica invasora: no se devuelve al agua.'] },
  rutilo: { ...COUP_PEQUENOS, consejos: ['Es exótica invasora: no se devuelve al agua.'] },
  gardi: { ...COUP_PEQUENOS, consejos: ['Es exótica invasora: no se devuelve al agua.'] },
  blicca: COUP_PEQUENOS,
  carpin: { ...COUP_PEQUENOS, resumen: 'Pariente de la carpa, abundante en aguas lentas y embalses. Se pesca al coup y a fondo con cebos vegetales.' },
  carpa_dorada: {
    ...COUP_PEQUENOS,
    resumen: 'Se pesca como el carpín: a boya fina o al coup con cebos pequeños, en charcas, estanques y orillas tranquilas de embalses.',
    consejos: ['Es exótica: no debe devolverse al agua donde la norma lo prohíbe, y nunca se suelta en otra masa de agua.'],
  },
  carpa_herbivora: {
    resumen: 'Ciprínido grande y muy fuerte que come plantas acuáticas. Desconfiado: se pesca cerca de la vegetación, en superficie o a media agua, con cebos vegetales.',
    modalidades: [
      { nombre: 'Carpfishing', cana: 'Caña de 12 pies, 2,75–3 lb', carrete: 'Bobina grande con freno de combate', linea: 'Monofilamento 0,30–0,35 mm', cebos: ['Maíz dulce', 'Boilies', 'Pan'], anzuelos: 'Del n.º 6 al 10, montaje "pelo"' },
      { nombre: 'Boya en superficie o a media agua', cana: 'Caña de boya de 3,6–4 m', linea: 'Bajo 0,22–0,25 mm', cebos: ['Pan', 'Maíz'], anzuelos: 'Del n.º 8 al 12', montaje: 'Pan flotando junto a las orillas con plantas' },
    ],
    epoca: 'Verano, con el agua caliente',
    horario: 'Mañana y tarde, en zonas con vegetación',
    consejos: ['Exótica: comprueba si en tu comunidad debe sacrificarse.'],
  },
  brema_comun: {
    resumen: 'Ciprínido de fondo que forma bancos en tramos lentos y embalses. Se pesca a fondo con cebador o a la inglesa.',
    modalidades: [
      { nombre: 'Feeder o fondo', cana: 'Caña de feeder de 3,6 m, 40–80 g', linea: 'Madre 0,20–0,25 mm, bajo 0,14–0,16 mm', cebos: ['Asticot (donde se permita)', 'Lombriz', 'Maíz', 'Pan'], anzuelos: 'Del n.º 12 al 16', montaje: 'Cebador relleno de engodo (donde se permita)' },
      { nombre: 'Pesca a la inglesa', cana: 'Caña inglesa de 4,2 m', cebos: ['Asticot (donde se permita)', 'Maíz'], anzuelos: 'Del n.º 14 al 16' },
    ],
    epoca: 'Primavera a otoño',
    horario: 'Atardecer y primeras horas de la noche',
  },
  aspio: {
    resumen: 'Ciprínido depredador que caza alevines en superficie, en corrientes y zonas abiertas de grandes ríos. Ataca señuelos rápidos.',
    modalidades: [
      DEPREDADOR_LANCE({ senuelos: ['Cucharilla ondulante', 'Pez artificial de 7–12 cm', 'Señuelo de superficie (popper, stickbait)', 'Jig'], anzuelos: 'Triples o simples' }),
    ],
    epoca: 'Primavera y otoño',
    horario: 'Mañana y atardecer, cuando caza en superficie',
    consejos: ['Exótica de introducción reciente: no la devuelvas al agua donde la norma lo prohíbe.'],
  },
  hucho: {
    resumen: 'El salmónido más grande de Europa. En España solo quedan algunos ejemplares en la cuenca del Tormes, introducidos hace décadas.',
    modalidades: [
      DEPREDADOR_LANCE({ cana: 'Caña de 2,4–2,7 m, 20–60 g', senuelos: ['Pez artificial de 10–15 cm', 'Cucharilla ondulante', 'Vinilo grande'], anzuelos: 'Simple o triple sin arponcillo' }),
      { nombre: 'Mosca', cana: 'Caña del n.º 8–9', senuelos: ['Streamers grandes de 15–20 cm'] },
    ],
    epoca: 'Otoño e invierno',
    horario: 'Días nublados y fríos',
  },
  lisa: {
    resumen: 'Entra desde el mar en desembocaduras, estuarios y lagunas costeras. Muy desconfiada: se pesca a boya fina con pan.',
    modalidades: [{ nombre: 'Boya fina', cana: 'Caña inglesa o boloñesa de 4–5 m', linea: 'Bajo 0,14–0,18 mm', cebos: ['Pan', 'Masa de pan y sardina'], anzuelos: 'Simple del n.º 10 al 14' }],
    epoca: 'Primavera a otoño',
    horario: 'Mareas entrantes y atardecer',
  },
  platija: {
    resumen: 'Pez plano de estuarios y tramos bajos de los ríos del norte. Se pesca a fondo.',
    modalidades: [{ nombre: 'Pesca a fondo', cana: 'Caña de fondo de 3–3,9 m', cebos: ['Gusana de mar', 'Lombriz'], anzuelos: 'Simple del n.º 4 al 8, de pata larga' }],
    epoca: 'Otoño e invierno',
    horario: 'Con marea entrante',
  },

  carpa: {
    resumen: 'Gran ciprínido exótico de embalses y ríos lentos; la especie del carpfishing. Muy fuerte y desconfiada.',
    modalidades: [
      { nombre: 'Carpfishing', cana: 'Dos cañas de 12–13 pies, 2,75–3,5 lb', carrete: 'Carrete de bobina grande con freno de combate', linea: 'Monofilamento 0,30–0,35 mm o trenzado con bajo de 20–25 lb', cebos: ['Boilies', 'Maíz o tigernuts cocidos', 'Pellets'], anzuelos: 'Del n.º 4 al 8, montaje "pelo"', montaje: 'Plomo de seguridad, cebado con pellets y alfombra de recepción' },
      { nombre: 'Feeder o fondo', cana: 'Caña de feeder de 3,6 m, 60–120 g', cebos: ['Maíz', 'Pellets', 'Masa'], anzuelos: 'Del n.º 8 al 12' },
      { nombre: 'Boya / inglesa', cana: 'Inglesa de 4,2 m o boloñesa', cebos: ['Maíz', 'Pan'], anzuelos: 'Del n.º 10 al 14' },
    ],
    epoca: 'Primavera a otoño; mejor con el agua por encima de 15 °C',
    horario: 'Noche, amanecer y atardecer',
    consejos: ['Es exótica invasora: solo puede devolverse donde la norma lo permite (zonas declaradas antes de 2007); en el resto debe sacrificarse.'],
  },
  black_bass: {
    resumen: 'Depredador exótico de embalses con orillas cubiertas (juncos, árboles sumergidos). La especie reina de la pesca con señuelos.',
    modalidades: [
      DEPREDADOR_LANCE({
        senuelos: ['Vinilo con montaje Texas, Carolina o drop shot', 'Spinnerbait', 'Crankbait', 'Señuelo de superficie (popper, stickbait)', 'Jig'],
        anzuelos: 'Offset del n.º 1 al 4/0 para vinilos; triples en señuelos duros (donde se permitan)',
      }),
      { nombre: 'Mosca', cana: 'Caña del n.º 6–8', senuelos: ['Popper', 'Streamer', 'Imitaciones de rana'], anzuelos: 'Del n.º 2 al 6' },
    ],
    epoca: 'Primavera (antes y después de la freza) y otoño',
    horario: 'Amanecer y atardecer; en verano, de noche y en zonas de sombra',
    consejos: ['Exótica invasora: solo puede soltarse en las zonas donde la norma autonómica lo permite.'],
  },
  lucio: {
    resumen: 'Gran depredador exótico de aguas lentas con vegetación. Tiene dientes muy afilados: hace falta bajo de acero o fluorocarbono grueso.',
    modalidades: [
      DEPREDADOR_LANCE({ senuelos: ['Cucharilla ondulante', 'Vinilo de 10–20 cm', 'Jerkbait', 'Spinnerbait', 'Pez artificial'], linea: 'Trenzado 0,15–0,25 mm con bajo de acero o fluorocarbono de 0,60 mm o más', anzuelos: 'Triples o simples grandes; mejor sin arponcillo para soltarlo' }),
      { nombre: 'Mosca', cana: 'Caña del n.º 8–10', senuelos: ['Streamers grandes de 15–20 cm'], linea: 'Bajo de acero' },
    ],
    epoca: 'Otoño e invierno; también primavera tras la freza',
    horario: 'Todo el día en días nublados',
    consejos: ['Usar alicates largos para desanzuelar.'],
  },
  lucioperca: {
    resumen: 'Depredador exótico de embalses grandes y aguas turbias. Caza pegado al fondo, sobre todo con poca luz.',
    modalidades: [DEPREDADOR_LANCE({ senuelos: ['Vinilo con cabeza plomada (jig) trabajado a saltos en el fondo', 'Pez artificial de profundidad', 'Cucharilla'], anzuelos: 'Cabeza plomada 7–30 g' })],
    epoca: 'Otoño, invierno y primavera',
    horario: 'Amanecer, atardecer y noche',
  },
  perca: {
    resumen: 'Pequeño depredador exótico que forma bancos. Se pesca con señuelos pequeños.',
    modalidades: [DEPREDADOR_LANCE({ cana: 'Spinning ligero de 1,8–2,1 m, 2–10 g', senuelos: ['Cucharilla del n.º 1–2', 'Vinilo de 5–7 cm', 'Drop shot'] })],
    epoca: 'Todo el año',
    horario: 'Todo el día',
  },
  siluro: {
    resumen: 'El mayor pez de agua dulce de Europa, exótico e invasor en el Ebro y otros grandes ríos. Exige equipo muy potente.',
    modalidades: [
      { nombre: 'Pesca a fondo o con boya de deriva', cana: 'Caña de 2,7–3,3 m, 200–600 g', carrete: 'Carrete grande de bobina fija o de tambor', linea: 'Trenzado 0,40–0,60 mm', cebos: ['Pellets de halibut', 'Lombrices en manojo', 'Calamar (donde esté permitido)'], anzuelos: 'Simple o triple del n.º 1/0 al 8/0' },
      DEPREDADOR_LANCE({ cana: 'Caña de 2,4–2,7 m, 40–150 g', linea: 'Trenzado 0,25–0,40 mm', senuelos: ['Vinilo grande', 'Pez artificial de 15–25 cm'] }),
      { nombre: 'Clonk desde embarcación', cana: 'Caña corta y potente', senuelos: ['Vinilo o cebo en vertical'], montaje: 'Se atrae al siluro golpeando el agua con el clonk' },
    ],
    epoca: 'Primavera a otoño, con el agua por encima de 18 °C',
    horario: 'Noche, amanecer y atardecer',
    consejos: ['En la mayoría de comunidades es obligatorio sacrificarlo; en ninguna puede soltarse fuera de las zonas autorizadas.'],
  },
  pez_gato_negro: {
    resumen: 'Pequeño pez gato exótico de fondo. Suele capturarse de forma accidental pescando a fondo con lombriz.',
    modalidades: [{ nombre: 'Fondo', cebos: ['Lombriz'], anzuelos: 'Simple del n.º 6 al 10' }],
    epoca: 'Verano',
    horario: 'Noche y atardecer',
    consejos: ['Exótica invasora: en todas las comunidades debe sacrificarse si se captura.'],
  },
  pez_gato_punteado: {
    resumen: 'Pez gato exótico de grandes ríos. Se captura a fondo, a menudo de forma accidental.',
    modalidades: [{ nombre: 'Fondo', cebos: ['Lombriz', 'Pellets'], anzuelos: 'Simple del n.º 2 al 6' }],
    epoca: 'Verano',
    horario: 'Noche',
    consejos: ['Exótica invasora: debe sacrificarse si se captura.'],
  },
  percasol: {
    resumen: 'Pequeño pez exótico muy voraz; pica con facilidad a cualquier cebo pequeño.',
    modalidades: [{ nombre: 'Boya o coup', cebos: ['Lombriz', 'Asticot (donde se permita)'], anzuelos: 'Simple del n.º 14 al 18' }],
    epoca: 'Verano',
    horario: 'Todo el día',
    consejos: ['Exótica invasora: no se devuelve al agua.'],
  },
}

// Especies que no son objeto de pesca recreativa
const PROTEGIDA = 'Especie protegida o amenazada: no es objeto de pesca recreativa. Si se captura por accidente, hay que devolverla al agua de inmediato con el menor daño posible.'
const PEQUENA = 'No es objeto de pesca recreativa (pez pequeño sin interés deportivo). Si se captura por accidente, devolverla al agua.'
const INVASORA_PEQ = 'Pez exótico invasor sin interés deportivo; no es objeto de pesca. Si se captura, no puede devolverse al agua.'
export const NO_PESCABLE = {
  anguila: 'En peligro crítico. Su pesca recreativa está prohibida en casi todas las comunidades (solo se mantiene, muy limitada, la pesca profesional de angula en algunas zonas).',
  sabalo: PROTEGIDA,
  saboga: PROTEGIDA,
  lamprea_marina: 'Su captura recreativa está prohibida; solo existe pesca profesional regulada en algunos ríos gallegos.',
  pejerrey: PEQUENA,
  espinoso: PROTEGIDA,
  fraile: PROTEGIDA,
  burtaina: PROTEGIDA,
  samaruc: PROTEGIDA,
  fartet: PROTEGIDA,
  salinete: PROTEGIDA,
  jarabugo: PROTEGIDA,
  barbo_colirrojo: PROTEGIDA,
  barbo_montana: PROTEGIDA,
  loina: PROTEGIDA,
  madrija: PROTEGIDA,
  bermejuela: PROTEGIDA,
  sarda: PROTEGIDA,
  pardilla: PROTEGIDA,
  pardilla_oretana: PROTEGIDA,
  calandino: PROTEGIDA,
  cacho_valenciano: PROTEGIDA,
  bogardilla: PROTEGIDA,
  lobo_rio: PEQUENA,
  colmilleja: PROTEGIDA,
  lamprehuela: PROTEGIDA,
  colmilleja_alagon: PROTEGIDA,
  gambusia: INVASORA_PEQ,
  chanchito: INVASORA_PEQ,
  fundulo: INVASORA_PEQ,
  dojo: INVASORA_PEQ,
  pseudorasbora: INVASORA_PEQ,
  cacho_malagueno: PROTEGIDA,
  burtaina_garona: PROTEGIDA,
  lamprea_arroyo: PROTEGIDA,
  gobio_languedoc: PEQUENA,
  piscardo_languedoc: PEQUENA,
  piscardo_garona: PEQUENA,
  bermejuela_numantina: PROTEGIDA,
  bermejuela_esla: PROTEGIDA,
  bermejuela_salmantina: PROTEGIDA,
  bordallo_gallo: PROTEGIDA,
  colmilleja_valle: PROTEGIDA,
  colmilleja_atlantica: PROTEGIDA,
  aguja_rio: PEQUENA,
}

// ───────── cuándo pescar cada especie ─────────
// estaciones y tiempo: 2 = lo mejor, 1 = sigue activo pero menos, 0 = poco activo / poco favorable
// horas: franjas de las mejores horas [inicio, fin] en horas del día (pueden cruzar la medianoche)
const cal = (p, v, o, i, horas, [sol, nubes, nublado, lluvia]) => ({
  estaciones: { primavera: p, verano: v, otono: o, invierno: i },
  horas,
  tiempo: { soleado: sol, nubes, nublado, lluvia },
})
const CAL_BARBO = cal(1, 2, 1, 0, [[6, 9], [19, 23]], [1, 2, 2, 1])
const CAL_BOGA = cal(2, 1, 2, 0, [[9, 13], [16, 19]], [2, 2, 1, 0])
const CAL_CACHO = cal(2, 2, 1, 0, [[7, 11], [17, 20]], [2, 2, 1, 0])
const CAL_PEQUENOS = cal(2, 2, 1, 0, [[9, 13], [16, 19]], [2, 2, 1, 0])

export const CALENDARIO = {
  trucha: cal(2, 1, 1, 0, [[6, 10], [19, 22]], [0, 2, 2, 1]),
  salmon: cal(2, 1, 1, 0, [[6, 9], [20, 22]], [0, 1, 2, 2]),
  trucha_arcoiris: cal(2, 1, 2, 1, [[8, 12], [17, 20]], [1, 2, 2, 1]),
  salvelino: cal(1, 2, 1, 0, [[6, 10], [18, 21]], [0, 2, 2, 1]),
  barbo_comun: CAL_BARBO,
  barbo_graells: CAL_BARBO,
  barbo_gitano: CAL_BARBO,
  barbo_comizo: CAL_BARBO,
  barbo_cabecicorto: CAL_BARBO,
  barbo_mediterraneo: CAL_BARBO,
  boga_tajo: CAL_BOGA,
  boga_duero: CAL_BOGA,
  boga_guadiana: CAL_BOGA,
  madrilla: CAL_BOGA,
  cacho: CAL_CACHO,
  bordallo: CAL_CACHO,
  bagre: CAL_CACHO,
  tenca: cal(1, 2, 1, 0, [[5, 9], [20, 23]], [0, 2, 2, 1]),
  gobio: CAL_PEQUENOS,
  piscardo: CAL_PEQUENOS,
  alburno: CAL_PEQUENOS,
  rutilo: CAL_PEQUENOS,
  gardi: CAL_PEQUENOS,
  blicca: CAL_PEQUENOS,
  carpin: CAL_PEQUENOS,
  carpa_dorada: CAL_PEQUENOS,
  carpa_herbivora: cal(1, 2, 1, 0, [[8, 12], [17, 21]], [2, 2, 1, 0]),
  brema_comun: cal(1, 2, 1, 0, [[19, 24]], [0, 2, 2, 1]),
  aspio: cal(2, 1, 2, 0, [[6, 10], [18, 21]], [1, 2, 1, 0]),
  hucho: cal(1, 0, 2, 2, [[9, 16]], [0, 1, 2, 1]),
  lisa: cal(1, 2, 2, 0, [[7, 10], [18, 21]], [1, 2, 1, 0]),
  platija: cal(1, 0, 2, 2, [[6, 10], [16, 20]], [0, 1, 2, 1]),
  carpa: cal(2, 2, 1, 0, [[21, 2], [5, 8]], [1, 2, 2, 1]),
  black_bass: cal(2, 1, 2, 0, [[6, 9], [19, 22]], [1, 2, 2, 1]),
  lucio: cal(1, 0, 2, 2, [[9, 16]], [0, 1, 2, 1]),
  lucioperca: cal(1, 0, 2, 2, [[18, 23], [5, 8]], [0, 1, 2, 1]),
  perca: cal(2, 1, 2, 1, [[8, 12], [15, 18]], [1, 2, 1, 0]),
  siluro: cal(1, 2, 1, 0, [[21, 4]], [0, 1, 2, 2]),
  pez_gato_negro: cal(1, 2, 1, 0, [[20, 2]], [0, 1, 2, 1]),
  pez_gato_punteado: cal(1, 2, 1, 0, [[21, 3]], [0, 1, 2, 1]),
  percasol: cal(1, 2, 1, 0, [[10, 18]], [2, 2, 1, 0]),
}
