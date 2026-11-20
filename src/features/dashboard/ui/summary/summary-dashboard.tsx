'use client'

import { ChartCard } from '@/shared/ui/dashboard'
import { useDashboardData } from '../../lib/use-dashboard-data'
import { useSummaryDashboardStore } from '../../stores/useDashboardStores'
import { DashboardToolbar } from '../common/dashboard-toolbar'
import { LatestSalesTable } from './latest-sales-table'
import { PaymentStatusDonut } from './payment-status-donut'
import { SalesCollectionsAreaChart } from './sales-collections-area-chart'
import { SummaryKpis } from './summary-kpis'
import { TopDebtorsTable } from './top-debtors-table'

// Página "Resumen general": vista rápida del negocio al entrar a la intranet.
export function SummaryDashboard() {
  const { data, isFetching, isError, message, reload, filters } = useDashboardData(useSummaryDashboardStore)
  const currency = data?.period.currency ?? filters.currency

  return (
    <div className='flex flex-col gap-4'>
      <DashboardToolbar isFetching={isFetching} onRefresh={reload} errorMessage={isError && data ? message : null} />

      {isError && !data ? (
        <ChartCard title='Resumen general' isError errorMessage={message} onRetry={reload} />
      ) : (
        <>
          <SummaryKpis kpis={data?.kpis} currency={currency} />
          <div className='grid grid-cols-1 gap-4 lg:grid-cols-3'>
            <div className='min-w-0 lg:col-span-2'>
              <SalesCollectionsAreaChart data={data?.monthly} currency={currency} />
            </div>
            <PaymentStatusDonut data={data?.payment_status} currency={currency} />
          </div>
          <div className='grid grid-cols-1 gap-4 xl:grid-cols-2'>
            <LatestSalesTable data={data?.latest_sales} currency={currency} />
            <TopDebtorsTable data={data?.top_debtors} currency={currency} />
          </div>
        </>
      )}
    </div>
  )
}
