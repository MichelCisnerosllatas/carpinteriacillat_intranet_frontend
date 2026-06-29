import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { FurnituresBreadcrumb } from '@/features/furnitures/ui/furnitures-breadcrumb'
import { FurnitureForm } from '@/features/furnitures/ui/form/furniture-form'

export const metadata: Metadata = { title: 'Editar Mueble' }

export default async function FurnitureEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <>
      <Header fixed title="Editar Mueble" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <FurnituresBreadcrumb currentPage="Editar Mueble"  showHeader={false}/>
        <FurnitureForm mode="edit" id={id}  />
      </main>
    </>
  )
}
