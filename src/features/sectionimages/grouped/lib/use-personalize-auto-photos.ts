'use client'

// SOLO carrusel «Muebles a medida» y «Restauración».
// Botón "Personalizar fotos": copia las fotos automáticas de un item a la sección (sections_images)
// para que el admin pueda ocultarlas, ordenarlas o cambiarlas. Ver grouped/README.md → "Fotos automáticas".

import { formatDatetime } from '@/shared/lib/utils'
import { swalConfirmAction } from '@/shared/lib/swal'
import { toastError, toastSuccess } from '@/shared/lib/toast'
import type { SectionItemApiItem } from '@/features/section-items/model/sectionitemget.dto'
import { sectionImagesService } from '../../services/sectionimages.service'
import { buildFurnitureGalleryLink } from '../coverflow/coverflow-links'
import type { AutoPhoto } from './auto-photos'

/**
 * Devuelve `personalize(item, fotos)`: pide confirmación y crea una imagen de sección por cada
 * foto automática (en el mismo orden). Al terminar llama a `onDone` (recargar).
 * `extraText` se agrega a la pregunta (ej. en Reordenar: "se perderá el orden sin confirmar").
 */
export function usePersonalizeAutoPhotos(idSection: number, onDone: () => Promise<unknown> | void) {
  const personalize = async (item: SectionItemApiItem, photos: AutoPhoto[], extraText = '') => {
    if (photos.length === 0) return

    await swalConfirmAction({
      title: '¿Copiar estas fotos a la sección?',
      text: `Luego podrás ocultarlas, ordenarlas o cambiarlas. ${extraText}`.trim(),
      confirmText: 'Sí, copiar',
      loading: { title: 'Copiando fotos...' },
      action: async ({ close, showError }) => {
        let created = 0
        try {
          // Una por una (en orden): así quedan en el mismo orden que las automáticas
          for (const photo of photos) {
            const res = await sectionImagesService.post({
              id_section: idSection,
              id_section_item: item.id_section_item,
              id_image: photo.imageId,
              sectionimage_link: buildFurnitureGalleryLink(photo.idFurniture),
              sectionimage_title: photo.furnitureTitle,
              // Restauración: 'before' / 'after'. Categoría: sin variante.
              sectionimage_variant: photo.variant,
              sectionimage_state: 1,
              sectionimage_created_at: formatDatetime(),
            })
            if (!res.success) break
            created++
          }
        } catch {
          // Se informa abajo con lo que se alcanzó a crear
        }

        // Se recarga siempre (aunque haya fallado a la mitad, para ver lo que sí se creó)
        await onDone()

        if (created === photos.length) {
          toastSuccess('Fotos copiadas', `${created} foto(s) ahora son propias y se pueden editar.`)
          close()
        } else {
          toastError('Error', `Solo se copiaron ${created} de ${photos.length} foto(s).`)
          showError('No se pudieron copiar todas las fotos.')
        }
      },
    })
  }

  return { personalize }
}
