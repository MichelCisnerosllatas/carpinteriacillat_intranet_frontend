'use client'

// Secciones especiales: hero de Servicios (service_showcase) y carrusel de categorías (category_coverflow).
// Decide en qué modo está el formulario de item: "hero", "categoría" o general (según la sección elegida).
// Ver features/sectionimages/grouped/README.md → "Formulario de item (servicio)".

import { useSectionTypeKey } from '@/features/sectionimages/lib/use-section-type-key'
import { isCategoryCoverflowSection, isServiceShowcaseSection } from '@/features/sectionimages/grouped/special-sections.constants'

/** Tipo de item (`sectionitem_type`) que usan los servicios del hero. */
export const SHOWCASE_ITEM_TYPE = 'showcase'

/**
 * `isShowcase` = la sección elegida es el hero de Servicios.
 * `isCategoryCoverflow` = la sección elegida es el carrusel «Muebles a medida» (modo "Categoría", ver ../category).
 * `isChecking` = todavía se está averiguando el tipo de la sección (mostrar "Cargando...").
 * `typeKey`    = `typesection_key` de la sección (o null si no hay / no se sabe).
 */
export function useShowcaseItemMode(idSection: number | null | undefined) {
  const { typeKey, hasLoaded } = useSectionTypeKey(idSection)
  return {
    isShowcase: isServiceShowcaseSection(typeKey),
    isCategoryCoverflow: isCategoryCoverflowSection(typeKey),
    isChecking: !hasLoaded,
    // Tipo de la sección, para que el form general sepa qué tipos de item permite
    // (ver data/item-types-by-section.ts). Así no se pide la sección dos veces.
    typeKey,
  }
}
