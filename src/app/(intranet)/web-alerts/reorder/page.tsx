// Página para cambiar el orden de las alertas del sitio.

import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { WebAlertsBreadcrumb } from '@/features/web-alerts/ui/web-alerts-breadcrumb'
import { WebAlertsReorderList } from '@/features/web-alerts/ui/reorder/web-alerts-reorder-list'

export const metadata: Metadata = { title: 'Ordenar alertas' }

export default function WebAlertsReorderPage() {
  return (
    <>
      <Header fixed title="Ordenar alertas" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <WebAlertsBreadcrumb currentPage="Ordenar" />
        <WebAlertsReorderList />
      </main>
    </>
  )
}
