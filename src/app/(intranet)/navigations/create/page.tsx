import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { NavigationsBreadcrumb } from '@/features/navigations/ui/navigations-breadcrumb'
import { NavigationForm } from '@/features/navigations/ui/navigation-form'

export const metadata: Metadata = { title: 'Nueva Navegación' }

export default function NavigationCreatePage() {
  return (
    <>
      <Header fixed title="Nueva Navegación" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <NavigationsBreadcrumb currentPage="Nueva Navegación" />
        <NavigationForm mode="create" />
      </main>
    </>
  )
}
