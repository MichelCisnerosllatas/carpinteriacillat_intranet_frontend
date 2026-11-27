import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { SectionButtonsBreadcrumb } from '@/features/section-buttons/ui/section-buttons-breadcrumb'
import { SectionButtonDetail } from '@/features/section-buttons/ui/detail/section-button-detail'

export const metadata: Metadata = { title: 'Detalle de Botón' }

export default async function SectionButtonDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <>
      <Header fixed title="Detalle de Botón" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <SectionButtonsBreadcrumb currentPage="Detalle" showHeader={true} />
        <SectionButtonDetail id={id} />
      </main>
    </>
  )
}
