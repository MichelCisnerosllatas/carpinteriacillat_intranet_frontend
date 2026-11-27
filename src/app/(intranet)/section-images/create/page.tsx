import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Header } from '@/widgets/header/header'
import { SectionImagesBreadcrumb } from '@/features/sectionimages/ui/sectionimages-breadcrumb'
import { SectionImageForm } from '@/features/sectionimages/ui/form/sectionimage-form'

export const metadata: Metadata = { title: 'Nueva Asignación' }

export default function SectionImageCreatePage() {
  return (
    <>
      <Header fixed title="Nueva Asignación" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <SectionImagesBreadcrumb currentPage="Nueva Asignación" showHeader={true} />
        {/* SectionImageForm lee `id_section` de la URL con useSearchParams — Next.js exige
            un boundary de Suspense alrededor de cualquier componente que lo use. */}
        <Suspense fallback={null}>
          <SectionImageForm mode="create" />
        </Suspense>
      </main>
    </>
  )
}
