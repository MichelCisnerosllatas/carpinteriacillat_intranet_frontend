import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { TestimonyWebBreadcrumb } from '@/features/testimony-web/ui/testimony-web-breadcrumb'
import { TestimonyReorderList } from '@/features/testimony-web/ui/reorder/testimony-reorder-list'

export const metadata: Metadata = { title: 'Reordenar Testimonios' }

/**
 * En la práctica existe una única sección de testimonios en todo el sitio — `TestimonyReorderList`
 * la resuelve internamente, así que no hay nada que elegir de antemano.
 */
export default function TestimonyWebReorderPage() {
  return (
    <>
      <Header fixed title="Reordenar Testimonios" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <TestimonyWebBreadcrumb currentPage="Reordenar" />
        <TestimonyReorderList />
      </main>
    </>
  )
}
