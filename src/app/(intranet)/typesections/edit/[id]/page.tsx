import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { TypeSectionsBreadcrumb } from '@/features/typesections/ui/typesections-breadcrumb'
import { TypeSectionForm } from '@/features/typesections/ui/form/typesection-form'

export const metadata: Metadata = { title: 'Editar Sección' }

export default async function TypeSectionEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <>
      <Header fixed title="Editar Sección" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <TypeSectionsBreadcrumb currentPage="Editar Sección" />
        <TypeSectionForm mode="edit" id={id} />
      </main>
    </>
  )
}
