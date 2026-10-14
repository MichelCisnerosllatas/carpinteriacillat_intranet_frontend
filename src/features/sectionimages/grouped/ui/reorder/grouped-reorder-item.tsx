'use client'

// Vista agrupada (hero de Servicios y carrusel de categorías).
// Un item en la pantalla Reordenar: encabezado + sus fotos arrastrables en una sola fila.
// Lo general de imágenes de sección vive fuera de esta carpeta (ver grouped/README.md).

import type { ReactNode } from 'react'
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable'
import { AccordionContent, AccordionItem } from '@/shared/ui/accordion'
import type { SectionItemApiItem } from '@/features/section-items/model/sectionitemget.dto'
import type { SectionImage } from '../../../data/schema'
import type { ImageRole } from '../../../lib/image-roles'
import { capitalize, getPhotoVariantLabel, type GroupedSectionConfig } from '../../grouped-section.config'
import { GroupedItemHeader } from '../grouped-item-header'
import { GroupedPhotoRow } from '../grouped-photo-row'
import { SortableGroupedPhotoCard } from './sortable-grouped-photo-card'

interface GroupedReorderItemProps {
  config: GroupedSectionConfig
  item: SectionItemApiItem
  /** Posición del item (0, 1, 2...) para mostrar "01 ·", "02 ·"... */
  index: number
  /** Fotos del item, en el orden que se ve ahora. */
  photos: SectionImage[]
  roles: Record<number, ImageRole>
  /** Clave del grupo: solo se puede soltar dentro del mismo item. */
  groupKey: string
  onOpenPhoto: (image: SectionImage) => void
  onRename: (title: string) => Promise<boolean>
  onToggleVisible: (visible: boolean) => Promise<void>
  /** Carrusel / Restauración: bloque "Fotos automáticas" (no se arrastran). Reemplaza al texto "sin fotos". */
  autoPhotos?: ReactNode
  /** Texto del contador del encabezado en lugar de "N fotos". */
  counterOverride?: string | null
}

/** Un item en "Reordenar": el mismo encabezado del detalle + sus fotos arrastrables. */
export function GroupedReorderItem({
  config, item, index, photos, roles, groupKey, onOpenPhoto, onRename, onToggleVisible, autoPhotos, counterOverride,
}: GroupedReorderItemProps) {
  const visibleCount = photos.filter((p) => p.stateValue === 1).length

  return (
    <AccordionItem value={String(item.id_section_item)} className="group/item rounded-lg border bg-card">
      {/* Sin menú ⋮: aquí solo se ordena */}
      <GroupedItemHeader
        config={config}
        item={item}
        index={index}
        visibleCount={visibleCount}
        totalCount={photos.length}
        counterOverride={counterOverride}
        onRename={onRename}
        onToggleVisible={onToggleVisible}
      />

      <AccordionContent className="flex flex-col gap-3 px-3 pb-3">
        {photos.length === 0 ? (
          // Aquí no hay botón "Agregar imagen": solo se avisa (si hay bloque de automáticas, él pone su texto)
          !autoPhotos && <p className="text-xs text-muted-foreground">{capitalize(config.thisItem)} aún no tiene fotos.</p>
        ) : (
          // Un SortableContext por item: las fotos solo se ordenan dentro de su item
          <SortableContext items={photos.map((p) => p.id)} strategy={rectSortingStrategy}>
            {/* Igual que en el detalle: todas las fotos en una sola fila */}
            <GroupedPhotoRow count={photos.length}>
              {photos.map((photo) => (
                <SortableGroupedPhotoCard
                  key={photo.id}
                  image={photo}
                  role={roles[photo.id]}
                  groupKey={groupKey}
                  onOpen={onOpenPhoto}
                  variantLabel={getPhotoVariantLabel(config, photo)}
                />
              ))}
            </GroupedPhotoRow>
          </SortableContext>
        )}

        {/* Carrusel / Restauración: fotos que la web usa sola (no se arrastran) */}
        {autoPhotos}
      </AccordionContent>
    </AccordionItem>
  )
}
