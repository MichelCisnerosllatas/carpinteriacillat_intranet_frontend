'use client'

import { Fragment, useState } from 'react'
import { ChevronDown, ChevronRight, Eye } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { IconButton } from '@/shared/ui/icon-button'
import { IconLinkButton } from '@/shared/ui/icon-link-button'
import { formatNumber, type Currency } from '@/shared/ui/dashboard'
import { formatReportCell, isNumericColumn } from '../lib/format-cell'
import { getRowHref, getRowLinkLabel } from '../lib/report-links'
import type { ReportDataDto, ReportKey, ReportRequestDto, ReportRowDto } from '../model/report.dto'
import { ReportRowDetail } from './report-row-detail'

type Props = {
  data: ReportDataDto
  report: ReportKey
  /** Filtros con los que se generó el reporte (se reenvían al pedir el detalle de una fila). */
  params: ReportRequestDto
  currency: Currency
}

// Se pintan las filas de a poco: un reporte puede traer hasta 5000 filas y dibujarlas todas
// de golpe (sobre todo como tarjetas en el celular) hace lenta la página.
const PAGE_SIZE = 100

// Clave estable de cada fila: su id (si lo trae) más la posición.
const rowKey = (row: ReportRowDto, index: number) => `${row.id ?? 'x'}-${index}`

