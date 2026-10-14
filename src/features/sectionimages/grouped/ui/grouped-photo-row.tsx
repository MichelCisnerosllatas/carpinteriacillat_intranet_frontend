'use client'

// Vista agrupada (hero de Servicios y carrusel de categorías).
// Fila de fotos: todas en UNA fila, una columna por foto (3 fotos = 3 columnas, 5 = 5...).
// Lo general de imágenes de sección vive fuera de esta carpeta (ver grouped/README.md).

import type { ReactNode } from 'react'

/** Ancho máximo de cada foto, para que 1 o 2 fotos no queden gigantes en pantallas anchas. */
const MAX_CARD_WIDTH_PX = 280

interface GroupedPhotoRowProps {
  /** Cantidad de fotos (= cantidad de columnas). */
  count: number
  /** Las tarjetas de foto. */
  children: ReactNode
}

/**
 * Fotos en una sola fila. Cada columna mide mínimo 120px en celular y 140px en pantallas
 * más grandes; si no entran, aparece scroll horizontal (también en celular).
 */
export function GroupedPhotoRow({ count, children }: GroupedPhotoRowProps) {
  return (
    // El contenedor hace el scroll horizontal; pb-1 deja aire para la barra de scroll
    <div className="overflow-x-auto pb-1">
      <div
        // --photo-min: ancho mínimo de cada columna (120px celular, 140px desde sm)
        className="grid gap-3 [--photo-min:120px] sm:[--photo-min:140px]"
        style={{
          gridTemplateColumns: `repeat(${count}, minmax(var(--photo-min), 1fr))`,
          // gap-3 = 0.75rem entre columnas
          maxWidth: `calc(${count} * ${MAX_CARD_WIDTH_PX}px + ${Math.max(0, count - 1)} * 0.75rem)`,
        }}
      >
        {children}
      </div>
    </div>
  )
}
