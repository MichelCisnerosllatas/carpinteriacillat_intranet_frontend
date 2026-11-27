// SOLO carrusel «Muebles a medida» (category_coverflow).
// "Fotos automáticas": las que la WEB usa cuando una tarjeta (categoría) no tiene fotos propias visibles.
// Salen de los trabajos de la Galería (web_works) publicados de esa categoría.
// Funciones PURAS (sin React ni API): reciben datos y devuelven datos.
// Copian la regla de la web (ver contrato de la Galería web, "category_coverflow"):
//   - trabajos publicados (webwork_state 1) con category.id_category = la categoría de la tarjeta
//     (clave 'category-<id>'; si la clave no trae id, se compara el nombre sin tildes),
//   - del más reciente al más antiguo (webwork_delivered_at desc, sin fecha al final; empate = webwork_order),
//   - primero la portada de cada trabajo (cover o, si no tiene, su 1ª foto visible) y luego sus demás
//     fotos visibles. Máximo 4.
// Ver grouped/README.md → "Fotos automáticas".

import type { SectionItemApiItem } from '@/features/section-items/model/sectionitemget.dto'
import type { SectionImage } from '../../data/schema'
import { getCategoryIdFromKey } from '../coverflow/coverflow-links'
import type { GroupedWebWork } from './use-web-work-list'

/** Máximo de fotos automáticas en una tarjeta de categoría (igual que la web: MAX_AUTO_PHOTOS). */
export const MAX_AUTO_PHOTOS = 4

/** Una foto automática (sale de un trabajo, no de sections_images). */
export type AutoPhoto = {
  /** Clave única dentro del item (para el `key` de React). */
  key: string
  imageId: number
  url: string
  name: string
  /** Trabajo del que sale la foto (para el enlace '/gallery/<id>' al personalizar). */
  idWebWork: number
  /** Título del trabajo. */
  workTitle: string
}

// ─────────────────────────── Helpers de un trabajo ───────────────────────────

/** ¿El trabajo está publicado en la web? */
export function isPublishedWork(w: GroupedWebWork): boolean {
  return w.webwork_state === 1
}

/** Ordena por un número de orden: menor primero y los null al final (sort estable). */
function byOrderNullLast(a: number | null | undefined, b: number | null | undefined): number {
  if (a == null && b == null) return 0
  if (a == null) return 1
  if (b == null) return -1
  return a - b
}

/** Fotos visibles de la galería del trabajo, por webworkimage_order (null al final). */
export function visibleWorkImages(w: GroupedWebWork) {
  return (w.images ?? [])
    .filter((img) => img.webworkimage_state === 1 && img.id_image && img.url)
    .sort((a, b) => byOrderNullLast(a.webworkimage_order, b.webworkimage_order))
}

/**
 * Fotos del trabajo como las arma la web: primero la portada (cover o, si no tiene, la 1ª foto
 * visible) y luego las demás fotos visibles, en orden. No se repite la misma imagen.
 */
export function getWorkPhotos(w: GroupedWebWork): AutoPhoto[] {
  const photos: AutoPhoto[] = []
  const title = w.webwork_title

  if (w.cover?.id_image && w.cover.url) {
    photos.push({
      key: `w${w.id_web_work}-cover`,
      imageId: w.cover.id_image,
      url: w.cover.url,
      name: w.cover.name,
      idWebWork: w.id_web_work,
      workTitle: title,
    })
  }

  for (const img of visibleWorkImages(w)) {
    if (photos.some((p) => p.imageId === img.id_image)) continue
    photos.push({
      key: `w${w.id_web_work}-i${img.id_web_work_image}`,
      imageId: img.id_image,
      url: img.url,
      name: img.name || `Imagen #${img.id_image}`,
      idWebWork: w.id_web_work,
      workTitle: title,
    })
  }

  return photos
}

// ─────────────────────────── Categoría ───────────────────────────

/** "Cocinas Rústicas " → "cocinas rusticas" (igual que normalizeCategoryName de la web). */
function normalizeName(name?: string | null): string {
  return (name ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
}

/** Trabajos de la categoría de la tarjeta (por id de la clave; si no trae id, por nombre). Sin filtrar estado. */
export function findWorksOfCategory(
  item: Pick<SectionItemApiItem, 'sectionitem_key' | 'sectionitem_title'>, works: GroupedWebWork[],
): GroupedWebWork[] {
  const idCategory = getCategoryIdFromKey(item.sectionitem_key)
  if (idCategory != null) return works.filter((w) => w.category?.id_category === idCategory)

  const name = normalizeName(item.sectionitem_title)
  if (!name) return []
  return works.filter((w) => normalizeName(w.category?.category_name) === name)
}

/**
 * Del más reciente al más antiguo según webwork_delivered_at ("2026-05-10"); los que no tienen
 * fecha van al final. Antes se ordenan por webwork_order (como llegan los trabajos a la web),
 * así un empate respeta ese orden (sort estable).
 */
export function sortWorksByRecent(works: GroupedWebWork[]): GroupedWebWork[] {
  return [...works]
    .sort((a, b) => byOrderNullLast(a.webwork_order, b.webwork_order))
    .sort((a, b) => {
      const da = a.webwork_delivered_at ?? null
      const db = b.webwork_delivered_at ?? null
      if (da === db) return 0
      if (!da) return 1
      if (!db) return -1
      // Formato año-mes-día: comparar como texto ya ordena por fecha
      return da < db ? 1 : -1
    })
}

/** Hasta 4 fotos: primero la portada de cada trabajo y luego sus demás fotos (pickWorkPhotos de la web). */
function pickWorkPhotos(works: GroupedWebWork[]): AutoPhoto[] {
  const all = works.map(getWorkPhotos)
  const covers = all.map((photos) => photos[0]).filter((p): p is AutoPhoto => p != null)
  const others = all.flatMap((photos) => photos.slice(1))
  return [...covers, ...others].slice(0, MAX_AUTO_PHOTOS)
}

/** Si la tarjeta NO tiene fotos propias visibles, las de sus trabajos publicados (máx. 4). Si tiene, []. */
export function getCategoryAutoPhotos(
  item: SectionItemApiItem, ownPhotos: SectionImage[], works: GroupedWebWork[],
): AutoPhoto[] {
  const hasOwnVisible = ownPhotos.some((p) => p.stateValue === 1)
  if (hasOwnVisible) return []
  const published = works.filter(isPublishedWork)
  return pickWorkPhotos(sortWorksByRecent(findWorksOfCategory(item, published)))
}

/** Fotos automáticas → fotos del visor en grande (mismo visor que las demás). */
export function autoPhotosToSlides(photos: AutoPhoto[]): { src: string; alt?: string }[] {
  return photos.map((p) => ({ src: p.url, alt: p.workTitle }))
}
