'use client'

import { Star } from 'lucide-react'
import { Badge } from '@/shared/ui/badge'

interface FurnitureGalleryBadgesProps {
  /** Posición de la foto en la galería (1, 2, 3...). */
  position: number
  /** true si es la Foto 1: la portada del mueble. */
  isCover?: boolean
}

/**
 * Badges de una foto de la galería del mueble: su número y si es la portada.
 */
export function FurnitureGalleryBadges({ position, isCover = false }: FurnitureGalleryBadgesProps) {
  return (
    <div className="flex flex-wrap items-center gap-1">
      <Badge variant="secondary" className="px-1.5 py-0 font-mono text-[10px]">Foto {position}</Badge>
      {isCover && (
        <Badge className="gap-1 px-1.5 py-0 text-[10px]">
          <Star className="size-3 fill-current" />Portada
        </Badge>
      )}
    </div>
  )
}
