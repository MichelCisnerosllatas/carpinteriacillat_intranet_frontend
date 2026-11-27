import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { WebWorksBreadcrumb } from '@/features/web-works/ui/web-works-breadcrumb'
import { WebWorkDetail } from '@/features/web-works/ui/detail/web-work-detail'

export const metadata: Metadata = { title: 'Detalle de Trabajo' }

export default async function WebWorkDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <>
      <Header fixed title="Detalle de Trabajo" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <WebWorksBreadcrumb currentPage="Detalle" />
        <WebWorkDetail id={id} />
      </main>
    </>
  )
}
