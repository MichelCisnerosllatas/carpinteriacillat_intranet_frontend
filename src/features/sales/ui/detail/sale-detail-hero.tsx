// src/features/sales/ui/detail/sale-detail-hero.tsx
'use client'

import { useRouter } from 'next/navigation'
import { Ban, CheckCircle2, Clock, FilePlus, FileText, Pencil, RefreshCw } from 'lucide-react'
import NProgress from 'nprogress'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import { cn } from '@/shared/lib/utils'
import { getSaleStatusOption, getSalePaymentStatusOption } from '../../data/data'
import type { Sale, SaleStatus } from '../../data/schema'

export const SALE_STATUS_ICON: Record<SaleStatus, typeof CheckCircle2> = {
  GUARDADA: Clock,
  EMITIDA: CheckCircle2,
  ANULADA: Ban,
}

export const SALE_STATUS_ACCENT: Record<SaleStatus, string> = {
  GUARDADA: 'bg-amber-400',
  EMITIDA: 'bg-teal-500',
  ANULADA: 'bg-neutral-400',
}

interface SaleDetailHeroProps {
  item: Sale
  isRefreshing: boolean
  onRefresh: () => void
}

export function SaleDetailHero({ item, isRefreshing, onRefresh }: SaleDetailHeroProps) {
  const router = useRouter()
  const statusOpt = getSaleStatusOption(item.status)
  const paymentStatusOpt = getSalePaymentStatusOption(item.paymentStatus)
  const StatusIcon = SALE_STATUS_ICON[item.status]

  const goTo = (path: string) => {
    NProgress.start()
    router.push(path)
  }

  return (
    <Card className="gap-0 overflow-hidden py-0">
      <div className={cn('h-1.5 w-full', SALE_STATUS_ACCENT[item.status])} />
      <CardContent className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
            <FileText className="size-4 text-muted-foreground" />
          </div>
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold tracking-tight">{item.code}</h3>
              <Badge variant="outline" className={cn('gap-1 text-xs', statusOpt.badge)}>
                <StatusIcon className="size-3" />
                {statusOpt.label}
              </Badge>
              <Badge variant="outline" className={cn('text-xs', paymentStatusOpt.badge)}>
                {paymentStatusOpt.label}
              </Badge>
            </div>
            <p className="text-muted-foreground text-xs">
              {item.clientBusinessName ?? '—'} · Emitida el {item.issueDateFormatted ?? item.issueDate}
              {item.dueDate && <> · Vence el {item.dueDateFormatted ?? item.dueDate}</>}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" onClick={() => goTo('/sales/create')}>
                <FilePlus className="mr-1 size-4" />
                Nueva
              </Button>
            </TooltipTrigger>
            <TooltipContent>Crear una venta nueva</TooltipContent>
          </Tooltip>
          {item.status === 'GUARDADA' && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={() => goTo(`/sales/edit/${item.id}`)}>
                  <Pencil className="mr-1 size-4" />
                  Editar
                </Button>
              </TooltipTrigger>
              <TooltipContent>Editar esta venta</TooltipContent>
            </Tooltip>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="size-9" disabled={isRefreshing} onClick={onRefresh}>
                <RefreshCw className={cn('size-4', isRefreshing && 'animate-spin')} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Actualizar datos</TooltipContent>
          </Tooltip>
        </div>
      </CardContent>
    </Card>
  )
}
