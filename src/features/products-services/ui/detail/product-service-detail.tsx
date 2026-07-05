'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, Package, CalendarDays, Sofa } from 'lucide-react'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Separator } from '@/shared/ui/separator'
import { cn } from '@/shared/lib/utils'
import { getStateOption } from '@/shared/config/entity-states'
import { getProductServiceTypeLabel } from '../../data/data'
import { useProductServiceListStore } from '../../stores/useProductServiceListStore'
import NProgress from 'nprogress'

export function ProductServiceDetail({ id }: { id: string }) {
  const router = useRouter()
  const { currentItem, items, setCurrentItem, loadById } = useProductServiceListStore()

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

  return (
    <div className="flex max-w-lg flex-col gap-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="flex size-12 items-center justify-center rounded-lg bg-muted">
              <Package className="size-5 text-muted-foreground" />
            </div>
            <div className="flex flex-1 flex-col gap-1">
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
        <CardContent className="flex flex-col gap-2 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Precio</span><span className="font-medium">S/ {item.defaultPrice.toFixed(2)}</span></div>
          <Separator />
          <div className="flex justify-between"><span className="text-muted-foreground">Unidad</span><span className="font-medium">{item.unit || '—'}</span></div>
          <Separator />
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground flex items-center gap-1"><Sofa className="size-3.5" />Mueble vinculado</span>
            <span className="font-medium">{item.furnitureName || 'Sin mueble vinculado'}</span>
          </div>
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
