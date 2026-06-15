import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { TypeWoodsBreadcrumb } from '@/features/typewoods/ui/typewoods-breadcrumb'
import { TypeWoodForm } from '@/features/typewoods/ui/typewood-form'

export const metadata: Metadata = { title: 'Editar Madera' }

export default async function TypeWoodEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <>
      <Header fixed title="Editar Madera" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <TypeWoodsBreadcrumb currentPage="Editar Madera" />
        <TypeWoodForm mode="edit" id={id} />
      </main>
    </>
  )
}