// Tabla genérica: pinta cualquier reporte a partir de columns / rows / totals del backend.
// - En pantallas medianas o grandes: <table> con encabezado y totales fijos (sticky).
// - En el celular: tarjetas apiladas (una por fila), porque una tabla ancha no se puede leer.
export function ReportTable({ data, report, params, currency }: Props) {
  const { columns, rows, totals, has_detail: hasDetail } = data
  const hasTotals = Object.keys(totals ?? {}).length > 0
  const hasLinks = rows.some((row) => getRowHref(row.link) !== null)
  const showActions = hasDetail || hasLinks

  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  // Filas abiertas: se guardan por clave para poder abrir varias a la vez.
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  const toggle = (key: string) => setExpanded((prev) => ({ ...prev, [key]: !prev[key] }))
  const visibleRows = rows.slice(0, visibleCount)
  const canExpand = (row: ReportRowDto) => hasDetail && typeof row.id === 'number'

  // Botones de la fila (expandir y ver). Se usan igual en la tabla y en las tarjetas.
  const renderActions = (row: ReportRowDto, key: string) => {
    const href = getRowHref(row.link)
    const isOpen = expanded[key] ?? false
    return (
      <div className='flex items-center gap-0.5'>
        {canExpand(row) && (
          <IconButton
            label={isOpen ? 'Ocultar detalle' : 'Ver detalle'}
            icon={isOpen ? <ChevronDown /> : <ChevronRight />}
            variant='ghost'
            className='size-8'
            aria-expanded={isOpen}
            onClick={() => toggle(key)}
          />
        )}
        {href && <IconLinkButton href={href} label={getRowLinkLabel(row.link)} icon={<Eye />} className='size-8' />}
      </div>
    )
  }

  // La primera columna (ej. comprobante, cliente) hace de título en las tarjetas del celular.
  const [titleColumn, ...restColumns] = columns

  return (
    <div className='flex flex-col gap-3'>
      {/* ── Escritorio / tablet ── */}
      <div className='bg-card hidden max-h-[70vh] overflow-auto rounded-xl border md:block'>
        <table className='w-full min-w-max text-sm'>
          <thead className='bg-muted sticky top-0 z-10'>
            <tr>
              {showActions && (
                <th className='w-20 px-2 py-2.5'>
                  <span className='sr-only'>Acciones</span>
                </th>
              )}
              <th className='text-muted-foreground w-12 px-3 py-2.5 text-left text-xs font-medium'>#</th>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    'text-foreground px-3 py-2.5 text-xs font-semibold whitespace-nowrap',
                    isNumericColumn(column.type) ? 'text-right' : 'text-left'
                  )}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {visibleRows.map((row, index) => {
              const key = rowKey(row, index)
              return (
                <Fragment key={key}>
                  <tr className={cn('hover:bg-accent-warm/60 border-b transition-colors', expanded[key] && 'bg-muted/40')}>
                    {showActions && <td className='px-2 py-1'>{renderActions(row, key)}</td>}
                    <td className='text-muted-foreground px-3 py-2 text-xs tabular-nums'>{index + 1}</td>
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={cn(
                          'max-w-[280px] truncate px-3 py-2',
                          isNumericColumn(column.type) && 'text-right tabular-nums'
                        )}
                        title={String(row[column.key] ?? '')}
                      >
                        {formatReportCell(row[column.key], column.type, currency)}
                      </td>
                    ))}
                  </tr>
                  {expanded[key] && typeof row.id === 'number' && (
                    <tr className='bg-muted/30 border-b'>
                      {/* colSpan cubre todas las columnas: acciones + # + datos. */}
                      <td colSpan={columns.length + (showActions ? 2 : 1)} className='max-w-0'>
                        <ReportRowDetail report={report} id={row.id} params={params} currency={currency} />
                      </td>
                    </tr>
                  )}
                </Fragment>
              )
            })}
          </tbody>

          {hasTotals && (
            <tfoot className='bg-muted sticky bottom-0 z-10 border-t font-semibold'>
              <tr>
                {showActions && <td />}
                <td className='px-3 py-2.5 text-xs'>Total</td>
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn('px-3 py-2.5 whitespace-nowrap', isNumericColumn(column.type) && 'text-right tabular-nums')}
                  >
                    {column.key in totals ? formatReportCell(totals[column.key], column.type, currency) : ''}
                  </td>
                ))}
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* ── Celular: tarjetas apiladas ── */}
      <div className='flex flex-col gap-2 md:hidden'>
        {visibleRows.map((row, index) => {
          const key = rowKey(row, index)
          return (
            <div key={key} className='bg-card rounded-xl border'>
              <div className='flex items-start justify-between gap-2 p-3 pb-2'>
                <p className='min-w-0 truncate font-semibold'>
                  {titleColumn ? formatReportCell(row[titleColumn.key], titleColumn.type, currency) : `#${index + 1}`}
                </p>
                {showActions && renderActions(row, key)}
              </div>
              <dl className='grid grid-cols-2 gap-x-3 gap-y-1.5 px-3 pb-3'>
                {restColumns.map((column) => (
                  <div key={column.key} className='min-w-0'>
                    <dt className='text-muted-foreground text-[11px]'>{column.label}</dt>
                    <dd className={cn('truncate text-sm', isNumericColumn(column.type) && 'tabular-nums')}>
                      {formatReportCell(row[column.key], column.type, currency)}
                    </dd>
                  </div>
                ))}
              </dl>
              {expanded[key] && typeof row.id === 'number' && (
                <div className='bg-muted/30 border-t'>
                  <ReportRowDetail report={report} id={row.id} params={params} currency={currency} />
                </div>
              )}
            </div>
          )
        })}

        {hasTotals && (
          <div className='bg-muted rounded-xl border p-3'>
            <p className='mb-1.5 text-xs font-semibold uppercase'>Totales</p>
            <dl className='grid grid-cols-2 gap-x-3 gap-y-1.5'>
              {columns
                .filter((column) => column.key in totals)
                .map((column) => (
                  <div key={column.key}>
                    <dt className='text-muted-foreground text-[11px]'>{column.label}</dt>
                    <dd className='text-sm font-semibold tabular-nums'>
                      {formatReportCell(totals[column.key], column.type, currency)}
                    </dd>
                  </div>
                ))}
            </dl>
          </div>
        )}
      </div>

      {rows.length > visibleCount && (
        <div className='flex flex-col items-center gap-1'>
          <Button variant='outline' size='sm' onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}>
            Mostrar {formatNumber(Math.min(PAGE_SIZE, rows.length - visibleCount))} más
          </Button>
          <p className='text-muted-foreground text-xs'>
            Mostrando {formatNumber(visibleCount)} de {formatNumber(rows.length)} registros
          </p>
        </div>
      )}
    </div>
  )
}
