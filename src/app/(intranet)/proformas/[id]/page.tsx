import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { ProformasBreadcrumb } from '@/features/proformas/ui/proformas-breadcrumb'
import { ProformaDetail } from '@/features/proformas/ui/detail/proforma-detail'

export const metadata: Metadata = { title: 'Proformas' }

export default async function ProformaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <>
      <Header fixed title="Proformas" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <ProformasBreadcrumb currentPage="Detalle" showHeader={false} />
        <ProformaDetail id={id} />
      </main>
    </>
  )
}
