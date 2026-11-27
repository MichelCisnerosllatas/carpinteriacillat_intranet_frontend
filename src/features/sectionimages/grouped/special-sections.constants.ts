// "Secciones especiales": secciones de la web que tienen pantallas propias en el intranet
// (fotos agrupadas por item en un acordeón). Ver grouped/README.md.
// Usa SIEMPRE estos helpers en vez de comparar el texto ('service_showcase', 'category_coverflow',
// 'restoration_compare', 'work_gallery') a mano.

/** `type_section.typesection_key` del hero de la página Servicios (cada item = un servicio con sus fotos). */
export const SERVICE_SHOWCASE_TYPE_KEY = 'service_showcase'

/** `type_section.typesection_key` del carrusel «Muebles a medida» de Servicios (cada item = una categoría). */
export const CATEGORY_COVERFLOW_TYPE_KEY = 'category_coverflow'

/**
 * `type_section.typesection_key` del comparador «Restauración» de Servicios ("02").
 * NO usa la vista agrupada: muestra los trabajos de tipo restauración de la Galería (web_works).
 * Lo usa la pestaña "Trabajos" del detalle de la sección (features/sections/ui/detail/tabs/works).
 */
export const RESTORATION_COMPARE_TYPE_KEY = 'restoration_compare'

/**
 * `type_section.typesection_key` de la «Galería» de trabajos (página /gallery).
 * NO usa la vista agrupada: muestra los trabajos de la Galería (web_works).
 * Lo usa la pestaña "Trabajos" del detalle de la sección (features/sections/ui/detail/tabs/works).
 */
export const WORK_GALLERY_TYPE_KEY = 'work_gallery'

/** true si la sección es el hero de Servicios. */
export function isServiceShowcaseSection(typesectionKey?: string | null): boolean {
  return typesectionKey === SERVICE_SHOWCASE_TYPE_KEY
}

/** true si la sección es el carrusel de categorías «Muebles a medida». */
export function isCategoryCoverflowSection(typesectionKey?: string | null): boolean {
  return typesectionKey === CATEGORY_COVERFLOW_TYPE_KEY
}

/** true si la sección usa la vista agrupada de fotos (hero de Servicios o carrusel de categorías). */
export function isGroupedImagesSection(typesectionKey?: string | null): boolean {
  return isServiceShowcaseSection(typesectionKey) || isCategoryCoverflowSection(typesectionKey)
}

/** true si la sección es el comparador antes/después «Restauración» (trabajos de la Galería). */
export function isRestorationCompareSection(typesectionKey?: string | null): boolean {
  return typesectionKey === RESTORATION_COMPARE_TYPE_KEY
}

/** true si la sección es la «Galería» de trabajos (trabajos de la Galería). */
export function isWorkGallerySection(typesectionKey?: string | null): boolean {
  return typesectionKey === WORK_GALLERY_TYPE_KEY
}
