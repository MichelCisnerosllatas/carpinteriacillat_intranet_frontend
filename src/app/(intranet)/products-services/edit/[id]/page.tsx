import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { ProductsServicesBreadcrumb } from '@/features/products-services/ui/products-services-breadcrumb'
import { ProductServiceForm } from '@/features/products-services/ui/form/product-service-form'

export const metadata: Metadata = { title: 'Productos y Servicios' }

export default async function ProductServiceEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <>
      <Header fixed title="Editar Producto/Servicio" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <ProductsServicesBreadcrumb currentPage="Editar Producto/Servicio" />
        <ProductServiceForm mode="edit" id={id} />
      </main>
    </>
  )
}
