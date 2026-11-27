import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { SaleGoalsView } from '@/features/sale-goals'

export const metadata: Metadata = { title: 'Metas de venta' }

// Permiso: `sale_goals.view` para entrar (lo calcula RoutePermissionGuard desde el sidebar) y
// `sale_goals.update` para guardar (se revisa dentro de la vista).
export default function SaleGoalsPage() {
  return (
    <>
      <Header fixed title="Metas de venta" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <SaleGoalsView />
      </main>
    </>
  )
}
