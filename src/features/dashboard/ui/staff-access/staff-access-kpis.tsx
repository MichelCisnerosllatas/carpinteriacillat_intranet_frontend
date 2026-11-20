'use client'

import { LogIn, MonitorSmartphone, Users } from 'lucide-react'
import { formatNumber, KpiCard } from '@/shared/ui/dashboard'
import type { StaffAccessKpisDto } from '../../model/dashboard-staff-access.dto'

export function StaffAccessKpis({ kpis }: { kpis: StaffAccessKpisDto | undefined }) {
  const isLoading = !kpis

  return (
    <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
      <KpiCard
        title='Inicios de sesión'
        icon={LogIn}
        isLoading={isLoading}
        value={formatNumber(kpis?.logins_total)}
        description='Logins registrados en el periodo'
      />
      <KpiCard
        title='Usuarios que ingresaron'
        icon={Users}
        isLoading={isLoading}
        value={formatNumber(kpis?.users_with_login)}
        description='Personal distinto con al menos un login'
      />
      <KpiCard
        title='Dispositivos activos'
        icon={MonitorSmartphone}
        isLoading={isLoading}
        value={formatNumber(kpis?.active_devices)}
        description='Sesiones abiertas actualmente'
      />
    </div>
  )
}
