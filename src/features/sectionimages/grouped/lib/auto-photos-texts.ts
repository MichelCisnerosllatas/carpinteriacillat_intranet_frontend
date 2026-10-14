// SOLO carrusel «Muebles a medida» y «Restauración»: textos y enlaces del bloque "Fotos automáticas"
// de la vista agrupada (pestaña Imágenes y Reordenar). La regla en sí está en auto-photos.ts.
// Ver grouped/README.md → "Fotos automáticas".

import type { SectionImage } from '../../data/schema'
import { RESTORATION_PHOTO_VARIANTS, type RestorationPhotoVariant } from '../restoration/restoration-links'
import type { AutoPhotosMode, AutoPhotosResult } from './auto-photos'

/** Textos de cada modo. */
export type AutoPhotosTexts = {
  /** Contador del encabezado cuando el item usa solo fotos automáticas (en vez de "0 fotos"). */
  headerText: string
  /** Línea de ayuda bajo las fotos automáticas. */
  helpText: string
  /** Sin fotos propias NI automáticas. */
  emptyText: string
  /** Botón que lleva al mueble / a los trabajos. */
  linkLabel: string
}

export const AUTO_PHOTOS_TEXTS: Record<AutoPhotosMode, AutoPhotosTexts> = {
  restoration: {
    headerText: 'Fotos automáticas (del mueble)',
    helpText: 'La web usa estas fotos Antes/Después del mueble porque el trabajo no tiene propias.',
    emptyText: 'Este trabajo aún no tiene fotos.',
    linkLabel: 'Ver mueble →',
  },
  category: {
    headerText: 'Fotos automáticas (de sus trabajos)',
    helpText: 'La web usa estas fotos de sus últimos trabajos publicados porque la categoría no tiene propias.',
    emptyText: 'Esta categoría aún no tiene fotos.',
    linkLabel: 'Ver trabajos →',
  },
}

/** Restauración: aviso si el mueble existe pero no está publicado en la galería web. */
export const RESTORATION_UNPUBLISHED_TEXT =
  'El mueble no está publicado en la galería web: la web no usa sus fotos automáticas.'

/**
 * Restauración, trabajo SIN mueble: aviso si le falta su foto propia «Antes» y/o «Después».
 * Ej. ['before'] → 'Falta foto «Antes»: no se mostrará en la web.' · [] → null (sin aviso).
 */
export function getRestorationMissingText(missing: RestorationPhotoVariant[]): string | null {
  if (missing.length === 0) return null
  const labels = RESTORATION_PHOTO_VARIANTS
    .filter((v) => missing.includes(v.value))
    .map((v) => `«${v.label}»`)
  const prefix = labels.length > 1 ? 'Faltan las fotos' : 'Falta foto'
  return `${prefix} ${labels.join(' y ')}: no se mostrará en la web.`
}

/**
 * Enlace del botón "Ver mueble →" / "Ver trabajos →".
 * - Restauración: edición del mueble (/furnitures/edit/<id>). Sin id → null (no hay botón).
 * - Categoría: lista de muebles (/furnitures). Esa lista no tiene filtro por categoría en la URL.
 */
export function getAutoPhotosLink(mode: AutoPhotosMode, idFurniture: number | null): string | null {
  if (mode === 'restoration') return idFurniture != null ? `/furnitures/edit/${idFurniture}` : null
  return '/furnitures'
}

/**
 * Contador del encabezado: si el item NO tiene fotos propias visibles y la web usa automáticas,
 * "Fotos automáticas (del mueble)" / "(de sus trabajos)" en vez de "0 fotos". Si no, null.
 */
export function getAutoPhotosCounter(
  mode: AutoPhotosMode | null, ownPhotos: SectionImage[], result: AutoPhotosResult,
): string | null {
  if (!mode || result.photos.length === 0) return null
  const hasOwnVisible = ownPhotos.some((p) => p.stateValue === 1)
  return hasOwnVisible ? null : AUTO_PHOTOS_TEXTS[mode].headerText
}
