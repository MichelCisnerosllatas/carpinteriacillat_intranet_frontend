import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { TypeColorsBreadcrumb } from '@/features/typecolors/ui/typecolors-breadcrumb'
import { TypeColorForm } from '@/features/typecolors/ui/form/typecolor-form'

export const metadata: Metadata = { title: 'Nuevo Color' }

export default function TypeColorCreatePage() {
  return (
    <>
      <Header fixed title="Nuevo Color" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <TypeColorsBreadcrumb currentPage="Nuevo Color" />
        <TypeColorForm mode="create" />
      </main>
    </>
  )
}
