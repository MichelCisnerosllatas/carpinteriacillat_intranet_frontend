import { cn } from '@/shared/lib/utils'
import type { Currency } from '@/shared/ui/dashboard'
import { formatReportCell, isNumericColumn } from '../lib/format-cell'
import type { ReportDetailSectionDto } from '../model/report.dto'

// Mini tabla de una sección del detalle (ej. Productos, Pagos), con su fila de totales.
export function DetailSection({ section, currency }: { section: ReportDetailSectionDto; currency: Currency }) {
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
