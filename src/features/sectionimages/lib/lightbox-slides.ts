import type { SectionImage } from '../data/schema'

/** Una foto del visor (lightbox). */
export type LightboxSlide = { src: string; alt?: string }

/** Fotos que se pueden ver en grande (solo las que tienen imagen). */
export function toLightboxSlides(images: SectionImage[]): LightboxSlide[] {
  return images
    .filter((i) => i.imageUrl)
    .map((i) => ({ src: i.imageUrl, alt: i.imageName }))
}

/** Posición de la foto dentro de las slides (-1 si no tiene imagen). */
export function getLightboxIndex(images: SectionImage[], id: number): number {
  return images.filter((i) => i.imageUrl).findIndex((i) => i.id === id)
}
