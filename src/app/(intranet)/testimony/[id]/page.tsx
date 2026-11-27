import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { TestimonyWebBreadcrumb } from '@/features/testimony-web/ui/testimony-web-breadcrumb'
import { TestimonyDetail } from '@/features/testimony-web/ui/detail/testimony-detail'

export const metadata: Metadata = { title: 'Detalle de Testimonio' }

export default async function TestimonyWebDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <>
      <Header fixed title="Detalle de Testimonio" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <TestimonyWebBreadcrumb currentPage="Detalle" showHeader={true} />
        <TestimonyDetail id={id} />
      </main>
    </>
  )
}
