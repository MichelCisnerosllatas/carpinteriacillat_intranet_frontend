'use client'

import { useCan } from '@/features/auth/hooks/usePermission'
import { cn } from '@/shared/lib/utils'
import { ChartCard } from '@/shared/ui/dashboard'
import { hasBlock } from '../../lib/has-block'
import { useDashboardData } from '../../lib/use-dashboard-data'
import { useProformasDashboardStore } from '../../stores/useDashboardStores'
import { DashboardNoWidgets } from '../common/dashboard-no-widgets'
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

  // Widgets que el rol puede ver: permiso 'dashboard_proformas.<widget>' (ver ROLES_Y_PERMISOS.md).
  // hasBlock: además el backend debe haber mandado el bloque.
  const show = {
    kpis: useCan('dashboard_proformas.kpis') && hasBlock(data, 'kpis'),
    funnel: useCan('dashboard_proformas.funnel') && hasBlock(data, 'funnel'),
    byStatus: useCan('dashboard_proformas.by_status') && hasBlock(data, 'by_status'),
    byType: useCan('dashboard_proformas.by_type') && hasBlock(data, 'by_type'),
    monthly: useCan('dashboard_proformas.monthly') && hasBlock(data, 'monthly'),
    topClients: useCan('dashboard_proformas.top_clients') && hasBlock(data, 'top_clients'),
  }
  const hasAnyWidget = Object.values(show).some(Boolean)

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
        <ChartCard title='Seguimiento de proformas' isError errorMessage={message} onRetry={reload} />
      ) : !hasAnyWidget ? (
        <DashboardNoWidgets />
      ) : (
        <>
          {show.kpis && <ProformasKpis kpis={data?.kpis} currency={currency} />}

          {(show.funnel || show.byStatus) && (
            <div className={cn('grid grid-cols-1 gap-4', show.funnel && show.byStatus && 'lg:grid-cols-2')}>
              {show.funnel && <ProformasFunnelChart data={data?.funnel} currency={currency} />}
              {show.byStatus && <ProformasStatusDonut data={data?.by_status} />}
            </div>
          )}

          {show.monthly && <QuotedVsSoldChart data={data?.monthly} currency={currency} />}

          {(show.byType || show.topClients) && (
            <div className={cn('grid grid-cols-1 gap-4', show.byType && show.topClients && 'lg:grid-cols-2')}>
              {show.byType && <ProformasTypeChart data={data?.by_type} />}
              {show.topClients && <ProformasTopClientsChart data={data?.top_clients} currency={currency} />}
            </div>
          )}
        </>
      )}
    </div>
  )
}
