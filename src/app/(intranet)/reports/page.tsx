import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { ReportsView, type ReportsQuery } from '@/features/reports/ui/reports-view'

export const metadata: Metadata = { title: 'Reportes' }

type ReportsPageProps = {
  // Next.js 16: los searchParams llegan como Promise.
  // Ej.: /reports?tab=pagos&vista=saldos&preset=this_month&date_from=2026-11-01&date_to=2026-11-20&currency=PEN
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

// Toma solo el primer valor si un parámetro viene repetido en la URL.
const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value)

// Página única de reportes con pestañas (contrato API §10).
export default async function ReportsPage({ searchParams }: ReportsPageProps) {
  const params = await searchParams
  const query: ReportsQuery = {
    tab: first(params.tab),
    vista: first(params.vista),
    preset: first(params.preset),
    date_from: first(params.date_from),
    date_to: first(params.date_to),
    currency: first(params.currency),
  }

  return (
    <>
      <Header fixed title='Reportes' />
      <main className='flex min-w-0 flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>Reportes</h2>
          <p className='text-muted-foreground'>
            Indicadores, gráficos y detalle de cada registro. Exporta a Excel o PDF con los filtros elegidos.
          </p>
        </div>
        <ReportsView query={query} />
      </main>
    </>
  )
}
