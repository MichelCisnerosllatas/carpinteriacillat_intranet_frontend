import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { TypeSectionsBreadcrumb } from '@/features/typesections/ui/typesections-breadcrumb'
import { TypeSectionDetail } from '@/features/typesections/ui/detail/typesection-detail'

export const metadata: Metadata = { title: 'Detalle de Sección' }

export default async function TypeSectionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <>
      <Header fixed title="Detalle de Sección" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <TypeSectionsBreadcrumb currentPage="Detalle" showHeader={false} />
        <TypeSectionDetail id={id} />
      </main>
    </>
  )
}
