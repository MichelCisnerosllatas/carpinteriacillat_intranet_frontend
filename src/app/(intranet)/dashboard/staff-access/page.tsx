import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { StaffAccessDashboard } from '@/features/dashboard/ui/staff-access/staff-access-dashboard'

export const metadata: Metadata = { title: 'Accesos del personal' }

export default function StaffAccessDashboardPage() {
  return (
    <>
      <Header fixed title='Accesos del personal' />
      <main className='flex min-w-0 flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>Accesos del personal</h2>
          <p className='text-muted-foreground'>Inicios de sesión del personal por día, plataforma, versión y navegador</p>
        </div>
        <StaffAccessDashboard />
      </main>
    </>
  )
}
