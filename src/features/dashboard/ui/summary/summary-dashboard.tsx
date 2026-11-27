'use client'

import { useCan } from '@/features/auth/hooks/usePermission'
import { cn } from '@/shared/lib/utils'
import { ChartCard } from '@/shared/ui/dashboard'
import { hasBlock } from '../../lib/has-block'
import { useDashboardData } from '../../lib/use-dashboard-data'
import { useSummaryDashboardStore } from '../../stores/useDashboardStores'
import { DashboardNoWidgets } from '../common/dashboard-no-widgets'
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

  // Widgets que el rol puede ver: permiso 'dashboard_summary.<widget>' (ver ROLES_Y_PERMISOS.md).
  // hasBlock: además el backend debe haber mandado el bloque.
  const show = {
    kpis: useCan('dashboard_summary.kpis') && hasBlock(data, 'kpis'),
    // La meta viene en su propio bloque 'goal' (no depende de que el rol tenga 'kpis').
    goal: useCan('dashboard_summary.goal') && hasBlock(data, 'goal'),
    monthly: useCan('dashboard_summary.monthly') && hasBlock(data, 'monthly'),
    paymentStatus: useCan('dashboard_summary.payment_status') && hasBlock(data, 'payment_status'),
    latestSales: useCan('dashboard_summary.latest_sales') && hasBlock(data, 'latest_sales'),
    topDebtors: useCan('dashboard_summary.top_debtors') && hasBlock(data, 'top_debtors'),
  }
  const hasAnyWidget = Object.values(show).some(Boolean)
  // Si en una fila solo queda un widget, ocupa todo el ancho (sin huecos).
  const monthlyRowFull = show.monthly && show.paymentStatus
  const tablesRowFull = show.latestSales && show.topDebtors

  return (
    <div className='flex flex-col gap-4'>
      <DashboardToolbar
        isFetching={isFetching}
        onRefresh={reload}
        showSeller
        sellerName={data?.period.seller_name}
        errorMessage={isError && data ? message : null}
      />

      {isError && !data ? (
        <ChartCard title='Resumen general' isError errorMessage={message} onRetry={reload} />
      ) : !hasAnyWidget ? (
        <DashboardNoWidgets />
      ) : (
        <>
          <SummaryKpis kpis={data?.kpis} goal={data?.goal} currency={currency} showKpis={show.kpis} showGoal={show.goal} />

          {(show.monthly || show.paymentStatus) && (
            <div className={cn('grid grid-cols-1 gap-4', monthlyRowFull && 'lg:grid-cols-3')}>
              {show.monthly && (
                <div className={cn('min-w-0', monthlyRowFull && 'lg:col-span-2')}>
                  <SalesCollectionsAreaChart data={data?.monthly} currency={currency} />
                </div>
              )}
              {show.paymentStatus && <PaymentStatusDonut data={data?.payment_status} currency={currency} />}
            </div>
          )}

          {(show.latestSales || show.topDebtors) && (
            <div className={cn('grid grid-cols-1 gap-4', tablesRowFull && 'xl:grid-cols-2')}>
              {show.latestSales && <LatestSalesTable data={data?.latest_sales} currency={currency} />}
              {show.topDebtors && <TopDebtorsTable data={data?.top_debtors} currency={currency} />}
            </div>
          )}
        </>
      )}
    </div>
  )
}
