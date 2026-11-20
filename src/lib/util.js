import { ESPECIES_POR_ID } from '../data/especies.js'

export const TIPOS = {
  rio: { label: 'Ríos', singular: 'Río' },
  arroyo: { label: 'Arroyos', singular: 'Arroyo' },
  embalse: { label: 'Embalses', singular: 'Embalse' },
  lago: { label: 'Lagos', singular: 'Lago' },
  laguna: { label: 'Lagunas', singular: 'Laguna' },
  humedal: { label: 'Humedales', singular: 'Humedal' },
  balsa: { label: 'Balsas', singular: 'Balsa o charca' },
}

/** Ids de especie de una masa de agua (las entradas pueden ser string u objeto {id, nota}). */
export const especieIds = (masa) => masa.especies.map((e) => (typeof e === 'string' ? e : e.id))

/** Especies de una masa con su ficha completa y la nota local, si la hay. */
export function especiesDe(masa) {
  return masa.especies
    .map((e) => {
      const id = typeof e === 'string' ? e : e.id
      const ficha = ESPECIES_POR_ID[id]
      return ficha ? { ...ficha, notaLocal: typeof e === 'string' ? null : e.nota } : null
    })
    .filter(Boolean)
}

/** Normaliza texto para búsquedas sin tildes. */
export const norm = (s) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
