'use client'

import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Dialog, DialogContent, DialogTitle } from '@/shared/ui/dialog'
import { Button } from '@/shared/ui/button'
import { cn } from '@/shared/lib/utils'

export interface LightboxImage {
  src: string
  alt?: string
}

interface ImageLightboxProps {
  images: LightboxImage[]
  open: boolean
  onOpenChange: (open: boolean) => void
  initialIndex?: number
  title?: string
}

/**
 * Visor genérico de imágenes en grande — Dialog con navegación prev/next cuando hay más de una.
 * 100% agnóstico de features (vive en shared/ui): recibe la lista de imágenes ya resuelta
 * (URLs absolutas) y no sabe nada de productos, muebles ni ninguna otra entidad.
 */
export function ImageLightbox({
  images,
  open,
  onOpenChange,
  initialIndex = 0,
  title,
}: ImageLightboxProps) {
  const [index, setIndex] = useState(initialIndex)

  useEffect(() => {
    if (open) setIndex(initialIndex)
  }, [open, initialIndex])

  const total = images.length
  const current = images[index]

  const goPrev = () => setIndex((i) => (i - 1 + total) % total)
  const goNext = () => setIndex((i) => (i + 1) % total)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex max-h-[90vh] w-[calc(100%-2rem)] max-w-3xl flex-col gap-3 p-4 sm:p-6"
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') goPrev()
          if (e.key === 'ArrowRight') goNext()
        }}
      >
        <DialogTitle className="sr-only">
          {title ?? current?.alt ?? 'Vista previa de imagen'}
        </DialogTitle>
        {current && (
          <>
            <div className="bg-muted relative flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-md">
              <img
                src={current.src}
                alt={current.alt ?? ''}
                className="max-h-[70vh] w-full object-contain"
              />
              {total > 1 && (
                <>
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    className="absolute top-1/2 left-2 -translate-y-1/2 rounded-full shadow"
                    onClick={goPrev}
                  >
                    <ChevronLeft className="size-4" />
                    <span className="sr-only">Anterior</span>
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full shadow"
                    onClick={goNext}
                  >
                    <ChevronRight className="size-4" />
                    <span className="sr-only">Siguiente</span>
                  </Button>
                </>
              )}
            </div>

            {total > 1 && (
              <div className="flex items-center justify-center gap-1.5">
                {images.map((img, i) => (
                  <button
                    key={`${img.src}-${i}`}
                    type="button"
                    onClick={() => setIndex(i)}
                    className={cn(
                      'h-1.5 rounded-full transition-all',
                      i === index ? 'bg-primary w-4' : 'bg-muted-foreground/30 w-1.5'
                    )}
                    aria-label={`Ver imagen ${i + 1} de ${total}`}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
