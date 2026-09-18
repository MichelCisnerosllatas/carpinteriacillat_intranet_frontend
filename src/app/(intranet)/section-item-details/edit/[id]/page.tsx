import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Header } from '@/widgets/header/header'
import { SectionItemDetailsBreadcrumb } from '@/features/section-item-details/ui/section-item-details-breadcrumb'
import { SectionItemDetailForm } from '@/features/section-item-details/ui/form/section-item-detail-form'

export const metadata: Metadata = { title: 'Editar Detalle' }

export default async function SectionItemDetailEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <>
      <Header fixed title="Editar Detalle" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <SectionItemDetailsBreadcrumb currentPage="Editar Detalle" showHeader={true} />
        {/* SectionItemDetailForm siempre llama a useSearchParams (aunque en modo edit no lo use
            para precargar) — Next.js exige un boundary de Suspense de todas formas. */}
        <Suspense fallback={null}>
          <SectionItemDetailForm mode="edit" id={id} />
        </Suspense>
      </main>
    </>
  )
}
