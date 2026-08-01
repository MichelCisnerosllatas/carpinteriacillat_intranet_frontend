// src/features/products-services/lib/getProductServiceGalleryImages.ts
import { buildImageUrl } from '@/shared/lib/images/buildImageUrl'
import type { LightboxImage } from '@/shared/ui/image-lightbox'
import type { ProductServiceJoinApiItem } from '../model/product-service-api-item.dto'

/** Arma la lista de imágenes (portada + galería) del mueble vinculado a un producto/servicio,
 * ya resueltas a URL absoluta y listas para <ImageLightbox />. Portada primero, sin duplicados. */
export function getProductServiceGalleryImages(item: ProductServiceJoinApiItem): LightboxImage[] {
  const furniture = item.furniture
  if (!furniture) return []

  const seen = new Set<string>()
  const images: LightboxImage[] = []

  const push = (patch: string | null | undefined, alt: string | null | undefined) => {
    const url = buildImageUrl(patch)
    if (!url || seen.has(url)) return
    seen.add(url)
    images.push({ src: url, alt: alt ?? item.name })
  }

  push(furniture.images?.image_patch, furniture.images?.image_title)
  for (const galleryItem of furniture.gallery_images) {
    push(galleryItem.image?.image_patch, galleryItem.image?.image_title)
  }

  return images
}

/** Solo la imagen de portada (o null) — para pintar la miniatura sin armar toda la galería. */
export function getProductServiceCoverImageUrl(item: ProductServiceJoinApiItem): string | null {
  return buildImageUrl(item.furniture?.images?.image_patch)
}
