// SOLO para la sección hero de Servicios (service_showcase).
// Funciones puras para el enlace del botón de un servicio (sin React, fáciles de leer y probar).

/** Enlace a la galería con todos los trabajos. */
export const GALLERY_LINK = '/gallery'

/** Inicio del enlace a la galería filtrada por categoría: "/gallery?cat=<Nombre>". */
const CATEGORY_LINK_PREFIX = '/gallery?cat='

/**
 * A dónde lleva el botón:
 * - gallery:  galería completa
 * - category: galería filtrada por una categoría
 * - none:     sin botón (enlace vacío)
 * - custom:   enlace escrito a mano en "Opciones avanzadas"
 */
export type ShowcaseLinkMode = 'gallery' | 'category' | 'none' | 'custom'

/** Arma el enlace de una categoría. Se usa el nombre tal cual (la web lo lee así; el navegador lo codifica). */
export function buildCategoryLink(categoryName: string): string {
  return `${CATEGORY_LINK_PREFIX}${categoryName}`
}

/** Nombre de la categoría de un enlace "/gallery?cat=X", o null si el enlace no es de ese tipo. */
export function getLinkCategory(link: string): string | null {
  if (!link.startsWith(CATEGORY_LINK_PREFIX)) return null
  const name = link.slice(CATEGORY_LINK_PREFIX.length)
  // Por si el enlace se guardó codificado (ej. "Restauraci%C3%B3n")
  try { return decodeURIComponent(name) } catch { return name }
}

/** Detecta la opción a partir del enlace guardado (para mostrar el radio correcto al editar). */
export function detectLinkMode(link: string | null | undefined, categoryNames: string[]): ShowcaseLinkMode {
  const value = (link ?? '').trim()
  if (value === '') return 'none'
  if (value === GALLERY_LINK) return 'gallery'

  // "/gallery?cat=X" solo cuenta como categoría si X es una categoría activa que existe
  const category = getLinkCategory(value)
  if (category !== null && categoryNames.includes(category)) return 'category'

  return 'custom'
}
