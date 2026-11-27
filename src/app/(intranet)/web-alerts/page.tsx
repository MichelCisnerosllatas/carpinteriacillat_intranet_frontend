// Página de la lista de "Alertas del sitio" (las barras de aviso que salen arriba de la web).

import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { WebAlertsTable } from '@/features/web-alerts/ui/list/web-alerts-table'
import { WebAlertsPrimaryButtons } from '@/features/web-alerts/ui/web-alerts-primary-buttons'

export const metadata: Metadata = { title: 'Alertas del sitio' }

export default function WebAlertsPage() {
  return (
    <>
      <Header fixed title="Alertas del sitio" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Alertas del sitio</h2>
            <p className="text-muted-foreground">Barras de aviso que aparecen arriba de todas las páginas de la web</p>
          </div>
          <WebAlertsPrimaryButtons />
        </div>
        <WebAlertsTable />
      </main>
    </>
  )
}
