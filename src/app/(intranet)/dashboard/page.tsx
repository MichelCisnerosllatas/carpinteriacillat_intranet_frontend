import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { SummaryDashboard } from '@/features/dashboard/ui/summary/summary-dashboard'

export const metadata: Metadata = { title: 'Resumen general' }

export default function SummaryDashboardPage() {
  return (
    <>
      <Header fixed title='Resumen general' />
      <main className='flex min-w-0 flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>Resumen general</h2>
          <p className='text-muted-foreground'>Vista rápida de ventas, cobros, proformas y mensajes del periodo</p>
        </div>
        <SummaryDashboard />
      </main>
    </>
  )
}
