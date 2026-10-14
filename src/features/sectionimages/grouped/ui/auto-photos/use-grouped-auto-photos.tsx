'use client'

// SOLO carrusel «Muebles a medida» y «Restauración» (config.autoPhotos).
// Junta todo lo de "Fotos automáticas" para un item: el bloque (GroupedAutoPhotos) y el texto del
// contador del encabezado. Lo usan la pestaña Imágenes (GroupedImagesManager) y Reordenar
// (GroupedReorderBoard), así no se repite. En el hero (autoPhotos: null) no pinta nada.
// Ver grouped/README.md → "Fotos automáticas".

import type { ReactNode } from 'react'
import type { SectionItemApiItem } from '@/features/section-items/model/sectionitemget.dto'
import type { SectionImage } from '../../../data/schema'
import type { LightboxSlide } from '../../../lib/lightbox-slides'
import type { GroupedSectionConfig } from '../../grouped-section.config'
import { getFurnitureIdFromRestorationKey } from '../../restoration/restoration-links'
import { autoPhotosToSlides, getMissingRestorationVariants } from '../../lib/auto-photos'
import { getAutoPhotosCounter, getRestorationMissingText } from '../../lib/auto-photos-texts'
import { useAutoPhotos } from '../../lib/use-auto-photos'
import { usePersonalizeAutoPhotos } from '../../lib/use-personalize-auto-photos'
import { GroupedAutoPhotos } from './grouped-auto-photos'

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

  const forItem = (item: SectionItemApiItem, ownPhotos: SectionImage[]): ItemAutoPhotos => {
    const mode = auto.mode
    if (!mode) return { block: undefined, counter: null }

    const result = auto.getFor(item, ownPhotos)

    // Restauración, trabajo SIN mueble (clave null): solo cuenta con sus fotos propias.
    // Si le falta la «Antes» o la «Después» visible, se avisa (la web no mostrará la tarjeta).
    const hasFurniture = getFurnitureIdFromRestorationKey(item.sectionitem_key) != null
    const missingWarning = mode === 'restoration' && !hasFurniture
      ? getRestorationMissingText(getMissingRestorationVariants(ownPhotos, []))
      : null

    const block = (
      <GroupedAutoPhotos
        config={config}
        mode={mode}
        result={result}
        isLoading={auto.isLoading}
        isError={auto.isError}
        hasOwnPhotos={ownPhotos.length > 0}
        onOpenPhoto={(photos, index) => onOpenSlides(autoPhotosToSlides(photos), index)}
        onPersonalize={() => void personalize(item, result.photos, personalizeExtraText)}
        missingWarning={missingWarning}
      />
    )
    return { block, counter: getAutoPhotosCounter(mode, ownPhotos, result) }
  }

  return { forItem }
}
