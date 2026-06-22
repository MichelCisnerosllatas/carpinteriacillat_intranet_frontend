import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { NavigationsBreadcrumb } from '@/features/navigations/ui/navigations-breadcrumb'
import { NavigationForm } from '@/features/navigations/ui/navigation-form'

export const metadata: Metadata = { title: 'Editar Navegación' }

export default async function NavigationEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <>
      <Header fixed title="Editar Navegación" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <NavigationsBreadcrumb currentPage="Editar Navegación" />
        <NavigationForm mode="edit" id={id} />
      </main>
    </>
  )
}
