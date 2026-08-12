import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { SalesBreadcrumb } from '@/features/sales/ui/sales-breadcrumb'
import { SaleDetail } from '@/features/sales/ui/detail/sale-detail'

export const metadata: Metadata = { title: 'Ventas' }

export default async function SaleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <>
      <Header fixed title="Detalle de Venta" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <SalesBreadcrumb currentPage="Detalle" showHeader={false} />
        <SaleDetail id={id} />
      </main>
    </>
  )
}
