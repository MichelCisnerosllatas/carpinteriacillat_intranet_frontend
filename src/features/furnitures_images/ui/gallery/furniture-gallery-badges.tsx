'use client'

import { Star } from 'lucide-react'
import { Badge } from '@/shared/ui/badge'
import type { FurnitureImageVariant } from '../../data/data'

interface FurnitureGalleryBadgesProps {
  /** Posición de la foto en la galería (1, 2, 3...). */
  position: number
  variant: FurnitureImageVariant | null
  /** true si es la Foto 1: la portada del mueble (tarjeta de la galería web). */
  isCover?: boolean
}

/**
 * Badges de una foto de la galería del mueble: su número, "Antes"/"Después"
 * y si es la portada de la tarjeta en la galería web.
 */
export function FurnitureGalleryBadges({ position, variant, isCover = false }: FurnitureGalleryBadgesProps) {
  return (
    <div className="flex flex-wrap items-center gap-1">
      <Badge variant="secondary" className="px-1.5 py-0 font-mono text-[10px]">Foto {position}</Badge>
      {variant === 'before' && (
        <Badge variant="outline" className="border-amber-200 bg-amber-100 px-1.5 py-0 text-[10px] text-amber-900 dark:border-amber-800 dark:bg-amber-900/60 dark:text-amber-100">
          Antes
        </Badge>
      )}
      {variant === 'after' && (
        <Badge variant="outline" className="border-emerald-200 bg-emerald-100 px-1.5 py-0 text-[10px] text-emerald-900 dark:border-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-100">
          Después
        </Badge>
      )}
      {isCover && (
        <Badge className="gap-1 px-1.5 py-0 text-[10px]">
          <Star className="size-3 fill-current" />Portada
        </Badge>
      )}
    </div>
  )
}
