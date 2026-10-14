'use client'

// SOLO para «Restauración» (restoration_compare), al CREAR y al EDITAR.
// Fila con las fotos del mueble elegido (UNA sola vez, debajo del select "Mueble").
// Cada foto se puede:
//   - ARRASTRAR a los bloques "Antes" / "Después" (useDraggable; en celular, mantener presionada ~¼ s)
//   - TOCAR / clic / Enter: abre un menú pequeño con "Poner en «Antes»" / "Poner en «Después»"
//     (sirve en celular sin arrastrar y con teclado).
// Badges: "Portada", "Antes"/"Después" (cómo está marcada en la galería del mueble) y la marca
// "En Antes"/"En Después" si ya está puesta en un bloque.
// El DndContext está en restoration-pair-fields.tsx (envuelve esta fila y los dos bloques).

import { useState } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { Check, ImageOff, Star } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover'
import { Skeleton } from '@/shared/ui/skeleton'
import { RESTORATION_PHOTO_VARIANTS, type RestorationPhotoVariant } from '../../../grouped'
import type { FurniturePhoto } from '../coverflow/furniture-photos'
import type { RestorationDragData } from './use-restoration-dnd'

interface RestorationFurniturePhotoStripProps {
  /** Fotos del mueble elegido (getFurniturePhotos). */
  photos: FurniturePhoto[]
  /** true = la lista de muebles todavía carga (se muestra un esqueleto). */
  isLoading?: boolean
  /** Imagen puesta ahora en cada bloque (para la marca "En Antes" / "En Después"). */
  beforeImageId: number | null
  afterImageId: number | null
  /** Se eligió "Poner en ..." en el menú de una foto. */
  onPlace: (variant: RestorationPhotoVariant, photo: FurniturePhoto) => void
}

/** Texto de una variante ('before' → "Antes"). */
const variantLabel = (variant: string | null) =>
  RESTORATION_PHOTO_VARIANTS.find((v) => v.value === variant)?.label ?? null

/** Fila de fotos del mueble (arrastrables). */
export function RestorationFurniturePhotoStrip({
  photos, isLoading = false, beforeImageId, afterImageId, onPlace,
}: RestorationFurniturePhotoStripProps) {
  // Esqueleto mientras cargan los muebles (así no "salta" la tarjeta)
  if (isLoading) {
    return (
      <div className="flex gap-2 overflow-hidden" aria-busy="true" aria-label="Cargando fotos del mueble">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[4/3] w-24 shrink-0" />
        ))}
      </div>
    )
  }

  if (photos.length === 0) {
    return (
      <p className="flex items-center gap-2 text-xs text-muted-foreground">
        <ImageOff className="size-4" />Este mueble no tiene fotos. Elige las fotos del banco de imágenes.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium">Fotos del mueble</span>
      {/* Una sola fila; si no entran, scroll horizontal (también en celular) */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {photos.map((photo) => (
          <StripPhoto
            key={photo.imageId}
            photo={photo}
            inBefore={photo.imageId === beforeImageId}
            inAfter={photo.imageId === afterImageId}
            onPlace={onPlace}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Mantén presionada una foto y arrástrala a «Antes» o «Después». También puedes tocarla y elegir dónde ponerla.
      </p>
    </div>
  )
}

interface StripPhotoProps {
  photo: FurniturePhoto
  /** ¿Ya está en el bloque "Antes"? */
  inBefore: boolean
  /** ¿Ya está en el bloque "Después"? */
  inAfter: boolean
  onPlace: (variant: RestorationPhotoVariant, photo: FurniturePhoto) => void
}

/** Una foto de la fila: arrastrable + menú "Poner en ...". */
function StripPhoto({ photo, inBefore, inAfter, onPlace }: StripPhotoProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  const dragData: RestorationDragData = { kind: 'photo', photo }
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `photo-${photo.imageId}`,
    data: dragData,
  })

  const badge = variantLabel(photo.variant)
  // Marca "En Antes" / "En Después" / "En los dos"
  const usedText = inBefore && inAfter ? 'En los dos' : inBefore ? 'En Antes' : inAfter ? 'En Después' : null

  /** Opción del menú: pone la foto en ese bloque y cierra el menú. */
  const place = (variant: RestorationPhotoVariant) => {
    onPlace(variant, photo)
    setMenuOpen(false)
  }

  return (
    <Popover open={menuOpen} onOpenChange={setMenuOpen}>
      <PopoverTrigger asChild>
        <button
          ref={setNodeRef}
          type="button"
          {...attributes}
          {...listeners}
          title={`${photo.name} (arrastra o toca para elegir dónde ponerla)`}
          aria-label={`Foto ${photo.name}. Elegir si va en Antes o Después`}
          className={cn(
            // touch-manipulation (NO touch-none): deslizar rápido sigue haciendo scroll
            // select-none + sin "callout": que mantener presionado no abra el menú del navegador
            'relative aspect-[4/3] w-24 shrink-0 cursor-grab touch-manipulation select-none overflow-hidden rounded-md border bg-muted/40 transition [-webkit-touch-callout:none] active:cursor-grabbing sm:w-28',
            usedText ? 'ring-2 ring-primary ring-offset-1' : 'hover:opacity-80',
            // La original queda tenue mientras se arrastra su miniatura
            isDragging && 'opacity-40',
          )}
        >
          {photo.url
            // draggable={false}: que el navegador no arrastre la imagen por su cuenta
            ? <img src={photo.url} alt={photo.name} draggable={false} className="pointer-events-none h-full w-full object-cover" />
            : <ImageOff className="m-auto size-5 text-muted-foreground" />}
          {/* Portada del mueble */}
          {photo.isCover && (
            <span className="absolute left-1 top-1 flex items-center gap-0.5 rounded bg-black/60 px-1 text-[10px] text-white">
              <Star className="size-2.5 fill-current" />Portada
            </span>
          )}
          {/* Cómo está marcada en la galería: Antes / Después */}
          {badge && (
            <span className="absolute bottom-1 left-1 rounded bg-black/70 px-1 text-[10px] font-medium text-white">{badge}</span>
          )}
          {/* Ya está puesta en un bloque */}
          {usedText && (
            <span className="absolute right-1 top-1 flex items-center gap-0.5 rounded bg-primary px-1 text-[10px] font-medium text-primary-foreground">
              <Check className="size-2.5" />{usedText}
            </span>
          )}
        </button>
      </PopoverTrigger>

      {/* Menú: dónde poner la foto */}
      <PopoverContent className="w-48 p-1" align="start">
        {RESTORATION_PHOTO_VARIANTS.map((v) => {
          const isHere = v.value === 'before' ? inBefore : inAfter
          return (
            <button
              key={v.value}
              type="button"
              onClick={() => place(v.value)}
              className="flex w-full items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent focus-visible:bg-accent focus-visible:outline-hidden"
            >
              Poner en «{v.label}»
              {isHere && <Check className="size-4 text-primary" />}
            </button>
          )
        })}
      </PopoverContent>
    </Popover>
  )
}
