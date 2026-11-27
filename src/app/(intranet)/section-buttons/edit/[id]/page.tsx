import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Header } from '@/widgets/header/header'
import { SectionButtonsBreadcrumb } from '@/features/section-buttons/ui/section-buttons-breadcrumb'
import { SectionButtonForm } from '@/features/section-buttons/ui/form/section-button-form'

export const metadata: Metadata = { title: 'Editar Botón' }

export default async function SectionButtonEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <>
      <Header fixed title="Editar Botón" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <SectionButtonsBreadcrumb currentPage="Editar Botón" showHeader={true} />
        {/* SectionButtonForm siempre llama a useSearchParams (aunque en modo edit no lo use
            para precargar) — Next.js exige un boundary de Suspense de todas formas. */}
        <Suspense fallback={null}>
          <SectionButtonForm mode="edit" id={id} />
        </Suspense>
      </main>
    </>
  )
}
