import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { SaleDocumentTypesBreadcrumb } from '@/features/sale-document-types/ui/sale-document-types-breadcrumb'
import { SaleDocumentTypeDetail } from '@/features/sale-document-types/ui/detail/sale-document-type-detail'

export const metadata: Metadata = { title: 'Tipos de Comprobante de Venta' }

export default async function SaleDocumentTypeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <>
      <Header fixed title="Detalle de Tipo de Comprobante" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <SaleDocumentTypesBreadcrumb currentPage="Detalle" showHeader={false} />
        <SaleDocumentTypeDetail id={id} />
      </main>
    </>
  )
}
