'use client'

import { useState } from 'react'
import type { SectionImage } from '../data/schema'
import { getLightboxIndex, toLightboxSlides, type LightboxSlide } from './lightbox-slides'

/**
 * Estado del visor de fotos en grande.
 * `open(fotos, foto)` abre el visor con esas fotos, empezando en la tocada.
 */
export function usePhotoLightbox() {
  const [slides, setSlides] = useState<LightboxSlide[]>([])
  // -1 = visor cerrado
  const [index, setIndex] = useState(-1)

  const open = (photos: SectionImage[], image: SectionImage) => {
    const idx = getLightboxIndex(photos, image.id)
    if (idx < 0) return
    setSlides(toLightboxSlides(photos))
    setIndex(idx)
  }

  /** Abre el visor con fotos que NO son imágenes de sección (ej. "fotos automáticas" de un mueble). */
  const openSlides = (newSlides: LightboxSlide[], startIndex: number) => {
    if (startIndex < 0 || startIndex >= newSlides.length) return
    setSlides(newSlides)
    setIndex(startIndex)
  }

  const close = () => setIndex(-1)

  return { slides, index, open, openSlides, close }
}
