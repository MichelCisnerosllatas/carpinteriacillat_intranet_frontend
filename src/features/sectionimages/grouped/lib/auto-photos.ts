// SOLO carrusel «Muebles a medida» (category_coverflow) y «Restauración» (restoration_compare).
// "Fotos automáticas": las que la WEB usa cuando un item no tiene fotos propias visibles.
// Funciones PURAS (sin React ni API): reciben datos y devuelven datos.
// Copian EXACTO la regla de la web (solo lectura en el proyecto web):
//   - features/service/lib/categoryCard.ts         (sortWorksByRecent, pickWorkPhotos, MAX_AUTO_PHOTOS)
//   - features/service/lib/buildItemCategoryCards.ts (categoría: trabajos de la categoría)
//   - features/service/lib/buildRestorationCards.ts  (restauración: foto Antes/Después del trabajo)
//   - shared/services/site_service/lib/workPhotos.ts (fotos de un trabajo: portada + galería)
// Ver grouped/README.md → "Fotos automáticas".

import { buildImageUrl } from '@/shared/lib/images'
import type { FurnitureJoinApiItem } from '@/features/furnitures/model/furniture-api-item.dto'
import type { SectionItemApiItem } from '@/features/section-items/model/sectionitemget.dto'
import type { SectionImage } from '../../data/schema'
import { getCategoryIdFromKey } from '../coverflow/coverflow-links'
import { getFurnitureIdFromRestorationKey, type RestorationPhotoVariant } from '../restoration/restoration-links'

/** Qué regla de fotos automáticas usa la sección (se configura en GROUPED_SECTION_CONFIG). */
export type AutoPhotosMode = 'restoration' | 'category'

/** Máximo de fotos automáticas en una tarjeta de categoría (igual que la web: MAX_AUTO_PHOTOS). */
export const MAX_AUTO_PHOTOS = 4

/** Una foto automática (sale de un mueble, no de sections_images). */
export type AutoPhoto = {
  /** Clave única dentro del item (para el `key` de React). */
  key: string
  imageId: number
  url: string
  name: string
  /** Mueble del que sale la foto (para el enlace '/gallery/<id>' al personalizar). */
  idFurniture: number
  /** Título del mueble (furniture_title o, si no tiene, furniture_name). */
  furnitureTitle: string
  /** Restauración: 'before' / 'after'. Categoría: null. */
  variant: RestorationPhotoVariant | null
}

/** Resultado para un item: sus fotos automáticas y el mueble (restauración) si se encontró. */
export type AutoPhotosResult = {
  photos: AutoPhoto[]
  /** Restauración: el mueble del item (por su clave 'furniture-<id>'). Categoría: null. */
  furniture: FurnitureJoinApiItem | null
  /** Restauración: id del mueble (de la clave), aunque no esté en la lista. Categoría: null. */
  idFurniture: number | null
}

// ─────────────────────────── Helpers de un mueble ───────────────────────────

/** Título a mostrar del mueble (igual que getFurnitureDisplayTitle; se repite para no importar un hook). */
function furnitureTitle(f: FurnitureJoinApiItem): string {
  return f.furniture_title?.trim() || f.furniture_name
}

/** ¿El mueble está publicado en la galería web? (= es un "trabajo" para la web) */
export function isPublishedWork(f: FurnitureJoinApiItem): boolean {
  return f.web?.furnitureweb_state === 1
}

/** Ordena por un número de orden: menor primero y los null al final (sort estable). */
function byOrderNullLast(a: number | null | undefined, b: number | null | undefined): number {
  if (a == null && b == null) return 0
  if (a == null) return 1
  if (b == null) return -1
  return a - b
}

/** Fotos visibles de la galería del mueble, por furnitureimage_order (null al final). */
function visibleGallery(f: FurnitureJoinApiItem) {
  return (f.gallery_images ?? [])
    .filter((g) => g.furnitureimage_state === 1 && g.image?.id_image)
    .sort((a, b) => byOrderNullLast(a.furnitureimage_order, b.furnitureimage_order))
}

