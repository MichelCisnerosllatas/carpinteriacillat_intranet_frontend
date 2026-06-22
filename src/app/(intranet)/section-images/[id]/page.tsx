import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { SectionImagesBreadcrumb } from '@/features/sectionimages/ui/sectionimages-breadcrumb'
import { SectionImageDetail } from '@/features/sectionimages/ui/sectionimage-detail'

export const metadata: Metadata = { title: 'Detalle Sección — Imagen' }

export default async function SectionImageDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <>
      <Header fixed title="Detalle Sección — Imagen" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <SectionImagesBreadcrumb currentPage="Detalle" showHeader={false} />
        <SectionImageDetail id={id} />
      </main>
    </>
  )
}
