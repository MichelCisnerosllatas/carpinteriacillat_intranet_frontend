import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { TypeDocsBreadcrumb } from '@/features/typedocs/ui/typedocs-breadcrumb'
import { TypeDocForm } from '@/features/typedocs/ui/form/typedoc-form'

export const metadata: Metadata = { title: 'Nuevo Documento' }

export default function TypeDocCreatePage() {
  return (
    <>
      <Header fixed title="Nuevo Documento" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <TypeDocsBreadcrumb currentPage="Nuevo Documento" />
        <TypeDocForm mode="create" />
      </main>
    </>
  )
}
