'use client'

import { ChartCard } from '@/shared/ui/dashboard'
import { useDashboardData } from '../../lib/use-dashboard-data'
import { useSalesPerformanceDashboardStore } from '../../stores/useDashboardStores'
import { DashboardSectionTitle } from '../common/dashboard-section-title'
import { DashboardToolbar } from '../common/dashboard-toolbar'
import { CategoryRadarChart } from './category-radar-chart'
import { DocumentTypeDonut } from './document-type-donut'
import { GoalGaugeCard } from './goal-gauge-card'
import { MonthlySalesComposedChart } from './monthly-sales-composed-chart'
import { PaymentMethodPie } from './payment-method-pie'
import { ReceivablesAgingChart } from './receivables-aging-chart'
import { ReceivablesClientsTable } from './receivables-clients-table'
import { SalesByTypeDonut } from './sales-by-type-donut'
import { SalesPerformanceKpis } from './sales-performance-kpis'
import { TopClientsChart } from './top-clients-chart'
import { TopProductsChart } from './top-products-chart'
import { WeekdayHeatmap } from './weekday-heatmap'

// Página "Rendimiento de ventas": análisis detallado de lo vendido y lo pendiente de cobro.
export function SalesPerformanceDashboard() {
  const { data, isFetching, isError, message, reload, filters } = useDashboardData(useSalesPerformanceDashboardStore)
  const currency = data?.period.currency ?? filters.currency

  if (isError && !data) {
    return (
      <div className='flex flex-col gap-4'>
        <DashboardToolbar isFetching={isFetching} onRefresh={reload} />
        <ChartCard title='Rendimiento de ventas' isError errorMessage={message} onRetry={reload} />
      </div>
    )
  }

  return (
    <div className='flex flex-col gap-4'>
      <DashboardToolbar isFetching={isFetching} onRefresh={reload} errorMessage={isError ? message : null} />

      <SalesPerformanceKpis kpis={data?.kpis} currency={currency} />

      <div className='grid grid-cols-1 gap-4 lg:grid-cols-3'>
        <GoalGaugeCard goal={data?.goal} currency={currency} />
        <div className='min-w-0 lg:col-span-2'>
          <MonthlySalesComposedChart data={data?.monthly} currency={currency} />
        </div>
      </div>

      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3'>
        <DocumentTypeDonut data={data?.by_document_type} currency={currency} />
        <PaymentMethodPie data={data?.by_payment_method} currency={currency} />
        <SalesByTypeDonut data={data?.by_type} currency={currency} />
      </div>

      <div className='grid grid-cols-1 gap-4 xl:grid-cols-2'>
        <TopClientsChart data={data?.top_clients} currency={currency} />
        <TopProductsChart data={data?.top_products} currency={currency} />
      </div>

      <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
        <CategoryRadarChart data={data?.by_category} currency={currency} />
        <WeekdayHeatmap data={data?.weekday_heatmap} currency={currency} />
      </div>

      <DashboardSectionTitle
        title='Pagos pendientes'
        description='Saldos por cobrar de ventas no anuladas (histórico, no solo del periodo)'
      />
      <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
        <ReceivablesAgingChart receivables={data?.receivables} currency={currency} />
        <ReceivablesClientsTable data={data?.receivables.clients} currency={currency} />
      </div>
    </div>
  )
}
