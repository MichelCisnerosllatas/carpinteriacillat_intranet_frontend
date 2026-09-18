import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Header } from '@/widgets/header/header'
import { SectionItemDetailsBreadcrumb } from '@/features/section-item-details/ui/section-item-details-breadcrumb'
import { SectionItemDetailForm } from '@/features/section-item-details/ui/form/section-item-detail-form'

export const metadata: Metadata = { title: 'Nuevo Detalle' }

export default function SectionItemDetailCreatePage() {
  return (
    <>
      <Header fixed title="Nuevo Detalle" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <SectionItemDetailsBreadcrumb currentPage="Nuevo Detalle" showHeader={true} />
        {/* SectionItemDetailForm lee `id_section_item` de la URL con useSearchParams — Next.js
            exige un boundary de Suspense alrededor de cualquier componente que lo use. */}
        <Suspense fallback={null}>
          <SectionItemDetailForm mode="create" />
        </Suspense>
      </main>
    </>
  )
}
