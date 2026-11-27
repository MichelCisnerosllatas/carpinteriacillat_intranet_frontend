// SOLO carrusel «Muebles a medida»: textos y enlaces del bloque "Fotos automáticas"
// de la vista agrupada (pestaña Imágenes y Reordenar). La regla en sí está en auto-photos.ts.
// Ver grouped/README.md → "Fotos automáticas".

import type { SectionImage } from '../../data/schema'
import type { AutoPhoto } from './auto-photos'

// OJO con las palabras: al admin NO se le dice solo "automáticas" (no se entendía). Se le dice DE DÓNDE
// vienen: "de sus trabajos" (trabajos de la Galería de esa categoría). En el código se siguen llamando
// "auto photos" porque la web las elige sola cuando la tarjeta no tiene fotos propias.

export const AUTO_PHOTOS_TEXTS = {
  /** Encabezado del bloque. */
  title: 'Fotos automáticas (de sus trabajos)',
  /** Origen, para el contador del encabezado: "2 fotos · de sus trabajos". */
  originText: 'de sus trabajos',
  /** Badge sobre cada foto que viene de afuera de la sección. */
  badgeLabel: 'De un trabajo',
  /** Línea de ayuda bajo esas fotos. */
  helpText: 'Estas fotos vienen de sus últimos trabajos publicados en la Galería (la categoría no tiene fotos propias).',
  /** Sin fotos propias NI de trabajos. */
  emptyText: 'Esta categoría aún no tiene fotos ni trabajos publicados.',
  /** Botón que lleva a los trabajos. */
  linkLabel: 'Ver trabajos →',
  /** Error al cargar los trabajos. */
  errorText: 'No se pudieron cargar los trabajos de la Galería.',
} as const

/** Enlace del botón "Ver trabajos →": lista de trabajos de la Galería (Fabricación). */
export const AUTO_PHOTOS_LINK = '/web-works?typework_key=manufacture'

/**
 * Contador del encabezado: si la tarjeta NO tiene fotos propias visibles y usa las de sus trabajos,
 * dice cuántas y de dónde vienen: "2 fotos · de sus trabajos" (en vez de "0 fotos"). Si no, null
 * (y el encabezado muestra su contador normal, ej. "2 fotos").
 */
export function getAutoPhotosCounter(ownPhotos: SectionImage[], photos: AutoPhoto[]): string | null {
  if (photos.length === 0) return null
  const hasOwnVisible = ownPhotos.some((p) => p.stateValue === 1)
  if (hasOwnVisible) return null
  const count = photos.length
  return `${count} foto${count !== 1 ? 's' : ''} · ${AUTO_PHOTOS_TEXTS.originText}`
}
