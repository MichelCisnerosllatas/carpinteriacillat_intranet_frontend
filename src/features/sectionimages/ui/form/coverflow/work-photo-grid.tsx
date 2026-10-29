'use client'

// Grilla con las fotos de UN trabajo de la Galería (portada + galería) para tocar y elegir una.
// Marca la foto elegida y la portada. La usa work-photo-picker.tsx (carrusel de categorías).

import { Check, ImageOff, Star } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import type { WorkPhoto } from './work-photos'

interface WorkPhotoGridProps {
  /** Fotos del trabajo (getWorkPhotos). */
  photos: WorkPhoto[]
  /** Imagen elegida ahora (se marca con un check). */
  selectedImageId: number | null
  /** Se tocó una foto. */
  onPick: (photo: WorkPhoto) => void
}

export function WorkPhotoGrid({ photos, selectedImageId, onPick }: WorkPhotoGridProps) {
  if (photos.length === 0) {
    return (
      <p className="flex items-center gap-2 text-xs text-muted-foreground">
        <ImageOff className="size-4" />Este trabajo no tiene fotos.
      </p>
    )
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(88px,1fr))] gap-2">
      {photos.map((photo) => {
        const isSelected = photo.imageId === selectedImageId
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
            {/* Portada del trabajo */}
            {photo.isCover && (
              <span className="absolute left-1 top-1 flex items-center gap-0.5 rounded bg-black/60 px-1 text-[10px] text-white">
                <Star className="size-2.5 fill-current" />Portada
              </span>
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
