'use client'

import { X, ImageOff, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'

interface FurnitureGalleryItemProps {
  imageUrl: string | null
  imageName: string | null
  isPending: boolean
  disabled?: boolean
  isDragging?: boolean
  onRemove: () => void
  onClick: () => void
  // Alternativa fija al arrastre para reordenar — arrastrar con dnd-kit no es confiable
  // en touch (handle chico, gesto no siempre disponible); estos botones siempre funcionan
  // igual con mouse, touch o teclado. Se omiten (undefined) en los extremos de la lista.
  onMoveBack?:    () => void
  onMoveForward?: () => void
}

export function FurnitureGalleryItem({
  imageUrl,
  imageName,
  isPending,
  disabled = false,
  isDragging = false,
  onRemove,
  onClick,
  onMoveBack,
  onMoveForward,
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

      {/* Quitar de la galería — en touch siempre visible (pointer-coarse) y con más
          área de toque (antes 20px, inalcanzable con el dedo) */}
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onRemove()
            }}
            disabled={disabled}
            className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-black/50 text-white opacity-0 backdrop-blur-sm transition-opacity duration-150 hover:bg-red-500 group-hover:opacity-100 disabled:cursor-not-allowed pointer-coarse:size-8 pointer-coarse:opacity-100"
          >
            <X className="size-3 pointer-coarse:size-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent>Quitar de la galería</TooltipContent>
      </Tooltip>

      {/* Mover atrás/adelante — alternativa al arrastre: en touch siempre visible (el drag
          no es confiable ahí), en mouse aparece en hover igual que el resto de controles
          (el drag ya funciona bien con mouse, no hace falta duplicar el control siempre).
          A los costados (no arriba/abajo) para no chocar con el handle, la "X" de quitar,
          ni el nombre del archivo que se desliza desde abajo. */}
      {(onMoveBack || onMoveForward) && (
        <>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onMoveBack?.() }}
            disabled={disabled || !onMoveBack}
            className="absolute left-1 top-1/2 z-10 flex size-6 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white opacity-0 backdrop-blur-sm transition-opacity duration-150 hover:bg-black/70 group-hover:opacity-100 disabled:pointer-events-none disabled:opacity-0 pointer-coarse:size-8 pointer-coarse:opacity-100"
          >
            <ChevronLeft className="size-3.5 pointer-coarse:size-4" />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onMoveForward?.() }}
            disabled={disabled || !onMoveForward}
            className="absolute right-1 top-1/2 z-10 flex size-6 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white opacity-0 backdrop-blur-sm transition-opacity duration-150 hover:bg-black/70 group-hover:opacity-100 disabled:pointer-events-none disabled:opacity-0 pointer-coarse:size-8 pointer-coarse:opacity-100"
          >
            <ChevronRight className="size-3.5 pointer-coarse:size-4" />
          </button>
        </>
      )}

      <div className="pointer-events-none absolute bottom-0 left-0 right-0 translate-y-full rounded-b-xl bg-black/80 px-1.5 py-1 text-[9px] text-white transition-transform duration-150 group-hover:translate-y-0 truncate pointer-coarse:translate-y-0">
        {imageName ?? 'sin nombre'}
      </div>
    </div>
  )
}
