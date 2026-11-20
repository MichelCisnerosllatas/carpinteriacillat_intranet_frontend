'use client'

import { useEffect } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { IconButton } from '@/shared/ui/icon-button'
import { Skeleton } from '@/shared/ui/skeleton'
import type { Currency } from '@/shared/ui/dashboard'
import { formatReportCell, isNumericColumn } from '../lib/format-cell'
import type { ReportDetailSectionDto, ReportKey, ReportRequestDto } from '../model/report.dto'
import { detailKey, useReportDetailStore } from '../stores/useReportDetailStore'

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

// Mini tabla de una sección del detalle (ej. Productos, Pagos), con su fila de totales.
function DetailSection({ section, currency }: { section: ReportDetailSectionDto; currency: Currency }) {
  const totals = section.totals ?? {}
  const hasTotals = Object.keys(totals).length > 0

  return (
    <div className='min-w-0'>
      <p className='mb-1.5 text-xs font-semibold tracking-wide uppercase'>{section.title}</p>
      <div className='bg-background overflow-x-auto rounded-lg border'>
        <table className='w-full text-xs'>
          <thead className='bg-muted/60'>
            <tr>
              {section.columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    'px-2.5 py-1.5 font-medium whitespace-nowrap',
                    isNumericColumn(column.type) ? 'text-right' : 'text-left'
                  )}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {section.rows.map((row, index) => (
              <tr key={index} className='border-t'>
                {section.columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn(
                      'px-2.5 py-1.5',
                      // El texto largo (ej. el mensaje completo) se deja partir en varias líneas.
                      isNumericColumn(column.type) ? 'text-right whitespace-nowrap tabular-nums' : 'break-words'
                    )}
                  >
                    {formatReportCell(row[column.key], column.type, currency)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          {hasTotals && (
            <tfoot className='bg-muted/60 border-t font-semibold'>
              <tr>
                {section.columns.map((column, i) => (
                  <td
                    key={column.key}
                    className={cn('px-2.5 py-1.5 whitespace-nowrap', isNumericColumn(column.type) && 'text-right tabular-nums')}
                  >
                    {column.key in totals
                      ? formatReportCell(totals[column.key], column.type, currency)
                      : i === 0
                        ? 'Total'
                        : ''}
                  </td>
                ))}
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  )
}
