'use client'

import { ChartCard } from '@/shared/ui/dashboard'
import { useDashboardData } from '../../lib/use-dashboard-data'
import { useProformasDashboardStore } from '../../stores/useDashboardStores'
import { DashboardToolbar } from '../common/dashboard-toolbar'
import { ProformasFunnelChart } from './proformas-funnel-chart'
import { ProformasKpis } from './proformas-kpis'
import { ProformasStatusDonut } from './proformas-status-donut'
import { ProformasTopClientsChart } from './proformas-top-clients-chart'
import { ProformasTypeChart } from './proformas-type-chart'
import { QuotedVsSoldChart } from './quoted-vs-sold-chart'

// Página "Seguimiento de proformas": cuánto se cotiza y cuánto termina en venta.
export function ProformasDashboard() {
  const { data, isFetching, isError, message, reload, filters } = useDashboardData(useProformasDashboardStore)
  const currency = data?.period.currency ?? filters.currency

  return (
    <div className='flex flex-col gap-4'>
      <DashboardToolbar isFetching={isFetching} onRefresh={reload} errorMessage={isError && data ? message : null} />

      {isError && !data ? (
        <ChartCard title='Seguimiento de proformas' isError errorMessage={message} onRetry={reload} />
      ) : (
        <>
          <ProformasKpis kpis={data?.kpis} currency={currency} />
          <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
            <ProformasFunnelChart data={data?.funnel} currency={currency} />
            <ProformasStatusDonut data={data?.by_status} />
          </div>
          <QuotedVsSoldChart data={data?.monthly} currency={currency} />
          <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
            <ProformasTypeChart data={data?.by_type} />
            <ProformasTopClientsChart data={data?.top_clients} currency={currency} />
          </div>
        </>
      )}
    </div>
  )
}
