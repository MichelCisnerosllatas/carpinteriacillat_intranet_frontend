import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { SalesPerformanceDashboard } from '@/features/dashboard/ui/sales-performance/sales-performance-dashboard'

export const metadata: Metadata = { title: 'Rendimiento de ventas' }

export default function SalesPerformanceDashboardPage() {
  return (
    <>
      <Header fixed title='Rendimiento de ventas' />
      <main className='flex min-w-0 flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>Rendimiento de ventas</h2>
          <p className='text-muted-foreground'>Análisis de lo vendido, metas, clientes, productos y pagos pendientes</p>
        </div>
        <SalesPerformanceDashboard />
      </main>
    </>
  )
}
