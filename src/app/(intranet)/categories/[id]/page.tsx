import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { CategoriesBreadcrumb } from '@/features/categories/ui/categories-breadcrumb'
import { CategoryDetail } from '@/features/categories/ui/category-detail'

export const metadata: Metadata = { title: 'Detalle de Categoría' }

export default async function CategoryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <>
      <Header fixed title="Detalle de Categoría" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <CategoriesBreadcrumb currentPage="Detalle" showHeader={false} />
        <CategoryDetail id={id} />
      </main>
    </>
  )
}
