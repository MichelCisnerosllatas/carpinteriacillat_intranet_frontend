import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { CategoriesBreadcrumb } from '@/features/categories/ui/categories-breadcrumb'
import { CategoryForm } from '@/features/categories/ui/form/category-form'

export const metadata: Metadata = { title: 'Editar Categoría' }

export default async function CategoryEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <>
      <Header fixed title="Editar Categoría" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <CategoriesBreadcrumb currentPage="Editar Categoría" />
        <CategoryForm mode="edit" id={id} />
      </main>
    </>
  )
}
