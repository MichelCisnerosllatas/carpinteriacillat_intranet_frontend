'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CalendarDays, ImageIcon, Pencil, SortAsc } from 'lucide-react'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Separator } from '@/shared/ui/separator'
import { cn } from '@/shared/lib/utils'
import { getStateOption } from '@/shared/config/entity-states'
import { useTypeColorListStore } from '../stores/useTypeColorListStore'
import NProgress from 'nprogress'

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-0.5">
      <span className="shrink-0 text-sm text-muted-foreground">{label}</span>
      <span className="text-right text-sm font-medium">{value ?? '—'}</span>
    </div>
  )
}

export function TypeColorDetail({ id }: { id: string }) {
  const router = useRouter()
  const { currentItem, items, setCurrentItem } = useTypeColorListStore()

  useEffect(() => {
    if (!currentItem || String(currentItem.id) !== id) {
      const found = items.find((i) => String(i.id) === id)
      if (found) setCurrentItem(found)
      else router.replace('/typecolors')
    }
  }, [id, currentItem, items])

  const item = currentItem && String(currentItem.id) === id ? currentItem : null
  if (!item) {
    return <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">Cargando...</div>
  }

  const stateOpt = getStateOption(item.stateValue)

  return (
    <div className="flex max-w-lg flex-col gap-4">

      {/* ── Color hero card ── */}
      <Card className="overflow-hidden">
        {/* Full-width color strip */}
        <div
          className={cn('h-28 w-full', !item.hex && 'bg-muted')}
          style={item.hex ? { backgroundColor: item.hex } : undefined}
        />
        <CardContent className="pt-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-1.5">
              <h3 className="text-lg font-semibold leading-tight">{item.name}</h3>
              {item.code && (
                <span className="font-mono text-xs text-muted-foreground">{item.code}</span>
              )}
              {item.hex && (
                <span className="font-mono text-xs text-muted-foreground">{item.hex}</span>
              )}
              <Badge variant="outline" className={cn('w-fit text-xs', stateOpt.badge)}>
                {stateOpt.label}
              </Badge>
              {item.description && (
                <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="shrink-0"
              onClick={() => { NProgress.start(); router.push(`/typecolors/edit/${item.id}`) }}
            >
              <Pencil className="mr-1 size-4" />Editar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── Apariencia ── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">Apariencia</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          <DetailRow
            label="Color CSS"
            value={
              item.hex
                ? (
                  <div className="flex items-center gap-2">
                    <div className="size-4 rounded-sm border" style={{ backgroundColor: item.hex }} />
                    <span className="font-mono">{item.hex}</span>
                  </div>
                )
                : null
            }
          />
          <Separator />
          <DetailRow
            label="Orden en catálogo"
            value={
              <div className="flex items-center gap-1.5">
                <SortAsc className="size-3.5 text-muted-foreground" />
                {item.sortOrder}
              </div>
            }
          />
          {item.image && (
            <>
              <Separator />
              <DetailRow
                label="Imagen / textura"
                value={
                  <a
                    href={item.image}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-primary hover:underline"
                  >
                    <ImageIcon className="size-3.5" />Ver imagen
                  </a>
                }
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* ── Registro ── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <CalendarDays className="size-4" />Registro
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          <DetailRow label="Creado el" value={item.createdAt} />
          <Separator />
          <DetailRow label="Actualizado" value={item.updatedAt || null} />
        </CardContent>
      </Card>
    </div>
  )
}
