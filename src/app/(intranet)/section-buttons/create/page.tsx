import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Header } from '@/widgets/header/header'
import { SectionButtonsBreadcrumb } from '@/features/section-buttons/ui/section-buttons-breadcrumb'
import { SectionButtonForm } from '@/features/section-buttons/ui/form/section-button-form'

export const metadata: Metadata = { title: 'Nuevo Botón' }

export default function SectionButtonCreatePage() {
  return (
    <>
      <Header fixed title="Nuevo Botón" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <SectionButtonsBreadcrumb currentPage="Nuevo Botón" showHeader={true} />
        {/* SectionButtonForm lee `id_section` de la URL con useSearchParams — Next.js exige
            un boundary de Suspense alrededor de cualquier componente que lo use. */}
        <Suspense fallback={null}>
          <SectionButtonForm mode="create" />
        </Suspense>
      </main>
    </>
  )
}
