'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import { cn } from '@/shared/lib/utils'
import { FurnitureGalleryItem } from '../furniture-gallery-item'
import { FurnitureGalleryBadges } from '../furniture-gallery-badges'
import type { GalleryEntry } from './types'

// ── Sortable wrapper ────────────────────────────────────────────────
export function SortableItem({
  entry,
  position,
  isCover,
  disabled,
  onRemove,
  onClick,
  onMoveBack,
  onMoveForward,
}: {
  entry: GalleryEntry
  position: number
  isCover: boolean
  disabled: boolean
  onRemove: () => void
  onClick: () => void
  onMoveBack?: () => void
  onMoveForward?: () => void
}) {
  const {
    attributes, listeners, setNodeRef,
    transform, transition, isDragging,
  } = useSortable({ id: entry.localKey, disabled })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn('group/item relative', isDragging && 'z-50 opacity-75')}
    >
      {/* Drag handle — en touch siempre visible y con más área de toque (antes 20px,
          oculto detrás de :hover: en touch no había forma de verlo ni de acertarlo) */}
      {!disabled && (
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              {...attributes}
              {...listeners}
              className="absolute left-1 top-1 z-10 flex size-5 cursor-grab touch-none items-center justify-center rounded bg-black/40 text-white opacity-0 backdrop-blur-sm transition-opacity duration-150 group-hover/item:opacity-100 active:cursor-grabbing pointer-coarse:size-8 pointer-coarse:opacity-100"
            >
              <GripVertical className="size-3 pointer-coarse:size-4" />
            </div>
          </TooltipTrigger>
          <TooltipContent>Mantén presionado para reordenar</TooltipContent>
        </Tooltip>
      )}
      <FurnitureGalleryItem
        imageUrl={entry.imageUrl}
        imageName={entry.imageName}
        isPending={!entry.furnitureImageId}
        disabled={disabled}
        isDragging={isDragging}
        onRemove={onRemove}
        onClick={onClick}
        onMoveBack={onMoveBack}
        onMoveForward={onMoveForward}
      />
      {/* Número de la foto y si es la portada */}
      <div className="mt-1.5">
        <FurnitureGalleryBadges position={position} isCover={isCover} />
      </div>
    </div>
  )
}
