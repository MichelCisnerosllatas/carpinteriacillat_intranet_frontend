'use client'

import { X, ImageOff } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

interface FurnitureGalleryItemProps {
  imageUrl: string | null
  imageName: string | null
  isPending: boolean
  disabled?: boolean
  isDragging?: boolean
  onRemove: () => void
  onClick: () => void
}

export function FurnitureGalleryItem({
  imageUrl,
  imageName,
  isPending,
  disabled = false,
  isDragging = false,
  onRemove,
  onClick,
}: FurnitureGalleryItemProps) {
  return (
    <div
      className={cn(
        'group relative aspect-square overflow-hidden rounded-xl border-2 transition-all',
        isPending
          ? 'border-primary/50 ring-1 ring-primary/20'
          : 'border-border',
        isDragging && 'ring-2 ring-primary/60',
      )}
    >
      <button
        type="button"
        onClick={onClick}
        className="h-full w-full cursor-zoom-in"
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={imageName ?? ''}
            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
            onError={(e) => {
              ;(e.target as HTMLImageElement).style.display = 'none'
            }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <ImageOff className="size-5 text-muted-foreground" />
          </div>
        )}
      </button>

      {isPending && (
        <div className="pointer-events-none absolute left-1.5 top-1.5 rounded-full bg-primary/85 px-1.5 py-0.5 text-[8px] font-semibold text-white">
          nuevo
        </div>
      )}

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onRemove()
        }}
        disabled={disabled}
        className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-black/50 text-white opacity-0 backdrop-blur-sm transition-opacity duration-150 hover:bg-red-500 group-hover:opacity-100 disabled:cursor-not-allowed"
      >
        <X className="size-3" />
      </button>

      <div className="pointer-events-none absolute bottom-0 left-0 right-0 translate-y-full rounded-b-xl bg-black/80 px-1.5 py-1 text-[9px] text-white transition-transform duration-150 group-hover:translate-y-0 truncate">
        {imageName ?? 'sin nombre'}
      </div>
    </div>
  )
}
