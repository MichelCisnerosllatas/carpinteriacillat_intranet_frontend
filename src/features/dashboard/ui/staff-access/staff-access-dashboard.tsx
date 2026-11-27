'use client'

import { useCan } from '@/features/auth/hooks/usePermission'
import { cn } from '@/shared/lib/utils'
import { ChartCard } from '@/shared/ui/dashboard'
import { hasBlock } from '../../lib/has-block'
import { useDashboardData } from '../../lib/use-dashboard-data'
import { useStaffAccessDashboardStore } from '../../stores/useDashboardStores'
import { DashboardNoWidgets } from '../common/dashboard-no-widgets'
import { DashboardToolbar } from '../common/dashboard-toolbar'
import { AppVersionChart } from './app-version-chart'
import { BrowserChart } from './browser-chart'
import { GoogleRequestsDonut } from './google-requests-donut'
import { LoginsDailyLineChart } from './logins-daily-line-chart'
import { PlatformDonut } from './platform-donut'
import { StaffAccessKpis } from './staff-access-kpis'

// Página "Accesos del personal": quién entra, desde dónde y con qué versión.
export function StaffAccessDashboard() {
  const { data, isFetching, isError, message, reload } = useDashboardData(useStaffAccessDashboardStore)

  // Widgets que el rol puede ver: permiso 'dashboard_staff.<widget>' (ver ROLES_Y_PERMISOS.md).
  // hasBlock: además el backend debe haber mandado el bloque.
  const show = {
    kpis: useCan('dashboard_staff.kpis') && hasBlock(data, 'kpis'),
    daily: useCan('dashboard_staff.daily') && hasBlock(data, 'daily'),
    byPlatform: useCan('dashboard_staff.by_platform') && hasBlock(data, 'by_platform'),
    byAppVersion: useCan('dashboard_staff.by_app_version') && hasBlock(data, 'by_app_version'),
    byBrowser: useCan('dashboard_staff.by_browser') && hasBlock(data, 'by_browser'),
    googleRequests:
      useCan('dashboard_staff.google_requests_by_status') && hasBlock(data, 'google_requests_by_status'),
  }
  const hasAnyWidget = Object.values(show).some(Boolean)
  const dailyRowFull = show.daily && show.byPlatform
  // Cuántos widgets quedan en la fila de 3 (para no dejar huecos en la grilla).
  const bottomCount = [show.byAppVersion, show.byBrowser, show.googleRequests].filter(Boolean).length

  return (
    <div className='flex flex-col gap-4'>
      <DashboardToolbar
        isFetching={isFetching}
        onRefresh={reload}
        showCurrency={false}
        errorMessage={isError && data ? message : null}
      />

      {isError && !data ? (
        <ChartCard title='Accesos del personal' isError errorMessage={message} onRetry={reload} />
      ) : !hasAnyWidget ? (
        <DashboardNoWidgets />
      ) : (
        <>
          {show.kpis && <StaffAccessKpis kpis={data?.kpis} />}

          {(show.daily || show.byPlatform) && (
            <div className={cn('grid grid-cols-1 gap-4', dailyRowFull && 'lg:grid-cols-3')}>
              {show.daily && (
                <div className={cn('min-w-0', dailyRowFull && 'lg:col-span-2')}>
                  <LoginsDailyLineChart data={data?.daily} />
                </div>
              )}
              {show.byPlatform && <PlatformDonut data={data?.by_platform} />}
            </div>
          )}

          {bottomCount > 0 && (
            <div
              className={cn(
                'grid grid-cols-1 gap-4',
                bottomCount >= 2 && 'md:grid-cols-2',
                bottomCount === 3 && 'xl:grid-cols-3'
              )}
            >
              {show.byAppVersion && <AppVersionChart data={data?.by_app_version} />}
              {show.byBrowser && <BrowserChart data={data?.by_browser} />}
              {show.googleRequests && <GoogleRequestsDonut data={data?.google_requests_by_status} />}
            </div>
          )}
        </>
      )}
    </div>
  )
}
