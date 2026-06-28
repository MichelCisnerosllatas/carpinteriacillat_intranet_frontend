import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { FurnitureImageDetail } from '@/features/furnitures_images/ui/detail/furniture-image-detail'
import { FurnitureImagesBreadcrumb } from '@/features/furnitures_images/ui/furniture-images-breadcrumb'

export const metadata: Metadata = { title: 'Detalle de Imagen de Mueble' }

export default async function FurnitureImageDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return (
    <>
      <Header fixed title="Detalle de Imagen" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <FurnitureImagesBreadcrumb currentPage="Detalle" showHeader={false} />
        <FurnitureImageDetail id={id} />
      </main>
    </>
  )
}
