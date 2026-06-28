'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CalendarDays, Images, Pencil, Ruler, Sofa } from 'lucide-react'
import NProgress from 'nprogress'
import Lightbox from 'yet-another-react-lightbox'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails'
import 'yet-another-react-lightbox/styles.css'
import 'yet-another-react-lightbox/plugins/thumbnails.css'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Separator } from '@/shared/ui/separator'
import { cn } from '@/shared/lib/utils'
import { getStateOption } from '@/shared/config/entity-states'
import { useFurnitureListStore } from '../../stores/useFurnitureListStore'

export function FurnitureDetail({ id }: { id: string }) {
  const router  = useRouter()
  const { currentItem, items, setCurrentItem, loadById } = useFurnitureListStore()
  const [lbIdx, setLbIdx] = useState(-1)

  useEffect(() => {
    if (currentItem && String(currentItem.id) === id) return
    const found = items.find((i) => String(i.id) === id)
    if (found) { setCurrentItem(found); return }
    void loadById(Number(id))
  }, [id])

  const item = currentItem && String(currentItem.id) === id ? currentItem : null

  if (!item) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
        Cargando...
      </div>
    )
  }

  const stateOpt = getStateOption(item.stateValue)

  // Build lightbox slides: cover + gallery
  const slides = [
    ...(item.imageUrl ? [{ src: item.imageUrl, alt: item.imageName ?? item.name }] : []),
    ...item.galleryImages
      .filter((g) => g.imageUrl)
      .map((g) => ({ src: g.imageUrl!, alt: g.imageName ?? '' })),
  ]

  const coverIdx    = item.imageUrl ? 0 : -1
  const galleryStart = item.imageUrl ? 1 : 0

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* ── Left column: images ── */}
      <div className="flex flex-col gap-4">
        <Card className="overflow-hidden">
          {/* Cover */}
          <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
            {item.imageUrl ? (
              <button
                type="button"
                onClick={() => setLbIdx(0)}
                className="h-full w-full cursor-zoom-in"
              >
                <img
                  src={item.imageUrl}
                  alt={item.imageName ?? item.name}
                  className="size-full object-cover transition-transform duration-300 hover:scale-105"
                />
              </button>
            ) : (
              <div className="flex size-full items-center justify-center">
                <Sofa className="size-16 text-muted-foreground/20" />
              </div>
            )}
          </div>

          {/* Gallery thumbnails */}
          {item.galleryImages.length > 0 && (
            <div className="border-t p-3">
              <div className="mb-2 flex items-center gap-1.5">
                <Images className="size-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  Galería · {item.galleryImages.length} imagen{item.galleryImages.length !== 1 ? 'es' : ''}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {item.galleryImages.map((g, idx) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setLbIdx(galleryStart + idx)}
                    className="size-14 overflow-hidden rounded-lg border cursor-zoom-in transition-transform hover:scale-105"
                  >
                    {g.imageUrl ? (
                      <img
                        src={g.imageUrl}
                        alt={g.imageName ?? ''}
                        className="size-full object-cover"
                        onError={(e) => { ;(e.target as HTMLImageElement).style.display = 'none' }}
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center bg-muted">
                        <Images className="size-4 text-muted-foreground/40" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* ── Right column: info ── */}
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-bold leading-tight">{item.name}</h2>
            <Badge variant="outline" className={cn('w-fit text-xs', stateOpt.badge)}>
              {stateOpt.label}
            </Badge>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="shrink-0"
            onClick={() => {
              NProgress.start()
              router.push(`/furnitures/edit/${item.id}`)
            }}
          >
            <Pencil className="mr-1.5 size-4" />
            Editar
          </Button>
        </div>

        {item.description && (
          <Card>
            <CardContent className="pt-4">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Sofa className="size-4" />
              Especificaciones
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Categoría</span>
              <Badge variant="secondary" className="text-xs font-normal">{item.categoryName}</Badge>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Color</span>
              <span className="font-medium">{item.typecolorName}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Madera</span>
              <span className="font-medium">{item.typewoodName}</span>
            </div>
            {(item.largo != null || item.ancho != null) && (
              <>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Ruler className="size-3.5" />
                    Dimensiones
                  </span>
                  <span className="font-medium tabular-nums">
                    {[
                      item.largo != null && `${item.largo} cm L`,
                      item.ancho != null && `${item.ancho} cm A`,
                    ].filter(Boolean).join(' × ')}
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <CalendarDays className="size-4" />
              Registro
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Creado el</span>
              <span className="font-medium">{item.createdAt}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Actualizado</span>
              <span className="font-medium">{item.updatedAt || '—'}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lightbox */}
      {slides.length > 0 && (
        <Lightbox
          open={lbIdx >= 0}
          close={() => setLbIdx(-1)}
          index={lbIdx}
          slides={slides}
          plugins={[Zoom, Thumbnails]}
          controller={{ closeOnBackdropClick: true }}
          zoom={{ maxZoomPixelRatio: 4 }}
          thumbnails={{ position: 'bottom', width: 72, height: 48, gap: 8, border: 0, borderRadius: 6 }}
          styles={{ root: { '--yarl__color_backdrop': 'rgba(0,0,0,0.94)', zIndex: 9999 } }}
        />
      )}
    </div>
  )
}
