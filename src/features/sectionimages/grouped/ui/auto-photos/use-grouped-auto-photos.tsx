'use client'

// SOLO carrusel «Muebles a medida» (config.autoPhotos).
// Junta todo lo de "Fotos automáticas" para una tarjeta: el bloque (GroupedAutoPhotos) y el texto del
// contador del encabezado. Lo usan la pestaña Imágenes (GroupedImagesManager) y Reordenar
// (GroupedReorderBoard), así no se repite. En el hero (autoPhotos: false) no pinta nada.
// Ver grouped/README.md → "Fotos automáticas".

import type { ReactNode } from 'react'
import type { SectionItemApiItem } from '@/features/section-items/model/sectionitemget.dto'
import type { SectionImage } from '../../../data/schema'
import type { LightboxSlide } from '../../../lib/lightbox-slides'
import type { GroupedSectionConfig } from '../../grouped-section.config'
import { autoPhotosToSlides } from '../../lib/auto-photos'
import { getAutoPhotosCounter } from '../../lib/auto-photos-texts'
import { useAutoPhotos } from '../../lib/use-auto-photos'
import { usePersonalizeAutoPhotos } from '../../lib/use-personalize-auto-photos'
import { GroupedAutoPhotos } from './grouped-auto-photos'
import { useCan } from '@/features/auth/hooks/usePermission'

interface UseGroupedAutoPhotosOptions {
  config: GroupedSectionConfig
  idSection: number
  /** Abrir el visor en grande (lightbox.openSlides). */
  onOpenSlides: (slides: LightboxSlide[], index: number) => void
  /** Recargar después de "Personalizar fotos". */
  onReload: () => Promise<unknown> | void
  /** Texto extra para la confirmación de "Personalizar fotos" (ej. en Reordenar). */
  personalizeExtraText?: string
}

/** Lo que necesita cada item: el bloque de automáticas y el texto del contador. */
export type ItemAutoPhotos = {
  /** undefined si la sección no tiene fotos automáticas. */
  block: ReactNode | undefined
  /** Texto del contador en lugar de "N fotos" (null = el contador de siempre). */
  counter: string | null
}

export function useGroupedAutoPhotos({
  config, idSection, onOpenSlides, onReload, personalizeExtraText = '',
}: UseGroupedAutoPhotosOptions) {
  const auto = useAutoPhotos(config)
  const { personalize } = usePersonalizeAutoPhotos(idSection, onReload)
  // "Personalizar" crea imágenes de sección: solo con permiso de crear (ver ROLES_Y_PERMISOS.md)
  const canCreatePhotos = useCan('section_images.create')

  const forItem = (item: SectionItemApiItem, ownPhotos: SectionImage[]): ItemAutoPhotos => {
    if (!auto.enabled) return { block: undefined, counter: null }

    const photos = auto.getFor(item, ownPhotos)
    const block = (
      <GroupedAutoPhotos
        photos={photos}
        isLoading={auto.isLoading}
        isError={auto.isError}
        hasOwnPhotos={ownPhotos.length > 0}
        onOpenPhoto={(list, index) => onOpenSlides(autoPhotosToSlides(list), index)}
        onPersonalize={canCreatePhotos ? () => void personalize(item, photos, personalizeExtraText) : undefined}
      />
    )
    return { block, counter: getAutoPhotosCounter(ownPhotos, photos) }
  }

  return { forItem }
}
