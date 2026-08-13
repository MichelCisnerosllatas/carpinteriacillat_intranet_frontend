import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { SectionsBreadcrumb } from '@/features/sections/ui/sections-breadcrumb'
import { SectionDetail } from '@/features/sections/ui/detail/section-detail'

export const metadata: Metadata = { title: 'Detalle de Sección' }

export default async function SectionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <>
      <Header fixed title="Detalle de Sección" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <SectionsBreadcrumb currentPage="Detalle" showHeader={true} />
        <SectionDetail id={id} />
      </main>
    </>
  )
}