/**
 * Fotos del trabajo como las arma la web (workPhotos.ts → getWorkPhotos):
 * primero la portada (furnitures.id_image) y luego las fotos visibles de su galería, en orden.
 * Se descartan las que no tienen URL y no se repite la misma imagen.
 */
export function getWorkPhotos(f: FurnitureJoinApiItem): AutoPhoto[] {
  const photos: AutoPhoto[] = []
  const title = furnitureTitle(f)

  const cover = f.images
  const coverUrl = cover?.id_image ? buildImageUrl(cover.image_patch) : null
  if (cover?.id_image && coverUrl) {
    photos.push({
      key: `f${f.id_furniture}-cover`,
      imageId: cover.id_image,
      url: coverUrl,
      name: cover.image_name,
      idFurniture: f.id_furniture,
      furnitureTitle: title,
      variant: null,
    })
  }

  for (const g of visibleGallery(f)) {
    const image = g.image!
    const url = buildImageUrl(image.image_patch)
    if (!url) continue
    if (photos.some((p) => p.imageId === image.id_image)) continue
    photos.push({
      key: `f${f.id_furniture}-g${g.id_furniture_image}`,
      imageId: image.id_image,
      url,
      name: image.image_name ?? `Imagen #${image.id_image}`,
      idFurniture: f.id_furniture,
      furnitureTitle: title,
      variant: g.web?.furnitureimageweb_variant ?? null,
    })
  }

  return photos
}

// ─────────────────────────── Restauración ───────────────────────────

/**
 * 1ª foto visible de la galería del mueble con esa variante, por furnitureimage_order
 * (como findWorkPhotoByVariant de la web; la portada no tiene variante).
 */
function findPhotoByVariant(f: FurnitureJoinApiItem, variant: RestorationPhotoVariant): AutoPhoto | null {
  for (const g of visibleGallery(f)) {
    if (g.web?.furnitureimageweb_variant !== variant) continue
    const image = g.image!
    const url = buildImageUrl(image.image_patch)
    if (!url) continue
    return {
      key: `f${f.id_furniture}-${variant}`,
      imageId: image.id_image,
      url,
      name: image.image_name ?? `Imagen #${image.id_image}`,
      idFurniture: f.id_furniture,
      furnitureTitle: furnitureTitle(f),
      variant,
    }
  }
  return null
}

/**
 * Restauración: por cada tipo (Antes / Después) que el item NO tenga como foto propia visible,
 * la foto del mueble marcada con ese tipo. Como en la web, el mueble tiene que estar publicado
 * (si no, la web no lo tiene en `works` y no usa sus fotos).
 * Trabajo SIN mueble (clave null): no tiene fotos automáticas, solo las propias.
 */
export function getRestorationAutoPhotos(
  item: SectionItemApiItem, ownPhotos: SectionImage[], furnitures: FurnitureJoinApiItem[],
): AutoPhotosResult {
  const idFurniture = getFurnitureIdFromRestorationKey(item.sectionitem_key)
  // Sin mueble relacionado → no hay de dónde sacar fotos automáticas
  if (idFurniture == null) return { photos: [], furniture: null, idFurniture: null }
  const furniture = idFurniture != null ? furnitures.find((f) => f.id_furniture === idFurniture) ?? null : null
  if (!furniture || !isPublishedWork(furniture)) return { photos: [], furniture, idFurniture }

  const ownVisible = ownPhotos.filter((p) => p.stateValue === 1)
  const photos: AutoPhoto[] = []
  for (const variant of ['before', 'after'] as const) {
    const hasOwn = ownVisible.some((p) => p.variant === variant)
    if (hasOwn) continue
    const photo = findPhotoByVariant(furniture, variant)
    if (photo) photos.push(photo)
  }
  return { photos, furniture, idFurniture }
}

/**
 * Restauración: tipos (Antes / Después) que el trabajo NO tiene ni como foto propia visible ni como
 * automática. Si falta alguno, la web no muestra la tarjeta (necesita las dos).
 */
