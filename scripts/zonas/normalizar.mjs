// Normalización de las zonas de pesca de cada comunidad autónoma a un esquema común.
//
// Este módulo no importa nada a propósito: lo usa scripts/descargar-zonas.mjs, pero
// también se puede pegar tal cual en la consola del navegador.
//
// Categorías (campo `cat`):
//   r  Refugio o reserva: pesca prohibida (refugios, vedados, reservas genéticas)
//   l  Zona libre o sin muerte: se pesca sin permiso especial (a menudo devolviendo el pez)
//   c  Zona controlada o acotada: cotos, pesca controlada, cupos, permisos

export const CATEGORIAS = {
  r: { nombre: 'Refugio o reserva', corto: 'Refugio', desc: 'Pesca prohibida' },
  l: { nombre: 'Zona libre o sin muerte', corto: 'Libre / sin muerte', desc: 'Sin permiso especial; en muchas hay que devolver el pez' },
  c: { nombre: 'Zona controlada o acotada', corto: 'Controlada', desc: 'Cotos y tramos con permiso, cupos o normas propias' },
}

// ---------------------------------------------------------------- utilidades
const vacio = (v) => v == null || (typeof v === 'string' && /^[\s\-–]*$/.test(v))
const txt = (v) => (vacio(v) ? '' : String(v).replace(/\s+/g, ' ').trim())
// "RÍO HUERVA" → "Río Huerva" (solo si el texto entero está en mayúsculas)
const MENORES = new Set(['de', 'del', 'la', 'las', 'el', 'los', 'y', 'a', 'en', 'al', 'e', 'o'])
export function capitalizar(t) {
  t = txt(t)
  if (!t || t !== t.toUpperCase() || !/[A-ZÁÉÍÓÚÑ]/.test(t)) return t
  return t
    .toLowerCase()
    .split(' ')
    .map((p, i) => (i > 0 && MENORES.has(p) ? p : p.charAt(0).toUpperCase() + p.slice(1)))
    .join(' ')
}
const frase = (t) => {
  t = capitalizar(t)
  return t ? t.charAt(0).toUpperCase() + t.slice(1) : ''
}
const lim = (sup, inf) => {
  const a = txt(sup)
  const b = txt(inf)
  if (a && b && a === b) return a
  if (a && b) return `Desde ${a} hasta ${b}`
  return a || b
}
// pares [etiqueta, valor] sin valores vacíos
const pares = (lista) => lista.map(([k, v]) => [k, txt(v)]).filter(([, v]) => v)
const numero = (v) => {
  const n = typeof v === 'number' ? v : parseFloat(String(v ?? '').replace(',', '.'))
  return Number.isFinite(n) && n > 0 ? Math.round(n * 10) / 10 : null
}
// propiedad sin distinguir mayúsculas (los servicios cambian el formato de los nombres)
function prop(p, ...nombres) {
  for (const n of nombres) {
    if (p[n] != null) return p[n]
    const k = Object.keys(p).find((x) => x.toLowerCase() === n.toLowerCase())
    if (k) return p[k]
  }
  return null
}

// ---------------------------------------------------------------- geometría
// Douglas-Peucker sobre [lon, lat]
function simplificar(pts, tol) {
  if (pts.length <= 2) return pts
  const t2 = tol * tol
  const marcas = new Uint8Array(pts.length)
  marcas[0] = marcas[pts.length - 1] = 1
  const pila = [[0, pts.length - 1]]
  while (pila.length) {
    const [i, j] = pila.pop()
    const [ax, ay] = pts[i]
    const [bx, by] = pts[j]
    const dx = bx - ax
    const dy = by - ay
    const l2 = dx * dx + dy * dy
    let max = -1
    let idx = -1
    for (let k = i + 1; k < j; k++) {
      const [px, py] = pts[k]
      let u = l2 ? ((px - ax) * dx + (py - ay) * dy) / l2 : 0
      u = u < 0 ? 0 : u > 1 ? 1 : u
      const ex = ax + u * dx - px
      const ey = ay + u * dy - py
      const d = ex * ex + ey * ey
      if (d > max) {
        max = d
        idx = k
      }
    }
    if (max > t2) {
      marcas[idx] = 1
      pila.push([i, idx], [idx, j])
    }
  }
  return pts.filter((_, k) => marcas[k])
}
const R = 1e5
const redondear = (p) => [Math.round(p[0] * R) / R, Math.round(p[1] * R) / R]

