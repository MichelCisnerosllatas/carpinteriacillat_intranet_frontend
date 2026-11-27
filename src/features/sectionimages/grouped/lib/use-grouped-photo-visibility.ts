'use client'

// Vista agrupada (hero de Servicios y carrusel de categorías).
// Hook para Ocultar / Mostrar fotos (una o varias) y guardar el orden "ocultas al final".
// Lo general de imágenes de sección vive fuera de esta carpeta (ver grouped/README.md).

import { useState } from 'react'
import { toastError, toastSuccess } from '@/shared/lib/toast'
import { useSectionImageDeleteStore } from '../../stores/useSectionImageDeleteStore'
import { useSectionImageReorderStore } from '../../stores/useSectionImageReorderStore'
import type { SectionImage } from '../../data/schema'
import type { GroupedSectionConfig } from '../grouped-section.config'
import { buildGroupedOrderIds } from './sort-hidden-last'

/**
 * Ocultar / Mostrar fotos de la vista agrupada.
 * Pasos: 1) PATCH de estado de cada foto (en paralelo, store existente)
 *        2) UN solo reorden con el orden completo de la sección (ocultas al final de su item).
 * Los stores ya recargan la lista al terminar. `reload` se usa solo si algo falla a medias.
 */
export function useGroupedPhotoVisibility(config: GroupedSectionConfig, idSection: number, reload: () => Promise<unknown>) {
  const bulkToggleState = useSectionImageDeleteStore((s) => s.bulkToggleState)
  const confirmOrder = useSectionImageReorderStore((s) => s.confirm)
  const [isSaving, setIsSaving] = useState(false)

  /**
   * `photos`: todas las fotos de la sección, ya ordenadas. `itemIds`: items en su orden.
   * `ids`: fotos a cambiar. `newState`: 1 = mostrar, 0 = ocultar. Devuelve true si todo salió bien.
   */
  const changeState = async (photos: SectionImage[], itemIds: number[], ids: number[], newState: number) => {
    // Solo las que de verdad cambian (ej. al ocultar, se ignoran las que ya estaban ocultas)
    const toChange = photos.filter((p) => ids.includes(p.id) && p.stateValue !== newState).map((p) => p.id)
    if (toChange.length === 0) return true

    // El nuevo orden se calcula ANTES de recargar, con la lista actual
    const orderedIds = buildGroupedOrderIds(photos, itemIds, toChange, newState)
    const count = toChange.length

    setIsSaving(true)
    try {
      // 1) Estado de cada foto
      const okState = await bulkToggleState(toChange, newState)
      if (!okState) {
        await reload()
        toastError('Error', 'No se pudo cambiar el estado de las fotos.')
        return false
      }

      // 2) Un solo reorden de toda la sección
      const okOrder = await confirmOrder(idSection, orderedIds)
      if (!okOrder) {
        toastError('Error', 'Se cambió el estado, pero no se pudo guardar el nuevo orden.')
        return false
      }

      if (newState === 1) toastSuccess(count === 1 ? 'Foto visible' : `${count} fotos visibles`, `Quedaron al final de las visibles de su ${config.itemLower}.`)
      else toastSuccess(count === 1 ? 'Foto oculta' : `${count} fotos ocultas`, `Pasaron al final de su ${config.itemLower}.`)
      return true
    } finally {
      setIsSaving(false)
    }
  }

  return { changeState, isSaving }
}