export function getMissingRestorationVariants(ownPhotos: SectionImage[], autoPhotos: AutoPhoto[]): RestorationPhotoVariant[] {
  const ownVisible = ownPhotos.filter((p) => p.stateValue === 1)
  return (['before', 'after'] as const).filter((variant) =>
    !ownVisible.some((p) => p.variant === variant) && !autoPhotos.some((p) => p.variant === variant),
  )
}

// ─────────────────────────── Categoría ───────────────────────────

/** "Cocinas Rústicas " → "cocinas rusticas" (igual que normalizeCategoryName de la web). */
function normalizeName(name?: string | null): string {
  return (name ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
}

/** Trabajos publicados de la categoría del item (por id de la clave; si no trae id, por nombre). */
function findWorksOfItem(item: SectionItemApiItem, furnitures: FurnitureJoinApiItem[]): FurnitureJoinApiItem[] {
  const works = furnitures.filter(isPublishedWork)
  const idCategory = getCategoryIdFromKey(item.sectionitem_key)
  if (idCategory != null) return works.filter((f) => f.category?.id_category === idCategory)

  const name = normalizeName(item.sectionitem_title)
  if (!name) return []
  return works.filter((f) => normalizeName(f.category?.category_name) === name)
}

/**
 * Del más reciente al más antiguo según furnitureweb_delivered_at ("2026-05-10"); los que no
 * tienen fecha van al final. Antes se ordenan por furnitureweb_order (como llegan los trabajos a
 * la web), así un empate respeta ese orden (sort estable).
 */
export function sortWorksByRecent(works: FurnitureJoinApiItem[]): FurnitureJoinApiItem[] {
  return [...works]
    .sort((a, b) => byOrderNullLast(a.web?.furnitureweb_order, b.web?.furnitureweb_order))
    .sort((a, b) => {
      const da = a.web?.furnitureweb_delivered_at ?? null
      const db = b.web?.furnitureweb_delivered_at ?? null
      if (da === db) return 0
      if (!da) return 1
      if (!db) return -1
      // Formato año-mes-día: comparar como texto ya ordena por fecha
      return da < db ? 1 : -1
    })
}

/** Hasta 4 fotos: primero la portada de cada trabajo y luego sus demás fotos (pickWorkPhotos de la web). */
function pickWorkPhotos(works: FurnitureJoinApiItem[]): AutoPhoto[] {
  const all = works.map(getWorkPhotos)
  const covers = all.map((photos) => photos[0]).filter((p): p is AutoPhoto => p != null)
  const others = all.flatMap((photos) => photos.slice(1))
  return [...covers, ...others].slice(0, MAX_AUTO_PHOTOS)
}

/** Categoría: si el item NO tiene fotos propias visibles, las de sus trabajos publicados (máx. 4). */
export function getCategoryAutoPhotos(
  item: SectionItemApiItem, ownPhotos: SectionImage[], furnitures: FurnitureJoinApiItem[],
): AutoPhotosResult {
  const hasOwnVisible = ownPhotos.some((p) => p.stateValue === 1)
  if (hasOwnVisible) return { photos: [], furniture: null, idFurniture: null }
  return { photos: pickWorkPhotos(sortWorksByRecent(findWorksOfItem(item, furnitures))), furniture: null, idFurniture: null }
}

// ─────────────────────────── Entrada única ───────────────────────────

/** Fotos automáticas de un item según la regla de la sección. */
export function getAutoPhotos(
  mode: AutoPhotosMode, item: SectionItemApiItem, ownPhotos: SectionImage[], furnitures: FurnitureJoinApiItem[],
): AutoPhotosResult {
  return mode === 'restoration'
    ? getRestorationAutoPhotos(item, ownPhotos, furnitures)
    : getCategoryAutoPhotos(item, ownPhotos, furnitures)
}

/** Fotos automáticas → fotos del visor en grande (mismo visor que las demás). */
export function autoPhotosToSlides(photos: AutoPhoto[]): { src: string; alt?: string }[] {
  return photos.map((p) => ({ src: p.url, alt: p.furnitureTitle }))
}
