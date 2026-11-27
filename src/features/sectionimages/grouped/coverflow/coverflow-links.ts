// SOLO para el carrusel «Muebles a medida» (category_coverflow).
// Funciones puras para "enlazar" una tarjeta con su categoría y una foto con su trabajo de la Galería.
// Ver grouped/README.md → "Carrusel de categorías".

/** `sectionitem_type` de cada tarjeta del carrusel. */
export const CATEGORY_ITEM_TYPE = 'category'

/** Prefijo del `sectionitem_key` de una tarjeta: 'category-<id_category>'. */
const CATEGORY_KEY_PREFIX = 'category-'

/** Prefijo del `sectionimage_link` de una foto que viene de un trabajo: '/gallery/<id_web_work>'. */
const WORK_LINK_PREFIX = '/gallery/'

/** Clave de la tarjeta de una categoría (ej. 12 → 'category-12'). */
export function buildCategoryItemKey(idCategory: number): string {
  return `${CATEGORY_KEY_PREFIX}${idCategory}`
}

/** id de la categoría guardado en la clave ('category-12' → 12). null si la clave no trae id. */
export function getCategoryIdFromKey(key?: string | null): number | null {
  if (!key || !key.startsWith(CATEGORY_KEY_PREFIX)) return null
  const id = Number(key.slice(CATEGORY_KEY_PREFIX.length))
  return Number.isInteger(id) && id > 0 ? id : null
}

/** Enlace de una foto que viene de un trabajo (ej. 7 → '/gallery/7'). */
export function buildWorkGalleryLink(idWebWork: number): string {
  return `${WORK_LINK_PREFIX}${idWebWork}`
}

/** id del trabajo guardado en el enlace ('/gallery/7' → 7). null si el enlace no es de un trabajo. */
export function getWorkIdFromLink(link?: string | null): number | null {
  if (!link || !link.startsWith(WORK_LINK_PREFIX)) return null
  const id = Number(link.slice(WORK_LINK_PREFIX.length))
  return Number.isInteger(id) && id > 0 ? id : null
}
