'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, Sofa, CalendarDays, Ruler } from 'lucide-react'
import NProgress from 'nprogress'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Separator } from '@/shared/ui/separator'
import { cn } from '@/shared/lib/utils'
import { getStateOption } from '@/shared/config/entity-states'
import { useFurnitureListStore } from '../../stores/useFurnitureListStore'

export function FurnitureDetail({ id }: { id: string }) {
  const router = useRouter()
  const { currentItem, items, setCurrentItem } = useFurnitureListStore()

  useEffect(() => {
    if (!currentItem || String(currentItem.id) !== id) {
      const found = items.find((i) => String(i.id) === id)
      if (found) setCurrentItem(found)
      else router.replace('/furnitures')
    }
  }, [id, currentItem, items])

  const item = currentItem && String(currentItem.id) === id ? currentItem : null
  if (!item) return <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">Cargando...</div>

  const stateOpt = getStateOption(item.stateValue)

  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            {item.imageUrl ? (
              <div className="size-24 overflow-hidden rounded-lg border">
                <img src={item.imageUrl} alt={item.imageName ?? ''} className="size-full object-cover" />
              </div>
            ) : (
              <div className="flex size-24 items-center justify-center rounded-lg bg-muted">
                <Sofa className="size-8 text-muted-foreground" />
              </div>
            )}
            <div className="flex flex-1 flex-col gap-1">
              <h3 className="text-lg font-semibold">{item.name}</h3>
              {item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}
              {(item.largo || item.ancho) && (
                <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Ruler className="size-3.5" />
                  {[item.largo != null && `${item.largo} cm largo`, item.ancho != null && `${item.ancho} cm ancho`].filter(Boolean).join(' × ')}
                </p>
              )}
              <Badge variant="outline" className={cn('mt-1 w-fit text-xs', stateOpt.badge)}>{stateOpt.label}</Badge>
            </div>
            <Button variant="outline" size="sm" onClick={() => { NProgress.start(); router.push(`/furnitures/edit/${item.id}`) }}>
              <Pencil className="size-4 mr-1" />Editar
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Sofa className="size-4" />Especificaciones</CardTitle></CardHeader>
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
          {item.largo != null && (
            <>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Largo</span>
                <span className="font-medium tabular-nums">{item.largo} cm</span>
              </div>
            </>
          )}
          {item.ancho != null && (
            <>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ancho</span>
                <span className="font-medium tabular-nums">{item.ancho} cm</span>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><CalendarDays className="size-4" />Registro</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Creado el</span><span className="font-medium">{item.createdAt}</span></div>
          <Separator />
          <div className="flex justify-between"><span className="text-muted-foreground">Actualizado</span><span className="font-medium">{item.updatedAt || '—'}</span></div>
        </CardContent>
      </Card>
    </div>
  )
}
