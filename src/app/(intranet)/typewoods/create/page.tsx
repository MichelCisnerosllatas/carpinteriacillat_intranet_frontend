import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { TypeWoodsBreadcrumb } from '@/features/typewoods/ui/typewoods-breadcrumb'
import { TypeWoodForm } from '@/features/typewoods/ui/form/typewood-form'

export const metadata: Metadata = { title: 'Nueva Madera' }

export default function TypeWoodCreatePage() {
  return (
    <>
      <Header fixed title="Nueva Madera" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <TypeWoodsBreadcrumb currentPage="Nueva Madera" />
        <TypeWoodForm mode="create" />
      </main>
    </>
  )
}
