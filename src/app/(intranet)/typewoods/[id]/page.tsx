import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { TypeWoodsBreadcrumb } from '@/features/typewoods/ui/typewoods-breadcrumb'
import { TypeWoodDetail } from '@/features/typewoods/ui/typewood-detail'

export const metadata: Metadata = { title: 'Detalle de Madera' }

export default async function TypeWoodDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <>
      <Header fixed title="Detalle de Madera" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <TypeWoodsBreadcrumb currentPage="Detalle" showHeader={false} />
        <TypeWoodDetail id={id} />
      </main>
    </>
  )
}
