'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ChevronDown, ChevronUp, GripVertical, Image as ImageIcon } from 'lucide-react'
import { Badge } from '@/shared/ui/badge'
import { cn } from '@/shared/lib/utils'
import { getVisibilityStateOption } from '@/shared/config/entity-states'
import type { SectionImage } from '../../data/schema'
import type { ImageRole } from '../../lib/image-roles'
import { SectionImageRoleBadge } from '../list/sectionimage-role-badge'

interface SectionImagesReorderRowProps {
  image: SectionImage
  /** Posición dentro de su grupo (1, 2, 3...). */
  position: number
  /** Grupo (item) de la foto: solo se puede soltar dentro del mismo grupo. */
  groupKey: string
  role?: ImageRole | null
  onMoveUp?: () => void
  onMoveDown?: () => void
}

/**
 * Fila de una foto en la pantalla "Reordenar".
 * Se arrastra SOLO desde el asa (⋮⋮); el resto de la fila es normal,
 * así en el celular deslizar sobre la fila hace scroll.
 */
export function SectionImagesReorderRow({ image, position, groupKey, role, onMoveUp, onMoveDown }: SectionImagesReorderRowProps) {
  const {
    attributes, listeners, setNodeRef, setActivatorNodeRef,
    transform, transition, isDragging,
  } = useSortable({ id: image.id, data: { groupKey } })
  const stateOpt = getVisibilityStateOption(image.stateValue)

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn(
        'relative flex items-center gap-2 rounded-lg border bg-card px-2 py-2 shadow-sm sm:gap-3 sm:px-3',
        isDragging && 'z-50 opacity-80 shadow-lg ring-2 ring-primary/40',
      )}
    >
      {/* Asa: touch-none SOLO aquí para que el navegador no le dispute el gesto al arrastre.
          En celular hay que mantenerla presionada ~¼ s. */}
      <button
        type="button"
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        aria-label="Arrastrar para ordenar"
        title="Arrastra para ordenar (en celular, mantén presionado)"
        className="flex size-7 shrink-0 cursor-grab touch-none select-none items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground active:cursor-grabbing pointer-coarse:size-9"
      >
        <GripVertical className="size-4 pointer-coarse:size-5" />
      </button>

      {/* Número de la foto dentro de su grupo */}
      <span className="w-5 shrink-0 text-center text-xs font-semibold tabular-nums text-muted-foreground">
        {position}
      </span>

      <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
        {image.imageUrl
          ? <img src={image.imageUrl} alt={image.imageName} className="size-full object-cover" />
          : <ImageIcon className="size-4 text-muted-foreground" />}
      </div>

      {/* Nombre y badges (en celular los badges bajan a otra línea) */}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="truncate text-sm font-medium">{image.imageName || `Imagen #${image.id}`}</span>
        <div className="flex flex-wrap items-center gap-1">
          <SectionImageRoleBadge role={role} />
          <Badge variant="outline" className={cn('px-1.5 py-0 text-[10px]', stateOpt.badge)}>{stateOpt.label}</Badge>
        </div>
      </div>

      {/* Subir/bajar: alternativa al arrastre que siempre funciona */}
      <div className="flex shrink-0 flex-col gap-0.5">
        <button
          type="button"
          onClick={onMoveUp}
          disabled={!onMoveUp}
          aria-label="Subir"
          className="flex size-6 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-30 pointer-coarse:size-8"
        >
          <ChevronUp className="size-3.5 pointer-coarse:size-4" />
        </button>
        <button
          type="button"
          onClick={onMoveDown}
          disabled={!onMoveDown}
          aria-label="Bajar"
          className="flex size-6 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-30 pointer-coarse:size-8"
        >
          <ChevronDown className="size-3.5 pointer-coarse:size-4" />
        </button>
      </div>
    </div>
  )
}