// Une los trozos que comparten extremo (algunos servicios parten cada río en cientos de segmentos)
function unir(lineas) {
  if (lineas.length < 2) return lineas
  const k = (p) => `${p[0]},${p[1]}`
  const usadas = new Uint8Array(lineas.length)
  const porExtremo = new Map()
  lineas.forEach((l, i) => {
    for (const p of [l[0], l[l.length - 1]]) {
      const c = k(p)
      if (!porExtremo.has(c)) porExtremo.set(c, [])
      porExtremo.get(c).push(i)
    }
  })
  const res = []
  for (let i = 0; i < lineas.length; i++) {
    if (usadas[i]) continue
    usadas[i] = 1
    let l = lineas[i].slice()
    for (let lado = 0; lado < 2; lado++) {
      let sigue = true
      while (sigue) {
        sigue = false
        const c = k(l[l.length - 1])
        for (const j of porExtremo.get(c) || []) {
          if (usadas[j]) continue
          const m = lineas[j]
          if (k(m[0]) === c) l = l.concat(m.slice(1))
          else if (k(m[m.length - 1]) === c) l = l.concat(m.slice(0, -1).reverse())
          else continue
          usadas[j] = 1
          sigue = true
          break
        }
      }
      l.reverse()
    }
    res.push(l)
  }
  return res
}

/** GeoJSON (EPSG:4326) → { t: 'l' | 'p', c } simplificado, o null */
export function geometria(g, tol = 0.0001) {
  if (!g) return null
  // algunos WFS 2.0 devuelven [lat, lon]: en España la longitud va de -10 a 5 y la latitud de 27 a 44
  let primero = g.coordinates
  while (Array.isArray(primero?.[0])) primero = primero[0]
  const girar = Array.isArray(primero) && primero[0] > 20 && primero[1] < 10
  const limpiar = (linea) => {
    if (girar) linea = linea.map((p) => [p[1], p[0]])
    const s = simplificar(linea, tol).map(redondear)
    return s.filter((p, i) => i === 0 || p[0] !== s[i - 1][0] || p[1] !== s[i - 1][1])
  }
  if (g.type === 'LineString' || g.type === 'MultiLineString') {
    const lineas = unir((g.type === 'LineString' ? [g.coordinates] : g.coordinates).filter((l) => l && l.length)).map(limpiar).filter((l) => l.length >= 2)
    return lineas.length ? { t: 'l', c: lineas } : null
  }
  if (g.type === 'Polygon' || g.type === 'MultiPolygon') {
    // solo el anillo exterior de cada polígono
    const anillos = (g.type === 'Polygon' ? [g.coordinates] : g.coordinates).map((p) => limpiar(p[0])).filter((a) => a.length >= 4)
    return anillos.length ? { t: 'p', c: anillos } : null
  }
  return null
}

function caja(g) {
  let w = Infinity
  let s = Infinity
  let e = -Infinity
  let n = -Infinity
  for (const l of g.c)
    for (const [x, y] of l) {
      if (x < w) w = x
      if (x > e) e = x
      if (y < s) s = y
      if (y > n) n = y
    }
  return [w, s, e, n].map((v) => Math.round(v * 1e4) / 1e4)
}

// ---------------------------------------------------------------- fuentes
// Cada capa: { id, url (GeoJSON en EPSG:4326), conv(props) → { cat, sub, nom, rio, lim, reg, km } | null }

const WFS_CT = (capa) =>
  `https://sig.gencat.cat/ows/FAUNA/wfs?service=WFS&version=2.0.0&request=GetFeature&typeNames=FAUNA:${capa}&outputFormat=application/json&srsName=EPSG:4326`
