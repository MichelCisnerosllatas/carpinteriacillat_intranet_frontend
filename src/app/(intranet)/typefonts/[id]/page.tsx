import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { TypeFontsBreadcrumb } from '@/features/typefonts/ui/typefonts-breadcrumb'
import { TypeFontDetail } from '@/features/typefonts/ui/detail/typefont-detail'

export const metadata: Metadata = { title: 'Detalle de Tipografía' }

export default async function TypeFontDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <>
      <Header fixed title="Detalle de Tipografía" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <TypeFontsBreadcrumb currentPage="Detalle" showHeader={false} />
        <TypeFontDetail id={id} />
      </main>
    </>
  )
}
