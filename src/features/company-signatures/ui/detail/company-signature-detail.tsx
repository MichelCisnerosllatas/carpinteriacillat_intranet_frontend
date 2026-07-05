'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, PenTool, CalendarDays, Phone } from 'lucide-react'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Separator } from '@/shared/ui/separator'
import { cn } from '@/shared/lib/utils'
import { getStateOption } from '@/shared/config/entity-states'
import { getImageUrl } from '@/features/images/lib/image-url'
import { useCompanySignatureListStore } from '../../stores/useCompanySignatureListStore'
import NProgress from 'nprogress'

export function CompanySignatureDetail({ id }: { id: string }) {
  const router = useRouter()
  const { currentItem, items, setCurrentItem } = useCompanySignatureListStore()

  useEffect(() => {
    if (!currentItem || String(currentItem.id) !== id) {
      const found = items.find((i) => String(i.id) === id)
      if (found) setCurrentItem(found)
      else router.replace('/company-signatures')
    }
  }, [id, currentItem, items])

  const item = currentItem && String(currentItem.id) === id ? currentItem : null
  if (!item) return <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">Cargando...</div>

  const stateOpt = getStateOption(item.statusValue)

  return (
    <div className="flex max-w-lg flex-col gap-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
              {item.signatureImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={getImageUrl(item.signatureImage)} alt={item.signerName} className="h-full w-full object-contain" />
              ) : (
                <PenTool className="size-6 text-muted-foreground" />
              )}
            </div>
            <div className="flex flex-1 flex-col gap-1">
              <h3 className="text-lg font-semibold">{item.signerName}</h3>
              {item.position && <p className="text-sm text-muted-foreground">{item.position}</p>}
              {item.phone && (
                <p className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Phone className="size-3.5" />{item.phone}
                </p>
              )}
              <Badge variant="outline" className={cn('mt-1 w-fit text-xs', stateOpt.badge)}>{stateOpt.label}</Badge>
            </div>
            <Button variant="outline" size="sm" onClick={() => { NProgress.start(); router.push(`/company-signatures/edit/${item.id}`) }}>
              <Pencil className="size-4 mr-1" />Editar
            </Button>
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
