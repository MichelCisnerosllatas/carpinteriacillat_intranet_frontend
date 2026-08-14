'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, Package, CalendarDays, Sofa, Tag, Palette, TreePine, ZoomIn } from 'lucide-react'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Separator } from '@/shared/ui/separator'
import { ImageLightbox } from '@/shared/ui/image-lightbox'
import { cn } from '@/shared/lib/utils'
import { getStateOption } from '@/shared/config/entity-states'
import { getProductServiceTypeLabel } from '../../data/data'
import { useProductServiceListStore } from '../../stores/useProductServiceListStore'
import NProgress from 'nprogress'

function DetailField({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="flex items-center gap-1 text-xs text-muted-foreground">{icon}{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  )
}

export function ProductServiceDetail({ id }: { id: string }) {
  const router = useRouter()
  const { currentItem, items, setCurrentItem, loadById } = useProductServiceListStore()
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  useEffect(() => {
    if (!currentItem || String(currentItem.id) !== id) {
      const found = items.find((i) => String(i.id) === id)
      if (found) setCurrentItem(found)
      else void loadById(Number(id))
    }
  }, [id, currentItem, items])

  const item = currentItem && String(currentItem.id) === id ? currentItem : null
  if (!item) return <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">Cargando...</div>

  const stateOpt = getStateOption(item.stateValue)
  const hasImages = item.galleryImages.length > 0

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[340px_1fr] lg:items-start">
        <Card className="overflow-hidden py-0">
          <CardContent className="flex flex-col gap-2 p-2">
            <button
              type="button"
              disabled={!hasImages}
              onClick={() => setLightboxIndex(0)}
              className={cn(
                'group relative flex aspect-square items-center justify-center overflow-hidden rounded-md bg-muted',
                hasImages && 'cursor-zoom-in'
              )}
            >
              {hasImages ? (
                <>
                  <img src={item.galleryImages[0].src} alt={item.name} className="size-full object-cover" />
                  {/* En touch no hay :hover para revelar el ícono — el tap ya abre el
                      lightbox igual, esto es solo la pista visual, también en touch */}
                  <span className="absolute inset-0 hidden items-center justify-center bg-black/40 group-hover:flex pointer-coarse:flex">
                    <ZoomIn className="size-6 text-white" />
                  </span>
                </>
              ) : (
                <Package className="size-10 text-muted-foreground" />
              )}
            </button>

            {item.galleryImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {item.galleryImages.map((img, i) => (
                  <button
                    key={img.src}
                    type="button"
                    onClick={() => setLightboxIndex(i)}
                    className="size-14 shrink-0 overflow-hidden rounded-md border"
                  >
                    <img src={img.src} alt={img.alt ?? item.name} className="size-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <h3 className="text-lg font-semibold">{item.name}</h3>
                  {item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    <Badge variant="secondary" className="w-fit text-xs">{getProductServiceTypeLabel(item.type)}</Badge>
                    <Badge variant="outline" className={cn('w-fit text-xs', stateOpt.badge)}>{stateOpt.label}</Badge>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => { NProgress.start(); router.push(`/products-services/edit/${item.id}`) }}>
                  <Pencil className="size-4 mr-1" />Editar
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm">Detalle</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                <DetailField label="Precio" value={`S/ ${item.defaultPrice.toFixed(2)}`} />
                <DetailField label="Unidad" value={item.unit || '—'} />
                <DetailField label="Mueble vinculado" value={item.furnitureName || 'Sin mueble vinculado'} icon={<Sofa className="size-3.5" />} />
                <DetailField label="Categoría" value={item.furnitureCategory || '—'} icon={<Tag className="size-3.5" />} />
                <DetailField label="Color" value={item.furnitureColor || '—'} icon={<Palette className="size-3.5" />} />
                <DetailField label="Madera" value={item.furnitureWood || '—'} icon={<TreePine className="size-3.5" />} />
              </div>

              <Separator className="my-4" />

              <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                <DetailField label="Creado el" value={item.createdAt} icon={<CalendarDays className="size-3.5" />} />
                <DetailField label="Actualizado" value={item.updatedAt || '—'} icon={<CalendarDays className="size-3.5" />} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {hasImages && (
        <ImageLightbox
          images={item.galleryImages}
          open={lightboxIndex !== null}
          onOpenChange={(open) => { if (!open) setLightboxIndex(null) }}
          initialIndex={lightboxIndex ?? 0}
          title={item.name}
        />
      )}
    </div>
  )
}
