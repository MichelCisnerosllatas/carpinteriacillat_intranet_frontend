import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { NavigationsBreadcrumb } from '@/features/navigations/ui/navigations-breadcrumb'
import { NavigationDetail } from '@/features/navigations/ui/navigation-detail'

export const metadata: Metadata = { title: 'Detalle de Navegación' }

export default async function NavigationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <>
      <Header fixed title="Detalle de Navegación" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <NavigationsBreadcrumb currentPage="Detalle" showHeader={false} />
        <NavigationDetail id={id} />
      </main>
    </>
  )
}
