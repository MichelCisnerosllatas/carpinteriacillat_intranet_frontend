import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { TypeFontsBreadcrumb } from '@/features/typefonts/ui/typefonts-breadcrumb'
import { TypeFontForm } from '@/features/typefonts/ui/form/typefont-form'

export const metadata: Metadata = { title: 'Editar Tipografía' }

export default async function TypeFontEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <>
      <Header fixed title="Editar Tipografía" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <TypeFontsBreadcrumb currentPage="Editar Tipografía" />
        <TypeFontForm mode="edit" id={id} />
      </main>
    </>
  )
}
