import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { TypeDocsBreadcrumb } from '@/features/typedocs/ui/typedocs-breadcrumb'
import { TypeDocDetail } from '@/features/typedocs/ui/detail/typedoc-detail'

export const metadata: Metadata = { title: 'Detalle de Documento' }

export default async function TypeDocDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <>
      <Header fixed title="Detalle de Documento" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <TypeDocsBreadcrumb currentPage="Detalle" showHeader={false} />
        <TypeDocDetail id={id} />
      </main>
    </>
  )
}
