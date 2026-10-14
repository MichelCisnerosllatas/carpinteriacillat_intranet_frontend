// SOLO para el comparador «Restauración» de Servicios (restoration_compare, "02").
// Funciones puras para "enlazar" una tarjeta (item) con su mueble y para las fotos Antes/Después.
// El enlace de una foto con su mueble ('/gallery/<id>') es el mismo del carrusel: ver ../coverflow/coverflow-links.ts.
// Ver grouped/README.md → "Restauración".

/** `sectionitem_type` de cada tarjeta (trabajo) de restauración. */
export const RESTORATION_ITEM_TYPE = 'restoration'

/** Prefijo del `sectionitem_key` de una tarjeta: 'furniture-<id_furniture>'. */
const RESTORATION_KEY_PREFIX = 'furniture-'

/** Valores de `sectionimage_variant` de una foto de restauración. */
export type RestorationPhotoVariant = 'before' | 'after'

/** Opciones del campo "Tipo de foto" (y texto del badge en la vista agrupada). */
export const RESTORATION_PHOTO_VARIANTS: { value: RestorationPhotoVariant; label: string }[] = [
  { value: 'before', label: 'Antes' },
  { value: 'after', label: 'Después' },
]

/** Clave de la tarjeta de un mueble (ej. 7 → 'furniture-7'). */
export function buildRestorationItemKey(idFurniture: number): string {
  return `${RESTORATION_KEY_PREFIX}${idFurniture}`
}

/** id del mueble guardado en la clave ('furniture-7' → 7). null si la clave no trae id. */
export function getFurnitureIdFromRestorationKey(key?: string | null): number | null {
  if (!key || !key.startsWith(RESTORATION_KEY_PREFIX)) return null
  const id = Number(key.slice(RESTORATION_KEY_PREFIX.length))
  return Number.isInteger(id) && id > 0 ? id : null
}

/** true si el texto es 'before' o 'after'. */
export function isRestorationPhotoVariant(value?: string | null): value is RestorationPhotoVariant {
  return value === 'before' || value === 'after'
}

/** Foto de la galería de un mueble (solo lo que hace falta para saber si es Antes/Después). */
type GalleryPhotoLike = {
  furnitureimage_state: number
  web: { furnitureimageweb_variant: string | null } | null
}

/** ¿El mueble tiene al menos una foto "Antes" y una "Después" visibles en su galería? */
export function hasBeforeAndAfterPhotos(gallery?: GalleryPhotoLike[] | null): boolean {
  const visible = (gallery ?? []).filter((g) => g.furnitureimage_state === 1)
  const hasBefore = visible.some((g) => g.web?.furnitureimageweb_variant === 'before')
  const hasAfter = visible.some((g) => g.web?.furnitureimageweb_variant === 'after')
  return hasBefore && hasAfter
}
