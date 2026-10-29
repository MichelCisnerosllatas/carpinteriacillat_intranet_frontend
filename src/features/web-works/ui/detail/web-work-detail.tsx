'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import NProgress from 'nprogress'
import { CalendarDays, ClipboardList, EyeOff, ImageOff, Images, Pencil, Sofa, SplitSquareHorizontal, Star } from 'lucide-react'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Separator } from '@/shared/ui/separator'
import { ImageLightbox, type LightboxImage } from '@/shared/ui/image-lightbox'
import { cn } from '@/shared/lib/utils'
import { webWorksService } from '../../services/web-works.service'
import { mapWebWorkFromApi } from '../../stores/useWebWorkListStore'
import { getTypeWorkBadge, getWebWorkStateOption, RESTORATION_KEY } from '../../data/data'
import type { WebWork } from '../../data/schema'
import { WebWorksError } from '../web-works-error'

const priceFormatter = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' })

export function WebWorkDetail({ id }: { id: string }) {
  const router = useRouter()
  const [item, setItem]           = useState<WebWork | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError]         = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [lightbox, setLightbox]   = useState<{ images: LightboxImage[]; index: number } | null>(null)

  // Se pide siempre por id: el listado no trae fotos ni pares completos
  useEffect(() => {
    let cancelled = false
    webWorksService.getById(Number(id))
      .then((res) => {
        if (cancelled) return
        if (res.success && res.data) setItem(mapWebWorkFromApi(res.data))
        else setError(res.message || 'No se encontró el trabajo.')
      })
      .catch((e: any) => { if (!cancelled) setError(e?.response?.data?.message ?? 'No se pudo cargar el trabajo.') })
      .finally(() => { if (!cancelled) setIsLoading(false) })
    return () => { cancelled = true }
  }, [id, reloadKey])

  if (isLoading) return <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">Cargando...</div>
  if (error || !item) return <WebWorksError title="Error al cargar el trabajo" message={error ?? undefined} onRetry={() => { setIsLoading(true); setError(null); setReloadKey((k) => k + 1) }} />

  const stateOpt = getWebWorkStateOption(item.stateValue)
  const isRestoration = item.typeworkKey === RESTORATION_KEY
  const galleryImages: LightboxImage[] = item.images.filter((i) => i.url).map((i) => ({ src: i.url as string, alt: i.caption ?? i.name }))

  const facts: Array<[string, string | null]> = [
    ['Categoría', item.categoryName],
    ['Madera', item.woodName],
    ['Estilo', item.style],
    ['Medidas', item.measures],
    ['Acabado', item.finish],
    ['Tiempo de fabricación', item.buildTime],
    ['Ubicación', item.location],
    ['Fecha de entrega', item.deliveredAt],
    ['Precio aprox.', item.priceApprox != null ? priceFormatter.format(item.priceApprox) : null],
    ['Orden en la galería', item.order != null ? String(item.order) : null],
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="grid items-start gap-4 grid-cols-[repeat(auto-fit,minmax(min(100%,340px),1fr))]">
        {/* Cabecera + portada */}
        <Card>
          <CardContent className="pt-6 flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <div className="flex flex-1 flex-col gap-1.5">
                <h3 className="text-lg font-semibold leading-tight">{item.title}</h3>
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="outline" className={cn('text-xs', getTypeWorkBadge(item.typeworkKey))}>{item.typeworkName}</Badge>
                  <Badge variant="outline" className={cn('text-xs', stateOpt.badge)}>{stateOpt.label}</Badge>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => { NProgress.start(); router.push(`/web-works/edit/${item.id}`) }}>
                <Pencil className="size-4 mr-1" />Editar
              </Button>
            </div>
            <div className="aspect-[4/3] w-full overflow-hidden rounded-md border bg-muted">
              {item.coverUrl
                ? <img src={item.coverUrl} alt={item.title} className="h-full w-full object-cover" />
                : <div className="flex h-full flex-col items-center justify-center gap-1 text-xs text-muted-foreground"><ImageOff className="size-6" />Sin portada (la web usa la primera foto)</div>}
            </div>
            {item.description && <p className="whitespace-pre-line text-sm text-muted-foreground">{item.description}</p>}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><ClipboardList className="size-4" />Ficha</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-2 text-sm">
              {facts.map(([label, value], idx) => (
                <div key={label} className="flex flex-col gap-2">
                  {idx > 0 && <Separator />}
                  <div className="flex justify-between gap-3"><span className="text-muted-foreground">{label}</span><span className="text-right font-medium">{value || '—'}</span></div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Sofa className="size-4" />Mueble y reseñas</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Mueble relacionado</span>
                {item.furnitureId
                  ? <Link href={`/furnitures/edit/${item.furnitureId}`} className="text-right font-medium text-primary hover:underline">{item.furnitureName ?? `#${item.furnitureId}`}</Link>
                  : <span className="font-medium">—</span>}
              </div>
              <Separator />
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Reseñas</span>
                <span className="flex items-center gap-1 font-medium">
                  {item.testimoniesCount}
                  {item.ratingAvg != null && <span className="flex items-center gap-0.5 text-amber-600"><Star className="size-3.5 fill-current" />{item.ratingAvg.toFixed(1)}</span>}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><CalendarDays className="size-4" />Registro</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Creado el</span><span className="font-medium">{item.createdAt || '—'}</span></div>
              <Separator />
              <div className="flex justify-between"><span className="text-muted-foreground">Actualizado</span><span className="font-medium">{item.updatedAt || '—'}</span></div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Galería */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Images className="size-4" />Fotos de galería ({item.images.length})</CardTitle></CardHeader>
        <CardContent>
          {item.images.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin fotos de galería.</p>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-3">
              {item.images.map((img) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => img.url && setLightbox({ images: galleryImages, index: Math.max(galleryImages.findIndex((g) => g.src === img.url), 0) })}
                  className={cn('flex flex-col gap-1 text-left', !img.visible && 'opacity-60')}
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md border bg-muted">
                    {img.url ? <img src={img.url} alt={img.caption ?? img.name} className="h-full w-full object-cover" /> : <ImageOff className="m-auto size-5 text-muted-foreground" />}
                    {!img.visible && <span className="absolute right-1 top-1 flex items-center gap-0.5 rounded bg-black/70 px-1.5 text-[10px] text-white"><EyeOff className="size-3" />Oculta</span>}
                    {item.coverId === img.idImage && <span className="absolute bottom-1 right-1 flex items-center gap-0.5 rounded bg-amber-500 px-1.5 text-[10px] text-white"><Star className="size-3" />Portada</span>}
                  </div>
                  {img.caption && <span className="line-clamp-1 text-xs text-muted-foreground">{img.caption}</span>}
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pares Antes / Después */}
      {(isRestoration || item.pairs.length > 0) && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><SplitSquareHorizontal className="size-4" />Pares Antes / Después ({item.pairs.length})</CardTitle></CardHeader>
          <CardContent>
            {item.pairs.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin pares: este trabajo no aparece en el comparador «Restauración».</p>
            ) : (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,300px),1fr))] gap-3">
                {item.pairs.map((pair, idx) => {
                  const pairImages: LightboxImage[] = [pair.before, pair.after]
                    .filter((p): p is NonNullable<typeof p> => !!p?.url)
                    .map((p) => ({ src: p.url as string, alt: p.name }))
                  return (
                    <div key={pair.id} className={cn('flex flex-col gap-2 rounded-lg border p-2', !pair.visible && 'opacity-60')}>
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold">Par {idx + 1}</span>
                        {!pair.visible && <span className="flex items-center gap-0.5 text-muted-foreground"><EyeOff className="size-3" />Oculto</span>}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {(['before', 'after'] as const).map((side, sIdx) => {
                          const ref = pair[side]
                          return (
                            <button
                              key={side}
                              type="button"
                              onClick={() => ref?.url && setLightbox({ images: pairImages, index: Math.max(pairImages.findIndex((p) => p.src === ref.url), 0) })}
                              className="relative aspect-[4/3] overflow-hidden rounded border bg-muted"
                            >
                              {ref?.url ? <img src={ref.url} alt={ref.name} className="h-full w-full object-cover" /> : <ImageOff className="m-auto size-5 text-muted-foreground" />}
                              <span className="absolute bottom-1 left-1 rounded bg-black/70 px-1.5 text-[10px] text-white">{sIdx === 0 ? 'Antes' : 'Después'}</span>
                            </button>
                          )
                        })}
                      </div>
                      {pair.caption && <span className="text-xs text-muted-foreground">{pair.caption}</span>}
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <ImageLightbox
        images={lightbox?.images ?? []}
        open={lightbox != null}
        onOpenChange={(open) => { if (!open) setLightbox(null) }}
        initialIndex={lightbox?.index ?? 0}
        title={item.title}
      />
    </div>
  )
}
