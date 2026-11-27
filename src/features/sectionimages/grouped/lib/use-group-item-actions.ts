'use client'

// Vista agrupada (hero de Servicios y carrusel de categorías).
// Hook con las acciones del encabezado de un item (renombrar y Visible/Oculto).
// Lo general de imágenes de sección vive fuera de esta carpeta (ver grouped/README.md).

import { formatDatetime } from '@/shared/lib/utils'
import { toastError, toastSuccess } from '@/shared/lib/toast'
import { useSectionItemFormStore } from '@/features/section-items/stores/useSectionItemFormStore'
import { useSectionItemDeleteStore } from '@/features/section-items/stores/useSectionItemDeleteStore'
import type { SectionItemApiItem } from '@/features/section-items/model/sectionitemget.dto'
import { getGroupItemName, type GroupedSectionConfig } from '../grouped-section.config'
import type { ServiceStateChange } from './sync-service-visibility'

/**
 * Acciones del encabezado de un item (cambiar nombre y Visible/Oculto).
 * Se usan en la pestaña Imágenes y en "Reordenar". `reloadItems` refresca la lista al terminar.
 * Los textos salen de `config` ("Servicio visible" / "Categoría visible"...).
 */
export function useGroupItemActions(config: GroupedSectionConfig, reloadItems: () => Promise<unknown>) {
  const patchItem = useSectionItemFormStore((s) => s.patch)
  const toggleItemState = useSectionItemDeleteStore((s) => s.toggleState)

  const handleRename = async (item: SectionItemApiItem, title: string) => {
    const ok = await patchItem(item.id_section_item, { sectionitem_title: title, sectionitem_updated_at: formatDatetime() })
    if (ok) {
      await reloadItems()
      toastSuccess('Nombre actualizado', title)
    } else {
      toastError('Error', `No se pudo cambiar el nombre ${config.ofTheItem}.`)
    }
    return ok
  }

  const handleToggleVisible = async (item: SectionItemApiItem, visible: boolean) => {
    const ok = await toggleItemState(item.id_section_item, visible ? 1 : 0)
    if (ok) {
      await reloadItems()
      const title = visible ? `${config.itemLabel} visible` : `${config.itemLabel} ${config.hiddenLabel.toLowerCase()}`
      toastSuccess(title, getGroupItemName(config, item))
    } else {
      toastError('Error', `No se pudo cambiar la visibilidad ${config.ofTheItem}.`)
    }
  }

  /**
   * SOLO hero de Servicios (config.hideItemWithoutVisiblePhotos).
   * Aplica los cambios de estado que calcula `getServiceStateChanges` (ver sync-service-visibility.ts):
   * oculta los servicios que se quedaron sin fotos visibles y muestra los que volvieron a tener.
   * Se llama DESPUÉS de ocultar/mostrar/eliminar fotos. Con una lista vacía no hace nada.
   */
  const applyServiceStateChanges = async (changes: ServiceStateChange[]) => {
    if (changes.length === 0) return

    const results = await Promise.all(
      changes.map((c) => toggleItemState(c.service.id_section_item, c.newState)),
    )
    await reloadItems()

    changes.forEach((c, i) => {
      const name = getGroupItemName(config, c.service)
      if (!results[i]) toastError('Error', `No se pudo actualizar el servicio «${name}».`)
      else if (c.newState === 0) toastSuccess('Servicio oculto', `«${name}» no tiene fotos visibles.`)
      else toastSuccess('Servicio visible', `«${name}» volvió a tener fotos visibles.`)
    })
  }

  return { handleRename, handleToggleVisible, applyServiceStateChanges }
}
