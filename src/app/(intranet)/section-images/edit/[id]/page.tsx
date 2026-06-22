import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { SectionImagesBreadcrumb } from '@/features/sectionimages/ui/sectionimages-breadcrumb'
import { SectionImageForm } from '@/features/sectionimages/ui/sectionimage-form'

export const metadata: Metadata = { title: 'Editar Asignación' }

export default async function SectionImageEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <>
      <Header fixed title="Editar Asignación" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <SectionImagesBreadcrumb currentPage="Editar Asignación" />
        <SectionImageForm mode="edit" id={id} />
      </main>
    </>
  )
}
