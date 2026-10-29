// Carrusel «Muebles a medida»: funciones puras sobre las fotos de un trabajo de la Galería
// (portada + galería). Las usan el selector "Foto de un trabajo" (work-photo-picker.tsx),
// la grilla de fotos (work-photo-grid.tsx) y la opción del select (work-option-label.tsx).

import { visibleWorkImages, type GroupedWebWork } from '../../../grouped'

/** Una foto del trabajo que se puede elegir. */
export type WorkPhoto = {
  imageId: number
  url: string
  name: string
  isCover: boolean
}

/**
 * Portada + fotos visibles de la galería del trabajo (sin repetir la misma imagen).
 * Si no tiene portada, la 1ª foto visible queda primera (es la que la web usa como portada).
 */
export function getWorkPhotos(w: GroupedWebWork): WorkPhoto[] {
  const photos: WorkPhoto[] = []
  if (w.cover?.id_image) {
    photos.push({ imageId: w.cover.id_image, url: w.cover.url ?? '', name: w.cover.name, isCover: true })
  }
  for (const img of visibleWorkImages(w)) {
    if (photos.some((p) => p.imageId === img.id_image)) continue
    photos.push({
      imageId: img.id_image,
      url: img.url ?? '',
      name: img.name || `Imagen #${img.id_image}`,
      isCover: false,
    })
  }
  return photos
}
