'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, Image as ImageIcon, CalendarDays, Rows3 } from 'lucide-react'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Separator } from '@/shared/ui/separator'
import { cn } from '@/shared/lib/utils'
import { getStateOption } from '@/shared/config/entity-states'
import { useSectionImageListStore } from '../stores/useSectionImageListStore'
import NProgress from 'nprogress'

export function SectionImageDetail({ id }: { id: string }) {
  const router = useRouter()
  const { currentItem, items, setCurrentItem } = useSectionImageListStore()

  useEffect(() => {
    if (!currentItem || String(currentItem.id) !== id) {
      const found = items.find((i) => String(i.id) === id)
      if (found) setCurrentItem(found)
      else router.replace('/section-images')
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
            <div className="flex size-16 overflow-hidden rounded-lg border bg-muted">
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.imageName} className="size-full object-cover" />
              ) : (
                <div className="flex size-full items-center justify-center">
                  <ImageIcon className="size-5 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="flex flex-1 flex-col gap-1">
              <h3 className="text-lg font-semibold">{item.imageName}</h3>
              <Badge variant="secondary" className="w-fit text-xs font-normal">{item.sectionName}</Badge>
              <Badge variant="outline" className={cn('mt-1 w-fit text-xs', stateOpt.badge)}>{stateOpt.label}</Badge>
            </div>
            <Button variant="outline" size="sm" onClick={() => { NProgress.start(); router.push(`/section-images/edit/${item.id}`) }}>
              <Pencil className="size-4 mr-1" />Editar
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Rows3 className="size-4" />Detalles</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Sección</span>
            <span className="font-medium">{item.sectionName}</span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="text-muted-foreground">Imagen</span>
            <span className="font-medium">{item.imageName}</span>
          </div>
          {item.imageUrl && (
            <>
              <Separator />
              <div className="flex justify-between items-center gap-2">
                <span className="text-muted-foreground">URL</span>
                <a href={item.imageUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary underline truncate max-w-[240px]">
                  {item.imageUrl}
                </a>
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
