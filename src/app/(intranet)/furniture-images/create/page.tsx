import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { FurnitureImageForm } from '@/features/furnitures_images/ui/form/furniture-image-form'
import { FurnitureImagesBreadcrumb } from '@/features/furnitures_images/ui/furniture-images-breadcrumb'

export const metadata: Metadata = { title: 'Nueva Asociación de Imagen' }

export default function FurnitureImageCreatePage() {
  return (
    <>
      <Header fixed title="Nueva Asociación" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <FurnitureImagesBreadcrumb currentPage="Nueva asociación" showHeader={true} />
        <FurnitureImageForm mode="create" />
      </main>
    </>
  )
}
