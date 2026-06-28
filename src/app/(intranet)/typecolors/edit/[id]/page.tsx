import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { TypeColorsBreadcrumb } from '@/features/typecolors/ui/typecolors-breadcrumb'
import { TypeColorForm } from '@/features/typecolors/ui/form/typecolor-form'

export const metadata: Metadata = { title: 'Editar Color' }

export default async function TypeColorEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <>
      <Header fixed title="Editar Color" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <TypeColorsBreadcrumb currentPage="Editar Color" />
        <TypeColorForm mode="edit" id={id} />
      </main>
    </>
  )
}
