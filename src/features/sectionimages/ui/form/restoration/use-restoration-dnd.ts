'use client'

// SOLO para «Restauración» (restoration_compare), al CREAR y al EDITAR.
// Arrastrar y soltar de la tarjeta "Fotos del trabajo" (@dnd-kit):
//   - una foto de la fila del mueble → sobre el bloque "Antes" o "Después" = esa foto queda en ese bloque
//   - la foto de un bloque → sobre el otro bloque = se intercambian los dos bloques
// Este hook solo arma los sensores y decide qué hacer al soltar; los componentes usan
// useDraggable (restoration-furniture-photo-strip.tsx y restoration-photo-slot.tsx)
// y useDroppable (restoration-photo-slot.tsx).

import { useState } from 'react'
import {
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import type { RestorationPhotoVariant } from '../../../grouped'
import type { FurniturePhoto } from '../coverflow/furniture-photos'

/** Lo que lleva cada cosa que se arrastra (va en `data` de useDraggable). */
export type RestorationDragData =
  /** Una foto de la fila del mueble. */
  | { kind: 'photo'; photo: FurniturePhoto }
  /** La foto que ya está en un bloque (para pasarla al otro bloque). */
  | { kind: 'slot'; variant: RestorationPhotoVariant; url: string; name: string }

/** Lo que lleva cada bloque donde se suelta (va en `data` de useDroppable). */
export type RestorationDropData = { variant: RestorationPhotoVariant }

/** Miniatura que se ve bajo el dedo / mouse mientras se arrastra (DragOverlay). */
export type RestorationDragPreview = { url: string; name: string }

/** Id del bloque donde se suelta (useDroppable). */
export const restorationDropId = (variant: RestorationPhotoVariant) => `slot-${variant}`

interface UseRestorationDndOptions {
  /** Se soltó una foto del mueble sobre un bloque. */
  onDropPhoto: (variant: RestorationPhotoVariant, photo: FurniturePhoto) => void
  /** Se soltó la foto de un bloque sobre el otro bloque. */
  onSwap: () => void
}

export function useRestorationDnd({ onDropPhoto, onSwap }: UseRestorationDndOptions) {
  /** Foto que se está arrastrando ahora (null = nada). */
  const [preview, setPreview] = useState<RestorationDragPreview | null>(null)

  // Sensores (mismo patrón que el resto del intranet):
  // - MouseSensor con distancia: un clic simple NO arrastra (abre el menú "Poner en...").
  // - TouchSensor: mantener presionado ~¼ s; si el dedo se desliza antes, es scroll normal.
  // Sin KeyboardSensor: con teclado se usa el menú "Poner en Antes / Después" de cada foto
  // (Enter/Espacio abren ese menú; si también arrancaran el arrastre, chocarían).
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 8 } }),
  )

  /** Empieza el arrastre: guarda la miniatura para el DragOverlay. */
  const handleDragStart = (event: DragStartEvent) => {
    const data = event.active.data.current as RestorationDragData | undefined
    if (!data) return
    setPreview(data.kind === 'photo'
      ? { url: data.photo.url, name: data.photo.name }
      : { url: data.url, name: data.name })
  }

  /** Se soltó: si fue sobre un bloque, se coloca la foto (o se intercambian los bloques). */
  const handleDragEnd = (event: DragEndEvent) => {
    setPreview(null)
    const data = event.active.data.current as RestorationDragData | undefined
    const target = event.over?.data.current as RestorationDropData | undefined
    if (!data || !target) return // se soltó fuera de los bloques

    if (data.kind === 'photo') {
      onDropPhoto(target.variant, data.photo)
      return
    }
    // Foto de un bloque soltada sobre el OTRO bloque → intercambiar
    if (data.variant !== target.variant) onSwap()
  }

  /** Se canceló (ej. tecla Escape): solo se quita la miniatura. */
  const handleDragCancel = () => setPreview(null)

  return { sensors, preview, handleDragStart, handleDragEnd, handleDragCancel }
}
