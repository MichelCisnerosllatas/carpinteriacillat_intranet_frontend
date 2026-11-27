'use client'

// SOLO carrusel «Muebles a medida».
// Tarjeta de una foto que NO es de la sección: viene de un trabajo de la Galería.
// Se ve igual que GroupedPhotoCard pero SIN checkbox, SIN asa de arrastre y SIN menú,
// con un badge que dice de dónde viene ("De un trabajo"). Ver grouped/README.md.

import { Hammer } from 'lucide-react'
import { Badge } from '@/shared/ui/badge'
import type { AutoPhoto } from '../../lib/auto-photos'

interface GroupedAutoPhotoCardProps {
  photo: AutoPhoto
  /** Tocar la foto: abrirla en grande (mismo visor que las demás). */
  onOpen: () => void
  /** Badge arriba a la izquierda: de dónde viene la foto ("De un trabajo"). */
  originLabel: string
}

export function GroupedAutoPhotoCard({ photo, onOpen, originLabel }: GroupedAutoPhotoCardProps) {
  return (
    // Mismo tamaño y borde que GroupedPhotoCard, con borde punteado para diferenciarla
    <div className="group relative aspect-[4/3] w-full overflow-hidden rounded-lg border border-dashed bg-muted/40">
      <button type="button" className="h-full w-full cursor-zoom-in" onClick={onOpen} title={photo.workTitle}>
        <img src={photo.url} alt={photo.name} draggable={false} className="h-full w-full object-cover" />
      </button>

      {/* Arriba a la izquierda: de dónde viene ("De un trabajo") */}
      <Badge
        variant="outline"
        className="pointer-events-none absolute left-1.5 top-1.5 gap-1 border-transparent bg-black/70 px-1.5 py-0 text-[10px] font-medium text-white shadow-sm"
      >
        <Hammer className="size-3" />{originLabel}
      </Badge>

      {/* Abajo: título del trabajo */}
      <span className="pointer-events-none absolute inset-x-1.5 bottom-1.5 truncate rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
        {photo.workTitle}
      </span>
    </div>
  )
}
