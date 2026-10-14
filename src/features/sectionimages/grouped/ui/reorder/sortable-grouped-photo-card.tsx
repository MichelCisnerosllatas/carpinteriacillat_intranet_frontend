'use client'

// Vista agrupada (hero de Servicios y carrusel de categorías).
// Tarjeta de foto arrastrable (envuelve GroupedPhotoCard con el asa ⋮⋮).
// Lo general de imágenes de sección vive fuera de esta carpeta (ver grouped/README.md).

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import type { SectionImage } from '../../../data/schema'
import type { ImageRole } from '../../../lib/image-roles'
import { GroupedPhotoCard } from '../grouped-photo-card'

interface SortableGroupedPhotoCardProps {
  image: SectionImage
  role?: ImageRole | null
  /** Item al que pertenece la foto: solo se puede soltar dentro del mismo. */
  groupKey: string
  /** Tocar la foto: abrirla en grande. */
  onOpen: (image: SectionImage) => void
  /** Badge de variante (ej. "Antes" / "Después"), ver getPhotoVariantLabel. */
  variantLabel?: string | null
}

/**
 * Tarjeta de la vista agrupada que se puede arrastrar (pantalla "Reordenar").
 * Se arrastra SOLO desde el asa ⋮⋮: tocar la foto la abre en grande y,
 * en celular, deslizar sobre la foto hace scroll normal.
 */
export function SortableGroupedPhotoCard({ image, role, groupKey, onOpen, variantLabel }: SortableGroupedPhotoCardProps) {
  const {
    attributes, listeners, setNodeRef, setActivatorNodeRef,
    transform, transition, isDragging,
  } = useSortable({ id: image.id, data: { groupKey } })

  // Asa: touch-none SOLO aquí; en celular hay que mantenerla presionada ~¼ s
  const handle = (
    <button
      type="button"
      ref={setActivatorNodeRef}
      {...attributes}
      {...listeners}
      aria-label="Arrastrar para ordenar"
      title="Arrastra para ordenar (en celular, mantén presionado)"
      className="flex size-7 cursor-grab touch-none select-none items-center justify-center rounded bg-black/50 text-white hover:bg-black/70 active:cursor-grabbing pointer-coarse:size-9"
    >
      <GripVertical className="size-4 pointer-coarse:size-5" />
    </button>
  )

  // Translate (sin escala) para que la tarjeta no se deforme
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn('relative', isDragging && 'z-50 opacity-80 shadow-lg')}
    >
      <GroupedPhotoCard image={image} role={role} onOpen={onOpen} dragHandle={handle} variantLabel={variantLabel} />
    </div>
  )
}
