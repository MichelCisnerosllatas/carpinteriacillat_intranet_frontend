'use client'

import Lightbox from 'yet-another-react-lightbox'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'
import 'yet-another-react-lightbox/styles.css'
import type { LightboxSlide } from '../../lib/lightbox-slides'

interface SectionImageLightboxProps {
  slides: LightboxSlide[]
  /** Foto abierta; -1 = visor cerrado. */
  index: number
  onClose: () => void
}

/** Visor de fotos en grande (con zoom) de las imágenes de sección. */
export function SectionImageLightbox({ slides, index, onClose }: SectionImageLightboxProps) {
  return (
    <Lightbox
      open={index >= 0}
      close={onClose}
      index={index}
      slides={slides}
      plugins={[Zoom]}
      controller={{ closeOnBackdropClick: true }}
      zoom={{ maxZoomPixelRatio: 4 }}
      styles={{ root: { '--yarl__color_backdrop': 'rgba(0,0,0,0.94)', zIndex: 9999 } }}
    />
  )
}