const WFS_MD = (capa) =>
  `https://idem.comunidad.madrid/geoidem/Zonas/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=Zonas:${capa}&outputFormat=application/json&srsName=EPSG:4326`
const WFS_AR = (capa) =>
  `https://idearagon.aragon.es/Visor2D?service=WFS&version=1.0.0&request=GetFeature&typeName=VISOR2D:${capa}&outputFormat=application/json&srsName=EPSG:4326`
const WFS_NA = (capa) =>
  `https://idena.navarra.es/ogc/wfs?service=WFS&version=2.0.0&request=GetFeature&typeNames=IDENA:${capa}&outputFormat=application/json&srsName=EPSG:4326&count=20000`
const WFS_CL = (capa) =>
  `https://idecyl.jcyl.es/geoserver/am/wfs?service=WFS&version=2.0.0&request=GetFeature&typeNames=am:${capa}&outputFormat=application/json&srsName=EPSG:4326&count=50000`

// Madrid: todas sus capas comparten los mismos campos DS_*
const convMadrid = (cat, sub) => (p) => ({
  cat,
  sub,
  nom: txt(p.DS_NOMBRE),
  rio: txt(p.DS_NOMBRE),
  lim: '',
  reg: pares([
    ['Descripción', p.DS_DESCRIPCION],
    ['Acceso', p.DS_ACCESO === 'sin dato' ? '' : p.DS_ACCESO],
    ['Aguas trucheras', p.IT_TRUCHA === 'S' ? 'Sí' : p.IT_TRUCHA === 'N' ? 'No' : ''],
    ['Subcuenca', p.DS_SUBCUENCA],
  ]),
  km: numero(p.NM_LONG),
})

// Aragón: un único campo con el tipo de tramo
const TIPOS_AR = {
  VEDADOS: ['r', 'Vedado'],
  'VEDADOS TEMPORALES (CANAL)': ['r', 'Vedado temporal'],
  'CAPTURA Y SUELTA AGUAS TRUCHERAS': ['l', 'Libre en captura y suelta (aguas trucheras)'],
  'LIBRE EXTRACTIVO AGUAS TRUCHERAS': ['l', 'Libre extractivo (aguas trucheras)'],
  'AGUAS CIPRINÍCOLAS': ['l', 'Aguas ciprinícolas libres'],
  'COTOS SOCIALES CAPTURA Y SUELTA': ['c', 'Coto social en captura y suelta'],
  'COTOS DEPORTIVOS CIPRINÍCOLAS': ['c', 'Coto deportivo ciprinícola'],
  'COTOS DEPORTIVOS SALMONÍCOLAS': ['c', 'Coto deportivo salmonícola'],
  'PESCA INTENSIVA': ['c', 'Tramo de pesca intensiva'],
}

// Castilla y León: nombres de campo abreviados → etiqueta legible
function etiquetaCyL(k) {
  const muerte = (x) => (/SM/i.test(x) ? 'sin muerte' : /CM/i.test(x) ? 'con muerte' : '')
  let m = k.match(/^DP(\d)_pec_(SM|CM)$/i)
  if (m) return `Días de pesca ${muerte(m[2])} (periodo ${m[1]})`
  m = k.match(/^N_Per_d_(SM|CM)(\d)?$/i)
  if (m) return `Permisos por día ${muerte(m[1])}${m[2] ? ` (periodo ${m[2]})` : ''}`
  m = k.match(/^PER(\d)$/i)
  if (m) return `Periodo hábil ${m[1]}`
  return k
    .replace(/_/g, ' ')
    .replace(/\bTru(ch)?\b/gi, 'trucha')
    .replace(/\bCM\b/g, 'con muerte')
    .replace(/\bSM\b/g, 'sin muerte')
    .replace(/^\w/, (c) => c.toUpperCase())
}

