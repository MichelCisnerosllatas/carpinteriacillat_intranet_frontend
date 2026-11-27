'use client'

import { useCan } from '@/features/auth/hooks/usePermission'
import { cn } from '@/shared/lib/utils'
import { ChartCard } from '@/shared/ui/dashboard'
import { hasBlock } from '../../lib/has-block'
import { useDashboardData } from '../../lib/use-dashboard-data'
import { useSalesPerformanceDashboardStore } from '../../stores/useDashboardStores'
import { DashboardNoWidgets } from '../common/dashboard-no-widgets'
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
import { SellersGoalChart } from '../sellers/sellers-goal-chart'
import { SellersRankingChart } from '../sellers/sellers-ranking-chart'
import { SellersTable } from '../sellers/sellers-table'

// Página "Rendimiento de ventas": análisis detallado de lo vendido y lo pendiente de cobro.
export function SalesPerformanceDashboard() {
  const { data, isFetching, isError, message, reload, filters, sellerId } = useDashboardData(
    useSalesPerformanceDashboardStore
  )
  const currency = data?.period.currency ?? filters.currency
  // La sección "Vendedores" solo tiene sentido para quien ve las ventas de todos.
  const canViewAll = useCan('sales.view_all')

  // Widgets que el rol puede ver: permiso 'dashboard_sales.<widget>' (ver ROLES_Y_PERMISOS.md).
  // hasBlock: además el backend debe haber mandado el bloque.
  const show = {
    kpis: useCan('dashboard_sales.kpis') && hasBlock(data, 'kpis'),
    goal: useCan('dashboard_sales.goal') && hasBlock(data, 'goal'),
    monthly: useCan('dashboard_sales.monthly') && hasBlock(data, 'monthly'),
    byDocumentType: useCan('dashboard_sales.by_document_type') && hasBlock(data, 'by_document_type'),
    byPaymentMethod: useCan('dashboard_sales.by_payment_method') && hasBlock(data, 'by_payment_method'),
    byType: useCan('dashboard_sales.by_type') && hasBlock(data, 'by_type'),
    topClients: useCan('dashboard_sales.top_clients') && hasBlock(data, 'top_clients'),
    topProducts: useCan('dashboard_sales.top_products') && hasBlock(data, 'top_products'),
    byCategory: useCan('dashboard_sales.by_category') && hasBlock(data, 'by_category'),
    weekdayHeatmap: useCan('dashboard_sales.weekday_heatmap') && hasBlock(data, 'weekday_heatmap'),
    // Además del widget, la sección "Vendedores" pide ver las ventas de todos.
    bySeller: useCan('dashboard_sales.by_seller') && canViewAll && hasBlock(data, 'by_seller'),
    receivables: useCan('dashboard_sales.receivables') && hasBlock(data, 'receivables'),
  }
  const hasAnyWidget = Object.values(show).some(Boolean)
  // Cuántos donuts quedan en la fila de 3 (para no dejar huecos en la grilla).
  const donutCount = [show.byDocumentType, show.byPaymentMethod, show.byType].filter(Boolean).length

  // Con un solo vendedor (filtrado) el ranking no aporta nada: se oculta.
  const showRanking = !sellerId
  const bySeller = data?.by_seller

  if (isError && !data) {
    return (
      <div className='flex flex-col gap-4'>
        <DashboardToolbar isFetching={isFetching} onRefresh={reload} showSeller />
        <ChartCard title='Rendimiento de ventas' isError errorMessage={message} onRetry={reload} />
      </div>
    )
  }

  return (
    <div className='flex flex-col gap-4'>
      <DashboardToolbar
        isFetching={isFetching}
        onRefresh={reload}
        showSeller
        sellerName={data?.period.seller_name}
        errorMessage={isError ? message : null}
      />

      {!hasAnyWidget && <DashboardNoWidgets />}

      {show.kpis && <SalesPerformanceKpis kpis={data?.kpis} currency={currency} />}

      {(show.goal || show.monthly) && (
        <div className={cn('grid grid-cols-1 gap-4', show.goal && show.monthly && 'lg:grid-cols-3')}>
          {show.goal && <GoalGaugeCard goal={data?.goal} currency={currency} />}
          {show.monthly && (
            <div className={cn('min-w-0', show.goal && 'lg:col-span-2')}>
              <MonthlySalesComposedChart data={data?.monthly} currency={currency} />
            </div>
          )}
        </div>
      )}

      {donutCount > 0 && (
        <div
          className={cn(
            'grid grid-cols-1 gap-4',
            donutCount >= 2 && 'md:grid-cols-2',
            donutCount === 3 && 'xl:grid-cols-3'
          )}
        >
          {show.byDocumentType && <DocumentTypeDonut data={data?.by_document_type} currency={currency} />}
          {show.byPaymentMethod && <PaymentMethodPie data={data?.by_payment_method} currency={currency} />}
          {show.byType && <SalesByTypeDonut data={data?.by_type} currency={currency} />}
        </div>
      )}

      {(show.topClients || show.topProducts) && (
        <div className={cn('grid grid-cols-1 gap-4', show.topClients && show.topProducts && 'xl:grid-cols-2')}>
          {show.topClients && <TopClientsChart data={data?.top_clients} currency={currency} />}
          {show.topProducts && <TopProductsChart data={data?.top_products} currency={currency} />}
        </div>
      )}

      {(show.byCategory || show.weekdayHeatmap) && (
        <div className={cn('grid grid-cols-1 gap-4', show.byCategory && show.weekdayHeatmap && 'lg:grid-cols-2')}>
          {show.byCategory && <CategoryRadarChart data={data?.by_category} currency={currency} />}
          {show.weekdayHeatmap && <WeekdayHeatmap data={data?.weekday_heatmap} currency={currency} />}
        </div>
      )}

      {show.bySeller && (
        <>
          <DashboardSectionTitle title='Vendedores' description='Ventas, metas y conversión de proformas por vendedor' />
          <div className='grid grid-cols-1 gap-4 xl:grid-cols-2'>
            {showRanking && <SellersRankingChart data={bySeller} currency={currency} />}
            <SellersGoalChart data={bySeller} currency={currency} />
            <SellersTable data={bySeller} currency={currency} />
          </div>
        </>
      )}

      {show.receivables && (
        <>
          <DashboardSectionTitle
            title='Pagos pendientes'
            description='Saldos por cobrar de ventas no anuladas (histórico, no solo del periodo)'
          />
          <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
            <ReceivablesAgingChart receivables={data?.receivables} currency={currency} />
            <ReceivablesClientsTable data={data?.receivables?.clients} currency={currency} />
          </div>
        </>
      )}
    </div>
  )
}
