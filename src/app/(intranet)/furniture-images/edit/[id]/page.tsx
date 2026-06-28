import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { FurnitureImageForm } from '@/features/furnitures_images/ui/form/furniture-image-form'
import { FurnitureImagesBreadcrumb } from '@/features/furnitures_images/ui/furniture-images-breadcrumb'

export const metadata: Metadata = { title: 'Editar Asociación de Imagen' }

export default async function FurnitureImageEditPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return (
    <>
      <Header fixed title="Editar Asociación" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <FurnitureImagesBreadcrumb currentPage="Editar" showHeader={false} />
        <FurnitureImageForm mode="edit" id={id} />
      </main>
    </>
  )
}
