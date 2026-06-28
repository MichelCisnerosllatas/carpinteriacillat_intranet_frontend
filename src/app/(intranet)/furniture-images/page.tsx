import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { FurnitureImagesGrid } from '@/features/furnitures_images/ui/list/furniture-images-grid'
import { FurnitureImagesBreadcrumb } from '@/features/furnitures_images/ui/furniture-images-breadcrumb'
import { FurnitureImagesPrimaryButtons } from '@/features/furnitures_images/ui/list/furniture-images-primary-buttons'

export const metadata: Metadata = { title: 'Imágenes de Muebles' }

export default function FurnitureImagesPage() {
  return (
    <>
      <Header fixed title="Imágenes de Muebles" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <div className="flex items-center justify-between">
          <FurnitureImagesBreadcrumb />
          <FurnitureImagesPrimaryButtons />
        </div>
        <FurnitureImagesGrid />
      </main>
    </>
  )
}
