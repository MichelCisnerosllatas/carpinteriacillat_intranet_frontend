// Carrusel «Muebles a medida» y «Restauración»: funciones puras sobre las fotos de un mueble
// (portada + galería). Las usan el selector "Foto de un mueble" (furniture-photo-picker.tsx),
// la grilla de fotos (furniture-photo-grid.tsx) y los bloques Antes/Después de Restauración (../restoration/*).

import { buildImageUrl } from '@/shared/lib/images'
import type { FurnitureJoinApiItem } from '@/features/furnitures/model/furniture-api-item.dto'
import { hasBeforeAndAfterPhotos, type RestorationPhotoVariant } from '../../../grouped'

/** Una foto del mueble que se puede elegir. */
export type FurniturePhoto = {
  imageId: number
  url: string
  name: string
  isCover: boolean
  /** 'before' / 'after' si la foto de la galería está marcada así (null en la portada o sin marcar). */
  variant: string | null
}

/** Portada + fotos de la galería del mueble (sin repetir la misma imagen). */
export function getFurniturePhotos(f: FurnitureJoinApiItem): FurniturePhoto[] {
  const photos: FurniturePhoto[] = []
  if (f.images?.id_image) {
    photos.push({
      imageId: f.images.id_image,
      url: buildImageUrl(f.images.image_patch) ?? '',
      name: f.images.image_name,
      isCover: true,
      variant: null,
    })
  }
  for (const g of f.gallery_images ?? []) {
    if (!g.image?.id_image) continue
    if (photos.some((p) => p.imageId === g.image!.id_image)) continue
    photos.push({
      imageId: g.image.id_image,
      url: buildImageUrl(g.image.image_patch) ?? '',
      name: g.image.image_name ?? `Imagen #${g.image.id_image}`,
      isCover: false,
      variant: g.web?.furnitureimageweb_variant ?? null,
    })
  }
  return photos
}

/** true si el mueble tiene al menos una foto (portada o galería). */
export function hasAnyPhoto(f: FurnitureJoinApiItem): boolean {
  return getFurniturePhotos(f).length > 0
}

/** 1ª foto visible de la galería marcada con esa variante ('before' / 'after'), o null. */
export function findVariantPhoto(f: FurnitureJoinApiItem, variant: RestorationPhotoVariant): FurniturePhoto | null {
  const g = (f.gallery_images ?? []).find(
    (x) => x.furnitureimage_state === 1 && x.web?.furnitureimageweb_variant === variant && x.image?.id_image,
  )
  if (!g?.image) return null
  return {
    imageId: g.image.id_image,
    url: buildImageUrl(g.image.image_patch) ?? '',
    name: g.image.image_name ?? `Imagen #${g.image.id_image}`,
    isCover: false,
    variant,
  }
}

/**
 * Restauración: solo los muebles con fotos, primero los que tienen Antes y Después.
 * `keepId` = mueble que siempre se mantiene en la lista (ej. el del trabajo elegido).
 */
export function getRestorationFurnitureOptions(furnitures: FurnitureJoinApiItem[], keepId: number | null): FurnitureJoinApiItem[] {
  const withPhotos = furnitures.filter((f) => f.id_furniture === keepId || hasAnyPhoto(f))
  const withPair = withPhotos.filter((f) => hasBeforeAndAfterPhotos(f.gallery_images))
  const others = withPhotos.filter((f) => !hasBeforeAndAfterPhotos(f.gallery_images))
  return [...withPair, ...others]
}
