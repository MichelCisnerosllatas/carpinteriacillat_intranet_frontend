import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { ProformasDashboard } from '@/features/dashboard/ui/proformas/proformas-dashboard'

export const metadata: Metadata = { title: 'Seguimiento de proformas' }

export default function ProformasDashboardPage() {
  return (
    <>
      <Header fixed title='Seguimiento de proformas' />
      <main className='flex min-w-0 flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>Seguimiento de proformas</h2>
          <p className='text-muted-foreground'>Cuánto se cotiza, cuánto se acepta y cuánto termina en venta</p>
        </div>
        <ProformasDashboard />
      </main>
    </>
  )
}
