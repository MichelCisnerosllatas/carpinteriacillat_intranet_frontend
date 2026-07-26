import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { NavigationsBreadcrumb } from '@/features/navigations/ui/navigations-breadcrumb'
import { NavigationsReorderList } from '@/features/navigations/ui/reorder/navigations-reorder-list'

export const metadata: Metadata = { title: 'Reordenar Navegación' }

export default function NavigationReorderPage() {
  return (
    <>
      <Header fixed title="Reordenar Navegación" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <NavigationsBreadcrumb currentPage="Reordenar" />
        <NavigationsReorderList />
      </main>
    </>
  )
}
