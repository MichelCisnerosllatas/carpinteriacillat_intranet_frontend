import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { SalesBreadcrumb } from '@/features/sales/ui/sales-breadcrumb'
import { SaleForm } from '@/features/sales/ui/form/sale-form'

export const metadata: Metadata = { title: 'Ventas' }

export default function SaleCreatePage() {
  return (
    <>
      <Header fixed title="Nueva Venta" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <SalesBreadcrumb currentPage="Nueva Venta" />
        <SaleForm mode="create" />
      </main>
    </>
  )
}
