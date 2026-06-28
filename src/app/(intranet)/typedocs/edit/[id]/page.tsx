import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { TypeDocsBreadcrumb } from '@/features/typedocs/ui/typedocs-breadcrumb'
import { TypeDocForm } from '@/features/typedocs/ui/form/typedoc-form'

export const metadata: Metadata = { title: 'Editar Documento' }

export default async function TypeDocEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <>
      <Header fixed title="Editar Documento" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <TypeDocsBreadcrumb currentPage="Editar Documento" />
        <TypeDocForm mode="edit" id={id} />
      </main>
    </>
  )
}
