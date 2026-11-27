import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { TypeWorksBreadcrumb } from '@/features/typeworks/ui/typeworks-breadcrumb'
import { TypeWorkForm } from '@/features/typeworks/ui/form/typework-form'

export const metadata: Metadata = { title: 'Editar Tipo de Trabajo' }

export default async function TypeWorkEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <>
      <Header fixed title="Editar Tipo de Trabajo" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <TypeWorksBreadcrumb currentPage="Editar Tipo de Trabajo" />
        <TypeWorkForm mode="edit" id={id} />
      </main>
    </>
  )
}
