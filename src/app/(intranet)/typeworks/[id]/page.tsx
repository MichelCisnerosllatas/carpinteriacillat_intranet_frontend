import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { TypeWorksBreadcrumb } from '@/features/typeworks/ui/typeworks-breadcrumb'
import { TypeWorkDetail } from '@/features/typeworks/ui/detail/typework-detail'

export const metadata: Metadata = { title: 'Detalle de Tipo de Trabajo' }

export default async function TypeWorkDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <>
      <Header fixed title="Detalle de Tipo de Trabajo" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <TypeWorksBreadcrumb currentPage="Detalle" showHeader={true} />
        <TypeWorkDetail id={id} />
      </main>
    </>
  )
}
