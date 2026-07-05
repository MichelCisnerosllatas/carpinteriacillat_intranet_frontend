import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { ProformaTypesBreadcrumb } from '@/features/proforma-types/ui/proforma-types-breadcrumb'
import { ProformaTypeDetail } from '@/features/proforma-types/ui/detail/proforma-type-detail'

export const metadata: Metadata = { title: 'Tipos de Proforma' }

export default async function ProformaTypeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <>
      <Header fixed title="Detalle de Tipo de Proforma" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <ProformaTypesBreadcrumb currentPage="Detalle" showHeader={false} />
        <ProformaTypeDetail id={id} />
      </main>
    </>
  )
}
