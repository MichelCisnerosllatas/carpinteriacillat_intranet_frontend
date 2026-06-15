import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { TypeColorsBreadcrumb } from '@/features/typecolors/ui/typecolors-breadcrumb'
import { TypeColorDetail } from '@/features/typecolors/ui/typecolor-detail'

export const metadata: Metadata = { title: 'Detalle de Color' }

export default async function TypeColorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <>
      <Header fixed title="Detalle de Color" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <TypeColorsBreadcrumb currentPage="Detalle" showHeader={false} />
        <TypeColorDetail id={id} />
      </main>
    </>
  )
}
