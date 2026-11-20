# Cómo contribuir a DóndePica 🎣

¡Gracias por querer ayudar! DóndePica es un mapa **abierto**: cualquiera puede corregir datos,
añadir peces o masas de agua, compartir técnicas de pesca o mejorar el código. No hace falta
saber programar.

## Sin programar (lo más fácil)

Dentro de la aplicación pulsa **Contribuir** (arriba a la derecha, en la ficha de cada pez o en el
panel de cada masa de agua). Elige qué quieres aportar, rellena el formulario y envíalo:

- **Abrir issue en GitHub**: se abre un issue ya rellenado (necesitas una cuenta gratuita).
- **Enviar por correo** o **copiar el texto**, si no usas GitHub.

Qué puedes aportar:

| Aportación | Qué incluir |
| --- | --- |
| 🐟 Un pez que falta o sobra | Masa de agua, especie, fecha y, si puedes, una foto o cita (iNaturalist, un estudio…) |
| 💧 Una masa de agua nueva | Nombre, municipio o coordenadas y qué peces hay |
| 🎣 Un truco o técnica | Equipo, cebo o señuelo, dónde y cuándo funciona |
| 📜 Normativa | Enlace a la orden o boletín oficial y qué ha cambiado |
| 📷 Una foto libre | Súbela a Wikimedia Commons o iNaturalist (CC BY o CC BY-SA) y pega el enlace |
| 💡 Ideas y errores | Qué hiciste, qué esperabas y qué pasó |

## Programando

```bash
npm install
npm run dev     # http://localhost:5173
npm run lint    # antes de abrir un pull request
```

Dónde está cada cosa:

- `src/data/especies.js`: catálogo de especies (origen, UICN, variedades…).
- `src/data/masas.js`: masas de agua revisadas una a una y sus especies.
- `src/lib/reglas.js`: reglas que estiman las especies del resto de masas (por cuenca, río, altitud y tipo).
- `src/data/tecnicas.js`: cómo se pesca cada especie y su calendario.
- `src/data/normativa.js`: normativa de pesca por comunidad autónoma.
- `src/data/fotos.js` y `src/data/fotosCebos.js`: fotos con autor y licencia.
- `src/lib/contribuir.js`: repositorio, correo y plantillas del formulario «Contribuir».

Flujo: haz un *fork*, crea una rama (`git checkout -b añade-colmilleja-del-valle`), haz tus cambios,
comprueba `npm run lint` y `npm run build`, y abre un *pull request* explicando qué cambias y con
qué **fuente**.

## Normas de la comunidad

- **Cita siempre la fuente** de los datos (artículo, atlas, boletín oficial, observación con foto).
- Solo fotos con **licencia libre** y con su autor.
- Sé amable: hay gente que empieza a pescar y gente que lleva toda la vida. Todos aprendemos.
- Pesca responsable: respeta la normativa, las especies protegidas y la devolución obligatoria de
  las especies que lo requieran.

## Licencias

- Código: [MIT](LICENSE).
- Datos (`src/data`): CC BY 4.0.
- Fotos: la licencia de cada autor, indicada en la aplicación.
