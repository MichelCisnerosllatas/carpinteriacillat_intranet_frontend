'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, MousePointerClick, CalendarDays, ListOrdered, ExternalLink, Layers } from 'lucide-react'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Separator } from '@/shared/ui/separator'
import { cn } from '@/shared/lib/utils'
import { getStateOption } from '@/shared/config/entity-states'
import { FaIcon } from '@/shared/ui/icon-picker/fa-icon'
import { useSectionButtonListStore } from '../../stores/useSectionButtonListStore'
import NProgress from 'nprogress'

export function SectionButtonDetail({ id }: { id: string }) {
  const router = useRouter()
  const { currentItem, items, loadById, setCurrentItem } = useSectionButtonListStore()

  // Siempre trae el registro fresco del backend — no depende de que la tabla ya esté cargada en memoria.
  useEffect(() => {
    void loadById(Number(id))
    return () => setCurrentItem(null)
  }, [id])

  const item = currentItem && String(currentItem.id) === id ? currentItem : items.find((i) => String(i.id) === id) ?? null
  if (!item) return <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">Cargando...</div>

  const stateOpt = getStateOption(item.stateValue)

  return (
    <div className="flex max-w-lg flex-col gap-4">
      {/* ── Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-muted">
            <MousePointerClick className="size-5 text-muted-foreground" />
          </div>
          <div className="flex flex-col gap-1.5">
            <h2 className="text-2xl font-bold leading-tight">{item.label}</h2>
            {/* No hay endpoint `_join` para este recurso, así que no hay nombre de sección
                disponible — se muestra el id tal cual. */}
            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Layers className="size-3.5" />Sección #{item.idSection}
            </span>
            <Badge variant="outline" className={cn('w-fit text-xs', stateOpt.badge)}>{stateOpt.label}</Badge>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="shrink-0"
          onClick={() => { NProgress.start(); router.push(`/section-buttons/edit/${item.id}`) }}
        >
          <Pencil className="mr-1.5 size-4" />Editar
        </Button>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><MousePointerClick className="size-4" />Detalles</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm">
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 text-muted-foreground"><ExternalLink className="size-3.5" />URL</span>
            {item.url ? (
              <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary underline truncate max-w-[240px]">
                {item.url}
              </a>
            ) : (
              <span className="font-medium">—</span>
            )}
          </div>
          <Separator />
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground">Icono</span>
            {item.icon ? (
              <span className="flex items-center gap-1.5">
                <FaIcon value={item.icon} className="size-4" />
                <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{item.icon}</code>
              </span>
            ) : (
              <span className="font-medium">—</span>
            )}
          </div>
          <Separator />
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground">Variante</span>
            <span className="font-medium">{item.variant ?? '—'}</span>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-muted-foreground"><ListOrdered className="size-3.5" />Orden</span>
            <span className="font-medium">{item.order ?? '—'}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><CalendarDays className="size-4" />Registro</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Creado el</span><span className="font-medium">{item.createdAtFormatted ?? item.createdAt}</span></div>
          <Separator />
          <div className="flex justify-between"><span className="text-muted-foreground">Actualizado</span><span className="font-medium">{(item.updatedAtFormatted ?? item.updatedAt) || '—'}</span></div>
        </CardContent>
      </Card>
    </div>
  )
}
