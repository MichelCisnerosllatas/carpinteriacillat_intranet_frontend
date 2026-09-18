'use client'

import { CalendarDays, ExternalLink, LayoutGrid, ListOrdered, Navigation2 } from 'lucide-react'
import { Badge } from '@/shared/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { CardIcon } from '@/shared/ui/card-icon'
import { Separator } from '@/shared/ui/separator'
import { cn } from '@/shared/lib/utils'
import type { Section } from '../../../../data/schema'

/** Tab "Info general" del detalle de Section — tipo de sección, navegación conectada, contenido y fechas. Puramente presentacional: recibe el `Section` ya resuelto, no hace fetch propio. */
export function SectionDetailInfoTab({ item }: { item: Section }) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><CardIcon icon={LayoutGrid} color="blue" />Tipo de Sección</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm">
            {item.key && (
              <>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">Clave (section_key)</span>
                  <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{item.key}</code>
                </div>
                <Separator />
              </>
            )}
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
          <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><CardIcon icon={Navigation2} color="purple" />Navegación conectada</CardTitle></CardHeader>
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
            <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><CardIcon icon={LayoutGrid} color="amber" />Contenido</CardTitle></CardHeader>
            <CardContent className="text-sm whitespace-pre-wrap text-muted-foreground">{item.content}</CardContent>
          </Card>
        )}

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><CardIcon icon={CalendarDays} color="emerald" />Registro</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Creado el</span><span className="font-medium">{item.createdAtFormatted ?? item.createdAt}</span></div>
            <Separator />
            <div className="flex justify-between"><span className="text-muted-foreground">Actualizado</span><span className="font-medium">{item.updatedAtFormatted ?? item.updatedAt ?? '—'}</span></div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
