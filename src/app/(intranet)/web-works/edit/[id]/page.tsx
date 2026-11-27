import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { WebWorksBreadcrumb } from '@/features/web-works/ui/web-works-breadcrumb'
import { WebWorkForm } from '@/features/web-works/ui/form/web-work-form'

export const metadata: Metadata = { title: 'Editar Trabajo' }

export default async function WebWorkEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <>
      <Header fixed title="Editar Trabajo" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <WebWorksBreadcrumb currentPage="Editar Trabajo" />
        <WebWorkForm mode="edit" id={id} />
      </main>
    </>
  )
}
