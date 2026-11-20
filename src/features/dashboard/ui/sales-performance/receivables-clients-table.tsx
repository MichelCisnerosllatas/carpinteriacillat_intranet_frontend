'use client'

import { cn } from '@/shared/lib/utils'
import { useReportHref } from '../../lib/use-report-href'
import { Badge } from '@/shared/ui/badge'
import { ChartCard, formatMoney, formatNumber, formatShortDate, type Currency } from '@/shared/ui/dashboard'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import type { ReceivableClientDto } from '../../model/dashboard-sales-performance.dto'

type Props = {
  data: ReceivableClientDto[] | undefined
  currency: Currency
}

// Color del badge de días según la antigüedad (mismos cortes que el gráfico de antigüedad).
function daysBadgeClass(days: number): string {
  if (days > 90) return 'bg-red-100/30 text-red-900 dark:text-red-200 border-red-300'
  if (days > 60) return 'bg-orange-100/30 text-orange-900 dark:text-orange-200 border-orange-300'
  if (days > 30) return 'bg-amber-100/30 text-amber-900 dark:text-amber-200 border-amber-200'
  return 'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200'
}

export function ReceivablesClientsTable({ data, currency }: Props) {
  // Botón ↗ "Ver en reportes" con el mismo periodo y moneda del dashboard.
  const reportHref = useReportHref('pagos', 'saldos')
  // Solo el top 5: el listado completo está en Reportes (botón ↗).
  const rows = (data ?? []).slice(0, 5)

  return (
    <ChartCard
      href={reportHref}
      title='Clientes con saldo'
      description='Los 5 clientes con mayor deuda (histórico)'
      isLoading={!data}
      isEmpty={rows.length === 0}
      emptyMessage='No hay clientes con saldo pendiente.'
    >
      <div className='overflow-x-auto'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead className='text-center'>Ventas</TableHead>
              <TableHead>Más antigua</TableHead>
              <TableHead className='text-right'>Saldo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((client, index) => (
              <TableRow key={`${client.client_id ?? 'varios'}-${index}`}>
                <TableCell className='max-w-[180px] truncate font-medium' title={client.client_name}>
                  {client.client_name}
                </TableCell>
                <TableCell className='text-center'>{formatNumber(client.sales_count)}</TableCell>
                <TableCell>
                  <div className='flex flex-col gap-1'>
                    <span className='text-xs'>{formatShortDate(client.oldest_issue_date)}</span>
                    <Badge variant='outline' className={cn(daysBadgeClass(client.days))}>
                      {formatNumber(client.days)} días
                    </Badge>
                  </div>
                </TableCell>
                <TableCell className='text-right font-semibold tabular-nums'>
                  {formatMoney(client.balance, currency)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </ChartCard>
  )
}
