import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { SaleDocumentTypesBreadcrumb } from '@/features/sale-document-types/ui/sale-document-types-breadcrumb'
import { SaleDocumentTypeForm } from '@/features/sale-document-types/ui/form/sale-document-type-form'

export const metadata: Metadata = { title: 'Tipos de Comprobante de Venta' }

export default function SaleDocumentTypeCreatePage() {
  return (
    <>
      <Header fixed title="Nuevo Tipo de Comprobante" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <SaleDocumentTypesBreadcrumb currentPage="Nuevo Tipo de Comprobante" />
        <SaleDocumentTypeForm mode="create" />
      </main>
    </>
  )
}
