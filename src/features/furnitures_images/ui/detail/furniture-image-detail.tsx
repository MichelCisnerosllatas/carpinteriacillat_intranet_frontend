'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CalendarDays, ImageOff, Sofa } from 'lucide-react'
import Lightbox from 'yet-another-react-lightbox'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'
import 'yet-another-react-lightbox/styles.css'
import { Badge } from '@/shared/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Separator } from '@/shared/ui/separator'
import { Button } from '@/shared/ui/button'
import { cn } from '@/shared/lib/utils'
import { getStateOption } from '@/shared/config/entity-states'
import { useFurnitureImageListStore } from '../../stores/useFurnitureImageListStore'
import { furnitureImagesService } from '../../services/furnitures-images.service'
import { buildImageUrl } from '@/shared/lib/images'
import type { FurnitureImage } from '../../data/schema'
import type { FurnitureImageJoinApiItem } from '../../model/furnitures-image-api-item.dto'

function mapFromJoin(raw: FurnitureImageJoinApiItem): FurnitureImage {
  const stateOpt = getStateOption(raw.furnitureimage_state)
  return {
    id: raw.id_furniture_image,
    furnitureId: raw.furniture?.id_furniture ?? 0,
    furnitureName: raw.furniture?.furniture_name ?? '',
    imageId: raw.image?.id_image ?? 0,
    imageUrl: buildImageUrl(raw.image?.image_patch ?? null),
    imagePatch: raw.image?.image_patch ?? null,
    imageName: raw.image?.image_name ?? null,
    imageTitle: raw.image?.image_title ?? null,
    imageAlt: raw.image?.image_alt ?? null,
    order: raw.furnitureimage_order,
    stateValue: raw.furnitureimage_state,
    statusLabel: stateOpt.label,
    createdAt: raw.furnitureimage_created_at,
    updatedAt: raw.furnitureimage_updated_at,
  }
}

export function FurnitureImageDetail({ id }: { id: string }) {
  const router = useRouter()
  const { currentItem, items, setCurrentItem } = useFurnitureImageListStore()
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (currentItem && String(currentItem.id) === id) return
    const found = items.find((i) => String(i.id) === id)
    if (found) { setCurrentItem(found); return }
    // fetch by id
    furnitureImagesService.getById(Number(id))
      .then((res) => {
        if (res.success && res.data) setCurrentItem(mapFromJoin(res.data))
        else setNotFound(true)
      })
      .catch(() => setNotFound(true))
  }, [id])

  if (notFound) {
    return (
      <div className="flex min-h-[200px] flex-col items-center justify-center gap-3">
        <p className="text-sm text-muted-foreground">Imagen de mueble no encontrada.</p>
        <Button variant="outline" size="sm" onClick={() => router.push('/furniture-images')}>
          Volver al listado
        </Button>
      </div>
    )
  }

  const item = currentItem && String(currentItem.id) === id ? currentItem : null
  if (!item) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
        Cargando...
      </div>
    )
  }

  const stateOpt = getStateOption(item.stateValue)

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Left: image */}
      <div className="flex flex-col gap-4">
        <Card className="overflow-hidden">
          <div className="relative aspect-square w-full overflow-hidden bg-muted">
            {item.imageUrl ? (
              <button
                type="button"
                onClick={() => setLightboxOpen(true)}
                className="h-full w-full cursor-zoom-in"
              >
                <img
                  src={item.imageUrl}
                  alt={item.imageAlt ?? item.imageName ?? ''}
                  className="size-full object-cover transition-transform duration-300 hover:scale-105"
                />
              </button>
            ) : (
              <div className="flex size-full items-center justify-center">
                <ImageOff className="size-12 text-muted-foreground/30" />
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Right: info */}
      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sofa className="size-4" />
              Información
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Mueble</span>
              <span className="font-medium">{item.furnitureName}</span>
            </div>
            <Separator />
            {item.imageName && (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Imagen</span>
                  <span className="font-medium">{item.imageName}</span>
                </div>
                <Separator />
              </>
            )}
            {item.imageTitle && (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Título</span>
                  <span className="font-medium">{item.imageTitle}</span>
                </div>
                <Separator />
              </>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Orden</span>
              <span className="font-semibold tabular-nums">{item.order ?? '—'}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Estado</span>
              <Badge variant="outline" className={cn('text-xs', stateOpt.badge)}>
                {stateOpt.label}
              </Badge>
            </div>
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
              <span className="font-medium">{item.createdAt ?? '—'}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Actualizado</span>
              <span className="font-medium">{item.updatedAt ?? '—'}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {item.imageUrl && (
        <Lightbox
          open={lightboxOpen}
          close={() => setLightboxOpen(false)}
          slides={[{ src: item.imageUrl, alt: item.imageAlt ?? item.imageName ?? '' }]}
          plugins={[Zoom]}
          controller={{ closeOnBackdropClick: true }}
          zoom={{ maxZoomPixelRatio: 4 }}
          styles={{ root: { '--yarl__color_backdrop': 'rgba(0,0,0,0.94)', zIndex: 9999 } }}
        />
      )}
    </div>
  )
}
