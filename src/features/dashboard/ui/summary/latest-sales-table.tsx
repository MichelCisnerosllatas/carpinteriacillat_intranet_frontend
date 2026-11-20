'use client'

import { ChartCard, formatMoney, formatShortDate, type Currency } from '@/shared/ui/dashboard'
import { useReportHref } from '../../lib/use-report-href'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import type { SummaryLatestSaleDto } from '../../model/dashboard-summary.dto'
import { PaymentStatusBadge, SaleStatusBadge } from '../common/status-badge'

type Props = {
  data: SummaryLatestSaleDto[] | undefined
  currency: Currency
}

export function LatestSalesTable({ data, currency }: Props) {
  // Botón ↗ "Ver en reportes" con el mismo periodo y moneda del dashboard.
  const reportHref = useReportHref('ventas')
  // Solo el top 5: el listado completo está en Reportes (botón ↗).
  const rows = (data ?? []).slice(0, 5)

  return (
    <ChartCard
      href={reportHref}
      title='Últimas ventas'
      description='Las 5 ventas más recientes'
      isLoading={!data}
      isEmpty={rows.length === 0}
      emptyMessage='Aún no hay ventas registradas.'
    >
      <div className='overflow-x-auto'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Venta</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead className='text-right'>Total</TableHead>
              <TableHead className='text-right'>Saldo</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((sale) => (
              <TableRow key={sale.id}>
                <TableCell>
                  <p className='font-medium'>{sale.code}</p>
                  <p className='text-muted-foreground text-xs'>{formatShortDate(sale.issue_date)}</p>
                </TableCell>
                <TableCell className='max-w-[160px] truncate' title={sale.client_name}>
                  {sale.client_name}
                </TableCell>
                <TableCell className='text-right tabular-nums'>{formatMoney(sale.total, currency)}</TableCell>
                <TableCell className='text-right tabular-nums'>{formatMoney(sale.balance, currency)}</TableCell>
                <TableCell>
                  <div className='flex flex-col gap-1'>
                    <SaleStatusBadge status={sale.status} />
                    <PaymentStatusBadge status={sale.payment_status} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </ChartCard>
  )
}
