import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { ImagesBreadcrumb } from '@/features/images/ui/images-breadcrumb'
import { ImageDetail } from '@/features/images/ui/image-detail'

export const metadata: Metadata = { title: 'Detalle de Imagen' }

export default async function ImageDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <>
      <Header fixed title="Detalle de Imagen" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <ImagesBreadcrumb currentPage="Detalle" showHeader={false} />
        <ImageDetail id={id} />
      </main>
    </>
  )
}
