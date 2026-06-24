import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { SectionsBreadcrumb } from '@/features/sections/ui/sections-breadcrumb'
import { SectionForm } from '@/features/sections/ui/section-form'

export const metadata: Metadata = { title: 'Editar Sección' }

export default async function SectionEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <>
      <Header fixed title="Editar Sección" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <SectionsBreadcrumb currentPage="Editar Sección" showHeader={false} />
        <SectionForm mode="edit" id={id} />
      </main>
    </>
  )
}
