'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, LayoutGrid, CalendarDays, Navigation2, ExternalLink, ListOrdered } from 'lucide-react'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Separator } from '@/shared/ui/separator'
import { cn } from '@/shared/lib/utils'
import { getStateOption } from '@/shared/config/entity-states'
import { useSectionListStore } from '../../stores/useSectionListStore'
import NProgress from 'nprogress'

export function SectionDetail({ id }: { id: string }) {
  const router = useRouter()
  const { currentItem, items, loadById, setCurrentItem } = useSectionListStore()

  // Siempre trae el registro fresco del backend — no depende de que la tabla ya esté cargada en memoria.
  useEffect(() => {
    void loadById(Number(id))
    return () => setCurrentItem(null)
  }, [id])

  const item = currentItem && String(currentItem.id) === id ? currentItem : items.find((i) => String(i.id) === id) ?? null
  if (!item) return <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">Cargando...</div>

  const stateOpt = getStateOption(item.stateValue)

  return (
    <div className="flex flex-col gap-6">
      {/* ── Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-muted">
            <LayoutGrid className="size-5 text-muted-foreground" />
          </div>
          <div className="flex flex-col gap-1.5">
            <div>
              <h2 className="text-2xl font-bold leading-tight">{item.name}</h2>
              {item.title && <p className="text-sm text-muted-foreground">{item.title}</p>}
            </div>
            {item.description && (
              <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">{item.description}</p>
            )}
            <Badge variant="outline" className={cn('w-fit text-xs', stateOpt.badge)}>{stateOpt.label}</Badge>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="shrink-0"
          onClick={() => { NProgress.start(); router.push(`/sections/edit/${item.id}`) }}
        >
          <Pencil className="mr-1.5 size-4" />Editar
        </Button>
      </div>

      {/* ── Info ── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><LayoutGrid className="size-4" />Tipo de Sección</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-2 text-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground">Nombre</span>
                <Badge variant="secondary" className="text-xs font-normal">{item.typesectionName || '—'}</Badge>
              </div>
              {item.typesectionDescription && (
                <>
                  <Separator />
                  <div className="flex justify-between gap-4">
                    <span className="shrink-0 text-muted-foreground">Descripción</span>
                    <span className="text-right font-medium">{item.typesectionDescription}</span>
                  </div>
                </>
              )}
              {item.typesectionStateLabel && (
                <>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Estado</span>
                    <Badge variant="outline" className={cn('text-xs', item.typesectionStateBadge)}>{item.typesectionStateLabel}</Badge>
                  </div>
                </>
              )}
              <Separator />
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-muted-foreground"><ListOrdered className="size-3.5" />Orden</span>
                <span className="font-medium">{item.order ?? '—'}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Navigation2 className="size-4" />Navegación conectada</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-2 text-sm">
              {item.navigationName ? (
                <>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground">Nombre</span>
                    <span className="font-medium">{item.navigationName}</span>
                  </div>
                  {item.navigationUrl && (
                    <>
                      <Separator />
                      <div className="flex items-center justify-between gap-2">
                        <span className="flex items-center gap-1.5 text-muted-foreground"><ExternalLink className="size-3.5" />URL</span>
                        <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{item.navigationUrl}</code>
                      </div>
                    </>
                  )}
                  {item.navigationDescription && (
                    <>
                      <Separator />
                      <div className="flex justify-between gap-4">
                        <span className="shrink-0 text-muted-foreground">Descripción</span>
                        <span className="text-right font-medium">{item.navigationDescription}</span>
                      </div>
                    </>
                  )}
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-muted-foreground"><ListOrdered className="size-3.5" />Orden</span>
                    <span className="font-medium">{item.navigationOrder ?? '—'}</span>
                  </div>
                  {item.navigationStateLabel && (
                    <>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Estado</span>
                        <Badge variant="outline" className={cn('text-xs', item.navigationStateBadge)}>{item.navigationStateLabel}</Badge>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <span className="text-muted-foreground">Sin navegación conectada.</span>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          {item.content && (
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><LayoutGrid className="size-4" />Contenido</CardTitle></CardHeader>
              <CardContent className="text-sm whitespace-pre-wrap text-muted-foreground">{item.content}</CardContent>
            </Card>
          )}

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><CalendarDays className="size-4" />Registro</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Creado el</span><span className="font-medium">{item.createdAtFormatted ?? item.createdAt}</span></div>
              <Separator />
              <div className="flex justify-between"><span className="text-muted-foreground">Actualizado</span><span className="font-medium">{item.updatedAtFormatted ?? item.updatedAt ?? '—'}</span></div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
