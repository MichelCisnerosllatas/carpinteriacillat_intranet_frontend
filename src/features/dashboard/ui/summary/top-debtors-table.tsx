'use client'

import { ChartCard, formatMoney, formatNumber, type Currency } from '@/shared/ui/dashboard'
import { useReportHref } from '../../lib/use-report-href'
import { Badge } from '@/shared/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import type { SummaryTopDebtorDto } from '../../model/dashboard-summary.dto'

type Props = {
  data: SummaryTopDebtorDto[] | undefined
  currency: Currency
}

// Saldo HISTÓRICO (no solo del periodo): a quién hay que cobrarle primero.
export function TopDebtorsTable({ data, currency }: Props) {
  // Botón ↗ "Ver en reportes" con el mismo periodo y moneda del dashboard.
  const reportHref = useReportHref('pagos', 'saldos')
  // Solo el top 5: el listado completo está en Reportes (botón ↗).
  const rows = (data ?? []).slice(0, 5)

  return (
    <ChartCard
      href={reportHref}
      title='Mayores deudores'
      description='Los 5 clientes con más saldo pendiente (histórico)'
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
              <TableHead className='text-right'>Saldo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((debtor, index) => (
              <TableRow key={`${debtor.client_id ?? 'varios'}-${index}`}>
                <TableCell className='max-w-[200px] truncate font-medium' title={debtor.client_name}>
                  {debtor.client_name}
                </TableCell>
                <TableCell className='text-center'>
                  <Badge variant='secondary'>{formatNumber(debtor.sales_count)}</Badge>
                </TableCell>
                <TableCell className='text-right font-semibold text-red-600 tabular-nums dark:text-red-400'>
                  {formatMoney(debtor.balance, currency)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </ChartCard>
  )
}