// Castilla y León: campo CARFO
const TIPOS_CL = {
  REFUG: ['r', 'Refugio de pesca'],
  AAL: ['l', 'Aguas de acceso libre'],
  AAL_E: ['l', 'Acceso libre con excepción de fechas (trucha)'],
  ARE: ['l', 'Aguas en régimen especial'],
  AREC: ['c', 'Régimen especial con extracción controlada'],
  COTOP: ['c', 'Coto de pesca'],
  EDS: ['c', 'Escenario deportivo-social'],
}

export const FUENTES = [
  {
    cc: 'CT',
    nombre: 'Cataluña',
    organismo: 'Generalitat de Catalunya · Departament d’Agricultura (visor de pesca continental)',
    web: 'https://sig.gencat.cat/visors/Pesca.html',
    licencia: 'CC BY 4.0',
    capas: [
      {
        id: 'FAUNA_REFUGIS',
        url: WFS_CT('FAUNA_REFUGIS'),
        conv: (p) => {
          const esp = [p.ESPECIE, p.ESPECIE_2, p.ESPECIE_3, p.ESPECIE_4].map(txt).filter(Boolean)
          return {
            cat: 'r',
            sub: 'Refugio de pesca',
            nom: txt(p.NOM),
            rio: txt(p.NOM),
            lim: txt(p.LIMIT),
            reg: pares([
              ['Especies protegidas', esp.join(', ')],
              ['Cuenca', p.CONCA],
            ]),
            km: numero(p.KM),
          }
        },
      },
      {
        id: 'FAUNA_RGT',
        url: WFS_CT('FAUNA_RGT'),
        conv: (p) => ({
          cat: 'r',
          sub: 'Reserva genética de trucha',
          nom: txt(p.CURS_AIGUA),
          rio: txt(p.CURS_AIGUA),
          lim: txt(p.LIM_INF),
          reg: pares([['Código', p.ATRIBUT]]),
        }),
      },
      {
        id: 'FAUNA_ZONESLLIURESENSEMORT',
        url: WFS_CT('FAUNA_ZONESLLIURESENSEMORT'),
        conv: (p) => ({
          cat: 'l',
          sub: 'Zona libre sin muerte',
          nom: txt(p.RIU) ? frase(p.RIU) : txt(p.CODI_ZLLSM),
          rio: txt(p.RIU),
          lim: lim(p.LIMIT_SUPERIOR, p.LIMIT_INFERIOR),
          reg: pares([
            ['Código', p.CODI_ZLLSM],
            ['Periodo hábil', p.PERIODE_HABIL],
            ['Artes y cebos', p.ARTS_I_ESQUERS_PERMESOS],
            ['Observaciones', p.OBSERVACIO],
            ['Sociedad de pescadores', p.SOCIETAT_DE_PESCADORS],
            ['Municipio', p.MUNICIPI],
          ]),
          km: numero(p.LONGITUD_KM),
        }),
      },
      {
        id: 'FAUNA_ZONESPESCACONTROLADA',
        url: WFS_CT('FAUNA_ZONESPESCACONTROLADA'),
        conv: (p) => {
          const mod = txt(p.MODALITAT).toLowerCase()
          const permis = txt(p.PERMIS).toLowerCase().replace('salmònids', 'salmónidos')
          return {
            cat: 'c',
            sub: `Zona de pesca controlada${permis ? ` · ${permis}` : ''}${mod ? ` · ${mod.replace('sense mort', 'sin muerte').replace('amb mort', 'con muerte')}` : ''}`,
            nom: txt(p.NOM_ZPC),
            rio: txt(p.RIU),
            lim: lim(p.LIM_SUP, p.LIM_INF),
            reg: pares([
              ['Matrícula', p.MATRICULA],
              ['Periodo hábil', p.PER_HAB],
              ['Capturas por día', p.CAPTURES === '0' ? '0 (sin muerte)' : p.CAPTURES],
              ['Permisos por día', p.N_PERMISOS],
              ['Día de descanso', p.DIA_DESC === 'cap' ? 'Ninguno' : p.DIA_DESC],
              ['Artes y cebos', p.ART_ESQUER],
              ['Observaciones', p.OBSERVACIO],
              ['Sociedad de pescadores', p.SOC_PESC],
              ['Municipio', p.MUNICIPI],
            ]),
            km: numero(p.LONG_KM),
          }
        },
      },
    ],
  },
  {
    cc: 'MD',
    nombre: 'Comunidad de Madrid',
    organismo: 'Comunidad de Madrid · IDEM (Zonas sujetas a ordenación)',
    web: 'https://idem.comunidad.madrid',
    licencia: 'CC BY 4.0',
    capas: [
      { id: 'IDEM_MA_PESCA_VEDADOS', url: WFS_MD('IDEM_MA_PESCA_VEDADOS'), conv: convMadrid('r', 'Vedado de pesca') },
      { id: 'IDEM_MA_PESCA_VEDA_CUENTRA', url: WFS_MD('IDEM_MA_PESCA_VEDA_CUENTRA'), conv: convMadrid('r', 'Cuenca vedada') },
      { id: 'IDEM_MA_PESCA_CYS', url: WFS_MD('IDEM_MA_PESCA_CYS'), conv: convMadrid('l', 'Tramo libre de captura y suelta') },
      { id: 'IDEM_MA_PESCA_CYS_PRS', url: WFS_MD('IDEM_MA_PESCA_CYS_PRS'), conv: convMadrid('l', 'Captura y suelta (Parque Regional del Sureste)') },
      { id: 'IDEM_MA_PESCA_COTOS', url: WFS_MD('IDEM_MA_PESCA_COTOS'), conv: convMadrid('c', 'Coto de pesca') },
      { id: 'IDEM_MA_PESCA_CONTROL', url: WFS_MD('IDEM_MA_PESCA_CONTROL'), conv: convMadrid('c', 'Zona de pesca controlada') },
      { id: 'IDEM_MA_PESCA_EXPERIM', url: WFS_MD('IDEM_MA_PESCA_EXPERIM'), conv: convMadrid('c', 'Zona de pesca experimental') },
    ],
  },
  {
    cc: 'AR',
    nombre: 'Aragón',
    organismo: 'Gobierno de Aragón · IDEAragon (Pesca: clasificación de ríos y masas de agua)',
    web: 'https://www.aragon.es/-/pesca-folletos-informativos',
    licencia: 'CC BY 4.0',
    capas: [
      {
        id: 'v_rz_gestionpiscicola_es24',
        url: WFS_AR('v_rz_gestionpiscicola_es24'),
        conv: (p) => {
          const tipo = TIPOS_AR[txt(p.dsubtiptra).toUpperCase()]
          if (!tipo) return null
          return {
            cat: tipo[0],
            sub: tipo[1],
            nom: capitalizar(p.denominaci) || capitalizar(p.dnombre_tr),
            rio: (capitalizar(p.dnombre_tr) || capitalizar(p.dmasa)).replace(/^Bco\.?\s+/i, 'Barranco ').replace(/^Bº\s+/i, 'Barranco '),
            lim: '',
            reg: pares([
              ['Aguas trucheras', p.aguastruch === 'SI' ? 'Sí' : p.aguastruch === 'NO' ? 'No' : ''],
              ['Alta montaña', p.altamonta === 'SI' ? 'Sí' : ''],
              ['Pesca de cangrejo', p.cangrejo === 'SI' ? 'Sí' : p.cangrejo === 'NO' ? 'No' : ''],
              ['Masa', capitalizar(p.dmasa)],
              ['Cuenca', capitalizar(String(p.cuencahidr || '').replace(/_/g, ', '))],
            ]),
            km: numero(p.shape_len),
          }
        },
      },
    ],
  },
  {
    cc: 'NA',
    nombre: 'Navarra',
    organismo: 'Gobierno de Navarra · IDENA (Tramos de pesca)',
    web: 'https://idena.navarra.es',
    licencia: 'CC BY 4.0',
    capas: [
      {
        id: 'CAZAPE_Lin_Tramifica',
        url: WFS_NA('CAZAPE_Lin_Tramifica'),
        // en Navarra la capa clasifica todos los ríos por región piscícola; solo los tramos
        // salmoneros y las cuencas salmonícolas "de permiso" tienen una gestión específica
        conv: (p) => {
          const cuenca = txt(p.CUENCAPERM)
          const ts = p.IDCLASE === 'TS'
          if (!ts && (!cuenca || cuenca === 'Tramo salmonero')) return null
          return {
            cat: 'c',
            sub: ts ? 'Tramo salmonero' : `Cuenca de permiso · ${cuenca}`,
            nom: txt(p.CAUCE),
            rio: txt(p.CAUCE),
            lim: '',
            reg: pares([
              ['Región piscícola', p.CLASE],
              ['Permiso', ts ? 'Permiso específico para salmón' : `Permiso de pesca de la cuenca ${cuenca}`],
            ]),
            km: numero((p.GEOM_LONG || 0) / 1000),
          }
        },
      },
    ],
  },
  {
    cc: 'CL',
    nombre: 'Castilla y León',
    organismo: 'Junta de Castilla y León · IDECyL (Pesca CyL: tramos de pesca)',
    web: 'https://pescacastillayleon.es/visor/',
    licencia: 'CC BY 4.0',
    capas: [
      {
        id: 'pesca_cyl_tramos_v',
        url: WFS_CL('pesca_cyl_tramos_v'),
        conv: (p) => {
          const tipo = TIPOS_CL[txt(prop(p, 'CARFO')).toUpperCase()]
          if (!tipo) return null
          // el resto de campos de regulación se añaden de forma genérica
          const usados = /^(carfo|provincia|cod_prov|tm|utgc|cuenca|subcuenca|rio_mas_a|nom_tramo|lim_sup|lim_inf|long_km|long_m|sup_ha|anchura_m|proccapt|precisio|recursop|cartoprop|fechactu|observac|x_|y_|utm|coord|objectid|fid|id|shape|geom|globalid)/i
          const extra = Object.entries(p)
            .filter(([k, v]) => !usados.test(k) && !vacio(v) && typeof v !== 'object' && String(v).length < 300 && v !== 0 && v !== '0')
            .slice(0, 24)
            .map(([k, v]) => [etiquetaCyL(k), v])
          return {
            cat: tipo[0],
            sub: tipo[1],
            nom: txt(prop(p, 'NOM_TRAMO')) || txt(prop(p, 'Rio_Mas_A')),
            rio: txt(prop(p, 'Rio_Mas_A')),
            lim: lim(prop(p, 'LIM_SUP'), prop(p, 'LIM_INF')),
            reg: pares([['Provincia', prop(p, 'PROVINCIA')], ['Término municipal', prop(p, 'TM')], ...extra, ['Observaciones', prop(p, 'OBSERVAC')]]),
            km: numero(prop(p, 'LONG_KM')) ?? numero((prop(p, 'LONG_M') || 0) / 1000),
          }
        },
      },
    ],
  },
]

/**
 * Geometría compacta para el archivo final: cada línea o anillo es una lista plana de
 * enteros [x0, y0, dx1, dy1, …] en cienmilésimas de grado (≈1 m) con diferencias.
 */
export function codificar(g) {
  return [
    g.t,
    g.c.map((l) => {
      const r = []
      let px = 0
      let py = 0
      for (const [x, y] of l) {
        const ix = Math.round(x * R)
        const iy = Math.round(y * R)
        r.push(ix - px, iy - py)
        px = ix
        py = iy
      }
      return r
    }),
  ]
}

/** Convierte un FeatureCollection de una capa en zonas normalizadas */
export function normalizarCapa(fuente, capa, fc, tol) {
  const zonas = []
  let i = 0
  for (const f of fc.features || []) {
    i++
    const z = capa.conv(f.properties || {})
    if (!z) continue
    const g = geometria(f.geometry, tol)
    if (!g) continue
    zonas.push({ id: `${fuente.cc}-${capa.id.replace(/^.*?_/, '').toLowerCase()}-${f.id ? String(f.id).split('.').pop() : i}`, cc: fuente.cc, ...z, b: caja(g), g })
  }
  return zonas
}
