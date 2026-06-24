import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { FurnituresBreadcrumb } from '@/features/furnitures/ui/furnitures-breadcrumb'
import { FurnitureForm } from '@/features/furnitures/ui/furniture-form'

export const metadata: Metadata = { title: 'Nuevo Mueble' }

export default function FurnitureCreatePage() {
  return (
    <>
      <Header fixed title="Nuevo Mueble" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <FurnituresBreadcrumb currentPage="Nuevo Mueble" showHeader={false} />
        <FurnitureForm mode="create" />
      </main>
    </>
  )
}
