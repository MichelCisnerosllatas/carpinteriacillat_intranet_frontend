import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { TestimonyWebBreadcrumb } from '@/features/testimony-web/ui/testimony-web-breadcrumb'
import { TestimonyForm } from '@/features/testimony-web/ui/form/testimony-form'

export const metadata: Metadata = { title: 'Editar Testimonio' }

export default async function TestimonyWebEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <>
      <Header fixed title="Editar Testimonio" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <TestimonyWebBreadcrumb currentPage="Editar Testimonio" showHeader={true} />
        <TestimonyForm mode="edit" id={id} />
      </main>
    </>
  )
}
