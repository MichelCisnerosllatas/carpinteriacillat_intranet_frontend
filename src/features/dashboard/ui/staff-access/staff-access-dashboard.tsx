'use client'

import { ChartCard } from '@/shared/ui/dashboard'
import { useDashboardData } from '../../lib/use-dashboard-data'
import { useStaffAccessDashboardStore } from '../../stores/useDashboardStores'
import { DashboardToolbar } from '../common/dashboard-toolbar'
import { LoginsDailyLineChart } from './logins-daily-line-chart'
import { AppVersionChart, BrowserChart, GoogleRequestsDonut, PlatformDonut } from './staff-access-charts'
import { StaffAccessKpis } from './staff-access-kpis'

// Página "Accesos del personal": quién entra, desde dónde y con qué versión.
export function StaffAccessDashboard() {
  const { data, isFetching, isError, message, reload } = useDashboardData(useStaffAccessDashboardStore)

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
      ) : (
        <>
          <StaffAccessKpis kpis={data?.kpis} />
          <div className='grid grid-cols-1 gap-4 lg:grid-cols-3'>
            <div className='min-w-0 lg:col-span-2'>
              <LoginsDailyLineChart data={data?.daily} />
            </div>
            <PlatformDonut data={data?.by_platform} />
          </div>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3'>
            <AppVersionChart data={data?.by_app_version} />
            <BrowserChart data={data?.by_browser} />
            <GoogleRequestsDonut data={data?.google_requests_by_status} />
          </div>
        </>
      )}
    </div>
  )
}
