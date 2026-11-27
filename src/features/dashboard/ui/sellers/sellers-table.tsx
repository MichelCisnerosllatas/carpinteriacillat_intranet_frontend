'use client'

import { ChartCard, formatMoney, formatNumber, formatPercent, type Currency } from '@/shared/ui/dashboard'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import { useReportHref } from '../../lib/use-report-href'
import type { SalesBySellerDto } from '../../model/dashboard-sales-performance.dto'

type Props = {
  data: SalesBySellerDto[] | undefined
  currency: Currency
}

// Tabla compacta (top 5): el detalle completo de cada vendedor está en Reportes › Vendedores.
export function SellersTable({ data, currency }: Props) {
  // Botón ↗ "Ver en reportes" con el mismo periodo y moneda del dashboard.
  const reportHref = useReportHref('vendedores')
  const rows = (data ?? []).slice(0, 5)

  return (
    <ChartCard
      href={reportHref}
      title='Vendedores'
      description='Top 5 por monto vendido'
      isLoading={!data}
      isEmpty={rows.length === 0}
    >
      <div className='overflow-x-auto'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vendedor</TableHead>
              <TableHead className='text-right'>Ventas</TableHead>
              <TableHead className='text-right'>Ticket prom.</TableHead>
              <TableHead className='text-right'>Conv. proformas</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((seller, index) => (
              <TableRow key={`${seller.user_id ?? 'sin'}-${index}`}>
                <TableCell className='max-w-[180px] truncate font-medium' title={seller.seller_name}>
                  {seller.seller_name}
                  <p className='text-muted-foreground text-xs font-normal tabular-nums'>
                    {formatMoney(seller.total, currency)}
                  </p>
                </TableCell>
                <TableCell className='text-right tabular-nums'>{formatNumber(seller.count)}</TableCell>
                <TableCell className='text-right tabular-nums'>{formatMoney(seller.average_ticket, currency)}</TableCell>
                <TableCell className='text-right tabular-nums'>
                  {formatPercent(seller.conversion_rate_pct)}
                  <p className='text-muted-foreground text-xs'>
                    {formatNumber(seller.proformas_converted)} de {formatNumber(seller.proformas_count)}
                  </p>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </ChartCard>
  )
}
