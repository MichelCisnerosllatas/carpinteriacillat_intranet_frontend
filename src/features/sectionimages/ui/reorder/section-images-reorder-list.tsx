'use client'

import { LoaderCircle } from 'lucide-react'
import { useSectionTypeKey } from '../../lib/use-section-type-key'
// Pantallas propias de las secciones especiales (todo lo exclusivo vive en ../../grouped)
import { GroupedReorderBoard, getGroupedSectionConfig } from '../../grouped'
import { SectionImagesReorderDefault } from './section-images-reorder-default'

/**
 * Pantalla "Reordenar" de las fotos de UNA sección (`idSection` requerido).
 * - Secciones especiales (hero de Servicios, carrusel de categorías — ver `getGroupedSectionConfig`):
 *   acordeón por item con tarjetas arrastrables.
 * - Cualquier otra sección: la lista de siempre (filas agrupadas por item).
 */
export function SectionImagesReorderList({ idSection }: { idSection: number }) {
  const { typeKey, hasLoaded } = useSectionTypeKey(idSection)

  if (!hasLoaded) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center">
        <LoaderCircle className="mb-3 size-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Cargando imágenes de sección...</p>
      </div>
    )
  }

  // Secciones especiales: hero de Servicios y carrusel de categorías (ver features/sectionimages/grouped)
  const groupedConfig = getGroupedSectionConfig(typeKey)
  if (groupedConfig) return <GroupedReorderBoard config={groupedConfig} idSection={idSection} />

  // Resto de secciones: vista general
  return <SectionImagesReorderDefault idSection={idSection} />
}
