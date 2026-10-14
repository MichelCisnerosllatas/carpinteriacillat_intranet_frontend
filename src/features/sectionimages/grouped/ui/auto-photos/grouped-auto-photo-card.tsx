'use client'

// SOLO carrusel «Muebles a medida» y «Restauración».
// Tarjeta de una "foto automática": se ve igual que GroupedPhotoCard pero SIN checkbox, SIN asa de
// arrastre y SIN menú (no es una imagen de la sección: sale del mueble). Ver grouped/README.md.

import { Sparkles } from 'lucide-react'
import { Badge } from '@/shared/ui/badge'
import type { AutoPhoto } from '../../lib/auto-photos'

interface GroupedAutoPhotoCardProps {
  photo: AutoPhoto
  /** Tocar la foto: abrirla en grande (mismo visor que las demás). */
  onOpen: () => void
  /** Badge de variante abajo a la izquierda (Restauración: "Antes" / "Después"). */
  variantLabel?: string | null
}

export function GroupedAutoPhotoCard({ photo, onOpen, variantLabel }: GroupedAutoPhotoCardProps) {
  return (
    // Mismo tamaño y borde que GroupedPhotoCard, con borde punteado para diferenciarla
    <div className="group relative aspect-[4/3] w-full overflow-hidden rounded-lg border border-dashed bg-muted/40">
      <button type="button" className="h-full w-full cursor-zoom-in" onClick={onOpen} title={photo.furnitureTitle}>
        <img src={photo.url} alt={photo.name} draggable={false} className="h-full w-full object-cover" />
      </button>

      {/* Arriba a la izquierda: "Automática" */}
      <Badge
        variant="outline"
        className="pointer-events-none absolute left-1.5 top-1.5 gap-1 border-transparent bg-amber-500 px-1.5 py-0 text-[10px] font-medium text-white shadow-sm"
      >
        <Sparkles className="size-3" />Automática
      </Badge>

      {/* Abajo a la izquierda: variante (Restauración: "Antes" / "Después") */}
      {variantLabel && (
        <Badge className="pointer-events-none absolute bottom-1.5 left-1.5 border-transparent bg-black/70 px-1.5 py-0 text-[10px] font-medium text-white shadow-sm">
          {variantLabel}
        </Badge>
      )}
    </div>
  )
}
