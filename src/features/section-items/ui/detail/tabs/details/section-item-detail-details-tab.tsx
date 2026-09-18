'use client'

import { useRouter } from 'next/navigation'
import NProgress from 'nprogress'
import { ArrowUpDown, ListOrdered, Pencil, Plus, Rows3, Eye } from 'lucide-react'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import { cn } from '@/shared/lib/utils'
import { getStateOption } from '@/shared/config/entity-states'
import type { SectionItem } from '../../../../data/schema'

interface SectionItemDetailDetailsTabProps {
  item: SectionItem
  /** `web_settings.details_add` — oculta "Nuevo detalle" cuando este item no soporta sub-detalles (ver Sections_items::IDENTITY_LOCKED_TYPES / SectionItemSeeder). */
  canAdd?: boolean
  /** `web_settings.details_reorder` — oculta "Reordenar". */
  canReorder?: boolean
  /** `web_settings.details_delete` — reservado para cuando esta tabla tenga acción de eliminar por fila. */
  canDelete?: boolean
}

/**
 * Tab "Detalles" del detalle de SectionItem — usa `item.details`, el array que YA viene
 * embebido en la respuesta de `getById` (whenLoaded); no hace un fetch propio a
 * `section-item-details`, solo pinta lo que el item ya trajo.
 */
export function SectionItemDetailDetailsTab({ item, canAdd = true, canReorder = true }: SectionItemDetailDetailsTabProps) {
  const router = useRouter()
  const details = item.details ?? []

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle className="flex items-center gap-2 text-sm"><Rows3 className="size-4" />Detalles del item</CardTitle>
        <div className="flex items-center gap-2">
          {canReorder && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => { NProgress.start(); router.push(`/section-item-details/reorder?id_section_item=${item.id}`) }}
            >
              <ArrowUpDown className="mr-1.5 size-4" />Reordenar
            </Button>
          )}
          {canAdd && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => { NProgress.start(); router.push(`/section-item-details/create?id_section_item=${item.id}`) }}
            >
              <Plus className="mr-1.5 size-4" />Nuevo detalle
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {details.length === 0 ? (
          <div className="flex min-h-[120px] items-center justify-center text-sm text-muted-foreground">
            Este item no tiene detalles todavía.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {details.map((d) => {
              const dStateOpt = getStateOption(d.status === 'active' ? 1 : 0)
              return (
                <div key={d.id} className="flex items-start justify-between gap-3 rounded-lg border bg-card px-3 py-2.5">
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <span className="text-sm font-medium leading-none">{d.title || `Detalle #${d.id}`}</span>
                    {d.description && <span className="text-xs text-muted-foreground truncate max-w-[320px]">{d.description}</span>}
                    <div className="mt-1 flex items-center gap-2">
                      <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><ListOrdered className="size-3" />{d.order ?? '—'}</span>
                      <Badge variant="outline" className={cn('h-4 px-1 text-[10px]', dStateOpt.badge)}>{dStateOpt.label}</Badge>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost" size="icon" className="size-8"
                          onClick={() => { NProgress.start(); router.push(`/section-item-details/${d.id}`) }}
                        >
                          <Eye className="size-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Ver</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost" size="icon" className="size-8"
                          onClick={() => { NProgress.start(); router.push(`/section-item-details/edit/${d.id}`) }}
                        >
                          <Pencil className="size-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Editar</TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
