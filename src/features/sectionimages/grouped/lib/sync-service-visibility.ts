// SOLO para el hero de Servicios (config.hideItemWithoutVisiblePhotos = true).
// Regla: un servicio SIN fotos visibles no tiene nada que mostrar en la web, así que se oculta solo.
// Y si a un servicio oculto se le vuelve a mostrar una foto, el servicio vuelve a mostrarse.

import type { SectionImage } from '../../data/schema'
import type { SectionItemApiItem } from '@/features/section-items/model/sectionitemget.dto'

/** Un servicio que debe cambiar de estado: 1 = mostrar, 0 = ocultar. */
export type ServiceStateChange = {
  service: SectionItemApiItem
  newState: number
}

/**
 * Calcula qué servicios deben cambiar de estado DESPUÉS de una acción sobre fotos.
 *
 * - `photosAfter`: cómo quedarían TODAS las fotos de la sección después de la acción
 *   (con el estado nuevo, o sin las fotos eliminadas).
 * - `affectedIds`: fotos que se tocaron (solo se revisan los servicios de esas fotos).
 *
 * Función pura (no llama a la API): solo devuelve la lista de cambios.
 */
export function getServiceStateChanges(
  services: SectionItemApiItem[],
  photosBefore: SectionImage[],
  photosAfter: SectionImage[],
  affectedIds: number[],
): ServiceStateChange[] {
  // Servicios que tenían alguna de las fotos tocadas
  const affectedServiceIds = new Set(
    photosBefore
      .filter((p) => affectedIds.includes(p.id) && p.idSectionItem != null)
      .map((p) => p.idSectionItem as number),
  )

  const changes: ServiceStateChange[] = []

  for (const service of services) {
    if (!affectedServiceIds.has(service.id_section_item)) continue

    const visibleAfter = photosAfter.filter(
      (p) => p.idSectionItem === service.id_section_item && p.stateValue === 1,
    ).length
    const isVisible = service.sectionitem_state === 1

    // Se quedó sin fotos visibles → ocultar el servicio
    if (visibleAfter === 0 && isVisible) changes.push({ service, newState: 0 })
    // Volvió a tener fotos visibles y estaba oculto → mostrar el servicio
    if (visibleAfter > 0 && !isVisible) changes.push({ service, newState: 1 })
  }

  return changes
}

/** Cómo quedan las fotos si a `ids` se les pone `newState` (sin tocar la API). */
export function photosWithState(photos: SectionImage[], ids: number[], newState: number): SectionImage[] {
  return photos.map((p) => (ids.includes(p.id) ? { ...p, stateValue: newState } : p))
}

/** Cómo quedan las fotos si se eliminan `ids` (sin tocar la API). */
export function photosWithout(photos: SectionImage[], ids: number[]): SectionImage[] {
  return photos.filter((p) => !ids.includes(p.id))
}

/** Texto para avisar en la confirmación qué servicios cambiarán (vacío si ninguno). */
export function describeServiceChanges(changes: ServiceStateChange[], getName: (s: SectionItemApiItem) => string): string {
  const hidden = changes.filter((c) => c.newState === 0).map((c) => `«${getName(c.service)}»`)
  const shown = changes.filter((c) => c.newState === 1).map((c) => `«${getName(c.service)}»`)

  const parts: string[] = []
  if (hidden.length) parts.push(`El servicio ${hidden.join(', ')} se quedará sin fotos visibles y también se ocultará.`)
  if (shown.length) parts.push(`El servicio ${shown.join(', ')} volverá a mostrarse en la web.`)
  return parts.join(' ')
}
