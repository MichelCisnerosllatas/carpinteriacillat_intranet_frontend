'use client'

import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import type { ImageItemGroup } from '../../lib/group-section-images'
import type { ImageRole } from '../../lib/image-roles'
import { SectionImageGroupHeading } from '../list/sectionimage-group-heading'
import { SectionImagesReorderRow } from './section-images-reorder-row'

interface SectionImagesReorderGroupProps {
  group: ImageItemGroup
  /** Rol de cada foto: { [idFoto]: rol }. */
  roles: Record<number, ImageRole>
  /** Mueve una foto un lugar arriba (-1) o abajo (+1) dentro de este grupo. */
  onMove: (group: ImageItemGroup, id: number, direction: -1 | 1) => void
}

/**
 * Un grupo de la pantalla "Reordenar": encabezado "01 · Título" y sus fotos.
 * Tiene su propio SortableContext: las fotos solo se ordenan dentro del grupo.
 */
export function SectionImagesReorderGroup({ group, roles, onMove }: SectionImagesReorderGroupProps) {
  const last = group.images.length - 1

  return (
    <div className="flex flex-col gap-2">
      {/* Las secciones sin items tienen un solo grupo sin encabezado */}
      {group.heading && <SectionImageGroupHeading group={group} />}

      <SortableContext items={group.images.map((image) => image.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2">
          {group.images.map((image, idx) => (
            <SectionImagesReorderRow
              key={image.id}
              image={image}
              position={idx + 1}
              groupKey={group.key}
              role={roles[image.id]}
              onMoveUp={idx > 0 ? () => onMove(group, image.id, -1) : undefined}
              onMoveDown={idx < last ? () => onMove(group, image.id, 1) : undefined}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  )
}
