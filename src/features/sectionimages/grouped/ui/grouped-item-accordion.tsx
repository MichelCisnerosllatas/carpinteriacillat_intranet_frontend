'use client'

// Vista agrupada (hero de Servicios y carrusel de categorías).
// Un item dentro de la pestaña Imágenes: encabezado + sus fotos en una sola fila.
// Lo general de imágenes de sección vive fuera de esta carpeta (ver grouped/README.md).

import type { ReactNode } from 'react'
import { AccordionContent, AccordionItem } from '@/shared/ui/accordion'
import type { SectionItemApiItem } from '@/features/section-items/model/sectionitemget.dto'
import type { SectionImage } from '../../data/schema'
import type { ImageRole } from '../../lib/image-roles'
import { getPhotoVariantLabel, type GroupedSectionConfig } from '../grouped-section.config'
import { GroupedPhotoCard, type GroupedPhotoActions } from './grouped-photo-card'
import { GroupedPhotoRow } from './grouped-photo-row'
import { GroupedItemHeader } from './grouped-item-header'
import { getGroupCheckState, type PhotoSelection } from '../lib/use-photo-selection'

interface GroupedItemAccordionProps {
  config: GroupedSectionConfig
  item: SectionItemApiItem
  /** Posición del item (0, 1, 2...) para mostrar "01 ·", "02 ·"... */
  index: number
  /** Fotos del item, ya ordenadas. */
  photos: SectionImage[]
  roles: Record<number, ImageRole>
  canDeletePhotos: boolean
  photoActions: GroupedPhotoActions
  /** Fotos marcadas (checkbox) para las acciones masivas. */
  selection: PhotoSelection
  /** Tocar una foto: abrirla en grande. */
  onOpenPhoto: (image: SectionImage) => void
  onRename: (title: string) => Promise<boolean>
  onToggleVisible: (visible: boolean) => Promise<void>
  onEditDetails: () => void
  /** Si no viene, el menú no ofrece eliminar el item. */
  onDelete?: () => void
  /**
   * Carrusel / Restauración: bloque "Fotos automáticas" (GroupedAutoPhotos), debajo de las fotos propias.
   * Si viene, reemplaza al texto "sin fotos" (el bloque ya trae su propio texto).
   */
  autoPhotos?: ReactNode
  /** Texto del contador del encabezado en lugar de "N fotos" (ej. "Fotos automáticas (del mueble)"). */
  counterOverride?: string | null
}

/** Un item (pestaña Imágenes): encabezado + sus fotos. Aquí NO se arrastra. */
export function GroupedItemAccordion({
  config, item, index, photos, roles, canDeletePhotos,
  photoActions, selection, onOpenPhoto, onRename, onToggleVisible, onEditDetails, onDelete,
  autoPhotos, counterOverride,
}: GroupedItemAccordionProps) {
  // Solo cuentan las fotos visibles (las ocultas no salen en la web)
  const visibleCount = photos.filter((p) => p.stateValue === 1).length
  const photoIds = photos.map((p) => p.id)

  return (
    // group/item: la flecha del encabezado gira según si el item está abierto
    <AccordionItem value={String(item.id_section_item)} className="group/item rounded-lg border bg-card">
      <GroupedItemHeader
        config={config}
        item={item}
        index={index}
        visibleCount={visibleCount}
        totalCount={photos.length}
        counterOverride={counterOverride}
        onRename={onRename}
        onToggleVisible={onToggleVisible}
        onEditDetails={onEditDetails}
        onDelete={onDelete}
        // Checkbox "todas las de este item" (solo si tiene fotos)
        selectAllState={getGroupCheckState(selection, photoIds)}
        onSelectAll={photos.length > 0 ? (checked) => selection.setMany(photoIds, checked) : undefined}
      />

      {/* ── Fotos del item: una sola fila ── */}
      <AccordionContent className="flex flex-col gap-3 px-3 pb-3">
        {photos.length === 0 ? (
          // Sin fotos propias: si hay bloque de automáticas, él pone su texto
          !autoPhotos && <p className="text-xs text-muted-foreground">{config.noPhotosText}</p>
        ) : (
          <GroupedPhotoRow count={photos.length}>
            {photos.map((photo) => (
              <GroupedPhotoCard
                key={photo.id}
                image={photo}
                role={roles[photo.id]}
                onOpen={onOpenPhoto}
                actions={photoActions}
                canDelete={canDeletePhotos}
                selected={selection.isSelected(photo.id)}
                selectionActive={selection.isActive}
                onSelectChange={(checked) => selection.toggle(photo.id, checked)}
                variantLabel={getPhotoVariantLabel(config, photo)}
              />
            ))}
          </GroupedPhotoRow>
        )}

        {/* Carrusel / Restauración: fotos que la web usa sola (sin checkbox ni menú) */}
        {autoPhotos}
      </AccordionContent>
    </AccordionItem>
  )
}
