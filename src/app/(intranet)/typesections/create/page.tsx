import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { TypeSectionsBreadcrumb } from '@/features/typesections/ui/typesections-breadcrumb'
import { TypeSectionForm } from '@/features/typesections/ui/form/typesection-form'

export const metadata: Metadata = { title: 'Nueva Sección' }

export default function TypeSectionCreatePage() {
  return (
    <>
      <Header fixed title="Nueva Sección" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <TypeSectionsBreadcrumb currentPage="Nueva Sección" />
        <TypeSectionForm mode="create" />
      </main>
    </>
  )
}
