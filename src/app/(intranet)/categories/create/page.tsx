import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { CategoriesBreadcrumb } from '@/features/categories/ui/categories-breadcrumb'
import { CategoryForm } from '@/features/categories/ui/category-form'

export const metadata: Metadata = { title: 'Nueva Categoría' }

export default function CategoryCreatePage() {
  return (
    <>
      <Header fixed title="Nueva Categoría" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <CategoriesBreadcrumb currentPage="Nueva Categoría" />
        <CategoryForm mode="create" />
      </main>
    </>
  )
}
