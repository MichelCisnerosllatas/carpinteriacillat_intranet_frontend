import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { SectionItemDetailsBreadcrumb } from '@/features/section-item-details/ui/section-item-details-breadcrumb'
import { SectionItemDetailDetail } from '@/features/section-item-details/ui/detail/section-item-detail-detail'

export const metadata: Metadata = { title: 'Detalle de Item de Sección' }

export default async function SectionItemDetailDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <>
      <Header fixed title="Detalle de Item de Sección" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <SectionItemDetailsBreadcrumb currentPage="Detalle" showHeader={true} />
        <SectionItemDetailDetail id={id} />
      </main>
    </>
  )
}
