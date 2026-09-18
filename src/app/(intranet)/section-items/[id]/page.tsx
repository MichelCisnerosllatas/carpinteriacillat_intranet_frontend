import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Header } from '@/widgets/header/header'
import { SectionItemsBreadcrumb } from '@/features/section-items/ui/section-items-breadcrumb'
import { SectionItemDetail } from '@/features/section-items/ui/detail/section-item-detail'

export const metadata: Metadata = { title: 'Detalle de Item' }

export default async function SectionItemDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <>
      <Header fixed title="Detalle de Item" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <SectionItemsBreadcrumb currentPage="Detalle" showHeader={true} />
        {/* SectionItemDetail sincroniza la pestaña activa con `?tab=` (useSearchParams) —
            Next.js exige un boundary de Suspense alrededor de cualquier componente que lo use. */}
        <Suspense fallback={null}>
          <SectionItemDetail id={id} />
        </Suspense>
      </main>
    </>
  )
}
