'use client'

import { useEffect } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { IconButton } from '@/shared/ui/icon-button'
import { Skeleton } from '@/shared/ui/skeleton'
import type { Currency } from '@/shared/ui/dashboard'
import { formatReportCell } from '../lib/format-cell'
import type { ReportKey, ReportRequestDto } from '../model/report.dto'
import { detailKey, useReportDetailStore } from '../stores/useReportDetailStore'
import { DetailSection } from './detail-section'

type Props = {
  report: ReportKey
  id: number
  params: ReportRequestDto
  currency: Currency
}

// Contenido de una fila expandida. El detalle se pide al backend recién al abrirla (carga perezosa).
export function ReportRowDetail({ report, id, params, currency }: Props) {
  const entry = useReportDetailStore((s) => s.details[detailKey(report, id)])
  const loadDetail = useReportDetailStore((s) => s.loadDetail)

  useEffect(() => {
    loadDetail(report, id, params)
    // `params` cambia de referencia en cada render: solo interesa volver a pedir si cambia la fila.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [report, id, loadDetail])

  if (!entry || entry.isLoading) {
    return (
      <div className='grid gap-2 p-3'>
        <Skeleton className='h-4 w-48' />
        <Skeleton className='h-16 w-full' />
      </div>
    )
  }

  if (entry.isError || !entry.data) {
    return (
      <div className='text-destructive flex items-center gap-2 p-3 text-sm'>
        <AlertCircle className='h-4 w-4 shrink-0' />
        <span>{entry.message ?? 'No se pudo cargar el detalle.'}</span>
        <IconButton label='Reintentar' icon={<RefreshCw />} size='icon' onClick={() => loadDetail(report, id, params)} />
      </div>
    )
  }

  const { title, subtitle, fields, sections } = entry.data

  return (
    <div className='flex flex-col gap-4 p-3'>
      <div>
        <p className='font-semibold'>{title}</p>
        {subtitle && <p className='text-muted-foreground text-xs'>{subtitle}</p>}
      </div>

      {/* Campos sueltos como grilla etiqueta / valor. */}
      {fields.length > 0 && (
        <dl className='grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3 lg:grid-cols-4'>
          {fields.map((field) => (
            <div key={field.label} className='min-w-0'>
              <dt className='text-muted-foreground text-xs'>{field.label}</dt>
              <dd className='truncate text-sm font-medium' title={String(field.value ?? '')}>
                {formatReportCell(field.value, field.type, currency)}
              </dd>
            </div>
          ))}
        </dl>
      )}

      {sections.map((section) => (
        <DetailSection key={section.title} section={section} currency={currency} />
      ))}
    </div>
  )
}
