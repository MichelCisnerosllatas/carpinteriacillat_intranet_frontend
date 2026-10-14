// SOLO para el hero de Servicios (config.hideItemWithoutVisiblePhotos = true).
// Regla: si a un servicio OCULTO se le agrega una foto visible (formulario de imagen),
// el servicio vuelve a mostrarse. (Ocultar/mostrar fotos en la pestaña Imágenes ya lo hace
// sync-service-visibility.ts; esto cubre el formulario "Agregar imagen" / editar imagen.)

import { sectionItemsService } from '@/features/section-items/services/sectionitems.service'
import { useSectionItemDeleteStore } from '@/features/section-items/stores/useSectionItemDeleteStore'

/** Muestra el servicio (state 1) si estaba oculto. Devuelve true si lo mostró. */
export async function showServiceIfHidden(idSectionItem: number): Promise<boolean> {
  try {
    const res = await sectionItemsService.getById(idSectionItem)
    // Ya visible (o no se pudo leer): no se toca
    if (!res.success || res.data.sectionitem_state === 1) return false
    return await useSectionItemDeleteStore.getState().toggleState(idSectionItem, 1)
  } catch {
    return false
  }
}
