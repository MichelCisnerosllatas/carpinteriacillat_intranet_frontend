'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, Phone, CalendarDays, Star, Globe } from 'lucide-react'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Separator } from '@/shared/ui/separator'
import { cn } from '@/shared/lib/utils'
import { getStateOption } from '@/shared/config/entity-states'
import { getContactTypeOption } from '../../data/data'
import { useCompanyContactListStore } from '../../stores/useCompanyContactListStore'
import NProgress from 'nprogress'

export function CompanyContactDetail({ id }: { id: string }) {
  const router = useRouter()
  const { currentItem, items, setCurrentItem } = useCompanyContactListStore()

  useEffect(() => {
    if (!currentItem || String(currentItem.id) !== id) {
      const found = items.find((i) => String(i.id) === id)
      if (found) setCurrentItem(found)
      else router.replace('/company-contacts')
    }
  }, [id, currentItem, items])

  const item = currentItem && String(currentItem.id) === id ? currentItem : null
  if (!item) return <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">Cargando...</div>

  const stateOpt = getStateOption(item.statusValue)
  const typeOpt = getContactTypeOption(item.type)

  return (
    <div className="flex max-w-lg flex-col gap-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="flex size-12 items-center justify-center rounded-lg bg-muted">
              <Phone className="size-5 text-muted-foreground" />
            </div>
            <div className="flex flex-1 flex-col gap-1">
              <h3 className="text-lg font-semibold">
                {item.name || item.phone}
                {item.isPrimary && <Star className="ml-1 inline size-4 fill-amber-400 text-amber-400" />}
              </h3>
              <p className="text-sm text-muted-foreground">{item.phone} · {typeOpt.label}</p>
              {item.email && <p className="text-sm text-muted-foreground">{item.email}</p>}
              <div className="mt-1 flex gap-2">
                <Badge variant="outline" className={cn('w-fit text-xs', stateOpt.badge)}>{stateOpt.label}</Badge>
                {item.showOnWebsite && (
                  <Badge variant="outline" className="w-fit gap-1 text-xs"><Globe className="size-3" />Visible en sitio web</Badge>
                )}
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => { NProgress.start(); router.push(`/company-contacts/edit/${item.id}`) }}>
              <Pencil className="size-4 mr-1" />Editar
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><CalendarDays className="size-4" />Registro</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Orden</span><span className="font-medium">{item.order}</span></div>
          <Separator />
          <div className="flex justify-between"><span className="text-muted-foreground">Creado el</span><span className="font-medium">{item.createdAt}</span></div>
          <Separator />
          <div className="flex justify-between"><span className="text-muted-foreground">Actualizado</span><span className="font-medium">{item.updatedAt || '—'}</span></div>
        </CardContent>
      </Card>
    </div>
  )
}
