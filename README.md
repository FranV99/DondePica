# DóndePica 🎣

**¿Dónde pica? El mapa abierto de la pesca en agua dulce en España.**

Descubre qué peces viven en cada río, embalse, laguna o balsa, aprende a pescarlos (cebos,
señuelos, mejor época y horas) y consulta la normativa de tu comunidad autónoma. Y si falta un
pez o conoces un truco, **añádelo**: DóndePica lo hacemos entre todos.

> La pregunta que se hace todo pescador antes de salir: ¿dónde pica? Este mapa intenta responderla entre todos.

Hecho con **Vite + React + Leaflet**. Código con licencia **MIT** y datos con licencia **CC BY 4.0**.

## Qué puedes hacer

- 🗺️ **Explorar** más de 7.000 masas de agua de la península y buscarlas por nombre o por pueblo.
- 🐟 **Descubrir** 86 especies: autóctonas, endémicas, exóticas e invasoras, con su estado de
  conservación, variedades (carpa espejo, royal, koi…) y dónde viven.
- 🎣 **Aprender a pescarlas**: modalidades, caña, carrete, línea, cebos y señuelos con fotos, mejor
  época, horas y tiempo.
- 📜 **Consultar la normativa** de las 15 comunidades autónomas peninsulares.
- 🤝 **Contribuir** desde la propia aplicación: el botón *Contribuir* abre un issue de GitHub ya
  rellenado, o te deja enviarlo por correo o copiar el texto.

## Arrancarlo

Requiere Node.js 20 o superior.

```bash
npm install
npm run dev        # http://localhost:5173
```

En Windows con PowerShell usa `npm.cmd` en lugar de `npm`. Para la versión publicable:
`npm run build` (carpeta `dist/`).

### Antes de publicarlo

Pon la dirección de tu repositorio y tu correo en `src/lib/contribuir.js` (`PROYECTO.repo` y
`PROYECTO.correo`). De ahí salen todos los enlaces de *Contribuir*.

## Contribuir

Lee [CONTRIBUTING.md](CONTRIBUTING.md). Resumen: no hace falta programar; usa el botón
*Contribuir* de la app. Si programas, haz un fork, una rama y un pull request citando la fuente de
los datos.

## Todas las masas de agua de la península

La app trae masas de agua revisadas una a una. Para añadir **todas** las masas de agua dulce con
nombre (ríos, arroyos, embalses, lagos, lagunas, humedales y balsas) se descargan de la
hidrografía oficial del **Instituto Geográfico Nacional** ([api-features.idee.es](https://api-features.idee.es)):

```bash
npm run datos            # ríos (1ª a 4ª jerarquía), embalses, lagos, lagunas y balsas
npm run datos:arroyos    # opcional: además, todos los arroyos con nombre
npm run datos:construir  # regenera los archivos sin descargar nada
```

Si se corta, vuelve a ejecutar el mismo comando y continúa donde lo dejó. Las especies de estas
masas se **estiman automáticamente** (`src/lib/reglas.js`) según la cuenca, el río, la altitud y el
tipo de masa de agua.

## Estructura

```
src/
  data/especies.js     especies (origen, UICN, variedades…)
  data/masas.js        masas de agua revisadas y sus especies
  data/tecnicas.js     cómo se pesca cada especie y su calendario
  data/normativa.js    normativa de pesca por comunidad autónoma
  data/fotos*.js       fotos con autor y licencia
  lib/reglas.js        estimación de especies por cuenca, río, altitud y tipo
  lib/contribuir.js    repositorio, correo y plantillas de aportación
  components/          Navbar, PanelLateral, MapView, PanelInfo, FichaEspecie, Contribuir…
scripts/               descarga de masas de agua (IGN) y fotos de cebos
```

## Sobre los datos

La asignación de especies es **orientativa**. Se basa en la distribución conocida por cuenca
(Doadrio, *Atlas y Libro Rojo de los Peces Continentales de España*; Enciclopedia Virtual de los
Vertebrados Españoles, MNCN-CSIC; y bibliografía posterior), el Catálogo Español de Especies
Exóticas Invasoras (RD 630/2013) y el Catálogo Español de Especies Amenazadas (RD 139/2011).
Antes de pescar, consulta siempre la normativa vigente de tu comunidad autónoma.

Fotos: Wikimedia Commons e iNaturalist (autor y licencia en cada ficha). Mapas: IGN, Natural
Earth, © colaboradores de OpenStreetMap y Esri.
