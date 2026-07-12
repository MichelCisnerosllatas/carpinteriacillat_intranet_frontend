// src/features/proformas/ui/detail/proforma-detail-hero.tsx
'use client'

import { useRouter } from 'next/navigation'
import { Ban, CheckCircle2, Clock, FilePlus, FileText, Pencil, RefreshCw, Repeat, XCircle } from 'lucide-react'
import NProgress from 'nprogress'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import { cn, formatDisplayDate } from '@/shared/lib/utils'
import { getProformaStatusOption } from '../../data/data'
import type { Proforma, ProformaStatus } from '../../data/schema'

export const PROFORMA_STATUS_ICON: Record<ProformaStatus, typeof CheckCircle2> = {
  PENDIENTE: Clock,
  ACEPTADA: CheckCircle2,
  RECHAZADA: XCircle,
  ANULADA: Ban,
  VENCIDA: Clock,
  CONVERTIDA: Repeat,
}

export const PROFORMA_STATUS_ACCENT: Record<ProformaStatus, string> = {
  PENDIENTE: 'bg-amber-400',
  ACEPTADA: 'bg-teal-500',
  RECHAZADA: 'bg-red-500',
  ANULADA: 'bg-neutral-400',
  VENCIDA: 'bg-orange-500',
  CONVERTIDA: 'bg-blue-500',
}

interface ProformaDetailHeroProps {
  item: Proforma
  isRefreshing: boolean
  onRefresh: () => void
}

export function ProformaDetailHero({ item, isRefreshing, onRefresh }: ProformaDetailHeroProps) {
  const router = useRouter()
  const statusOpt = getProformaStatusOption(item.status)
  const StatusIcon = PROFORMA_STATUS_ICON[item.status]

  const goTo = (path: string) => {
    NProgress.start()
    router.push(path)
  }

  return (
    <Card className="gap-0 overflow-hidden py-0">
      <div className={cn('h-1.5 w-full', PROFORMA_STATUS_ACCENT[item.status])} />
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
            </div>
            <p className="text-muted-foreground text-xs">
              {item.clientName ?? item.clientBusinessName ?? '—'} · Emitida el {formatDisplayDate(item.issueDate)}
              {item.dueDate && <> · Vence el {formatDisplayDate(item.dueDate)}</>}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" onClick={() => goTo('/proformas/create')}>
                <FilePlus className="mr-1 size-4" />
                Nueva
              </Button>
            </TooltipTrigger>
            <TooltipContent>Crear una proforma nueva</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" onClick={() => goTo(`/proformas/edit/${item.id}`)}>
                <Pencil className="mr-1 size-4" />
                Editar
              </Button>
            </TooltipTrigger>
            <TooltipContent>Editar esta proforma</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="size-9" disabled={isRefreshing} onClick={onRefresh}>
                <RefreshCw className={cn('size-4', isRefreshing && 'animate-spin')} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Actualizar datos y PDF</TooltipContent>
          </Tooltip>
        </div>
      </CardContent>
    </Card>
  )
}
