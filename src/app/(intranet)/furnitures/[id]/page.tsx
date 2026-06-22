import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { FurnituresBreadcrumb } from '@/features/furnitures/ui/furnitures-breadcrumb'
import { FurnitureDetail } from '@/features/furnitures/ui/furniture-detail'

export const metadata: Metadata = { title: 'Detalle de Mueble' }

export default async function FurnitureDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <>
      <Header fixed title="Detalle de Mueble" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <FurnituresBreadcrumb currentPage="Detalle" showHeader={false} />
        <FurnitureDetail id={id} />
      </main>
    </>
  )
}
