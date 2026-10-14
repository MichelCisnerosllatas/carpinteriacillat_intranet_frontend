'use client'

// Grilla con las fotos de UN mueble (portada + galería) para tocar y elegir una.
// Marca la foto elegida, la portada y (si se pide) el badge "Antes" / "Después".
// La usa furniture-photo-picker.tsx (carrusel y Restauración al editar).
// (Restauración al CREAR usa otra fila, arrastrable: ../restoration/restoration-furniture-photo-strip.tsx)

import { Check, ImageOff, Star } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { RESTORATION_PHOTO_VARIANTS } from '../../../grouped'
import type { FurniturePhoto } from './furniture-photos'

interface FurniturePhotoGridProps {
  /** Fotos del mueble (getFurniturePhotos). */
  photos: FurniturePhoto[]
  /** Imagen elegida ahora (se marca con un check). */
  selectedImageId: number | null
  /** Se tocó una foto. */
  onPick: (photo: FurniturePhoto) => void
  /** Restauración: muestra el badge "Antes" / "Después" de las fotos ya marcadas. */
  showVariantBadge?: boolean
}

/** Texto del badge de una variante ('before' → "Antes"). */
const variantLabel = (variant: string | null) =>
  RESTORATION_PHOTO_VARIANTS.find((v) => v.value === variant)?.label ?? null

export function FurniturePhotoGrid({ photos, selectedImageId, onPick, showVariantBadge = false }: FurniturePhotoGridProps) {
  if (photos.length === 0) {
    return (
      <p className="flex items-center gap-2 text-xs text-muted-foreground">
        <ImageOff className="size-4" />Este mueble no tiene fotos.
      </p>
    )
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(88px,1fr))] gap-2">
      {photos.map((photo) => {
        const isSelected = photo.imageId === selectedImageId
        const badge = showVariantBadge ? variantLabel(photo.variant) : null
        return (
          <button
            key={photo.imageId}
            type="button"
            onClick={() => onPick(photo)}
            title={photo.name}
            className={cn(
              'relative aspect-[4/3] overflow-hidden rounded-md border bg-muted/40 transition',
              isSelected ? 'ring-2 ring-primary ring-offset-1' : 'hover:opacity-80',
            )}
          >
            {photo.url
              ? <img src={photo.url} alt={photo.name} className="h-full w-full object-cover" />
              : <ImageOff className="m-auto size-5 text-muted-foreground" />}
            {/* Portada del mueble */}
            {photo.isCover && (
              <span className="absolute left-1 top-1 flex items-center gap-0.5 rounded bg-black/60 px-1 text-[10px] text-white">
                <Star className="size-2.5 fill-current" />Portada
              </span>
            )}
            {/* Restauración: Antes / Después */}
            {badge && (
              <span className="absolute bottom-1 left-1 rounded bg-black/70 px-1 text-[10px] font-medium text-white">{badge}</span>
            )}
            {/* Foto elegida */}
            {isSelected && (
              <span className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Check className="size-3" />
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
