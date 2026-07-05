import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { ProductsServicesBreadcrumb } from '@/features/products-services/ui/products-services-breadcrumb'
import { ProductServiceDetail } from '@/features/products-services/ui/detail/product-service-detail'

export const metadata: Metadata = { title: 'Productos y Servicios' }

export default async function ProductServiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <>
      <Header fixed title="Detalle de Producto/Servicio" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <ProductsServicesBreadcrumb currentPage="Detalle" showHeader={false} />
        <ProductServiceDetail id={id} />
      </main>
    </>
  )
}
