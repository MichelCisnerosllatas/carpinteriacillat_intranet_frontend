import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { WebWorksBreadcrumb } from '@/features/web-works/ui/web-works-breadcrumb'
import { WebWorksReorderList } from '@/features/web-works/ui/reorder/web-works-reorder-list'

export const metadata: Metadata = { title: 'Ordenar Trabajos' }

export default async function WebWorksReorderPage({ searchParams }: { searchParams: Promise<{ typework_key?: string }> }) {
  const { typework_key } = await searchParams
  // `?typework_key=` (pestaña Trabajos de la sección «Restauración») ordena solo los de ese tipo
  return (
    <>
      <Header fixed title="Ordenar Trabajos" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <WebWorksBreadcrumb currentPage="Ordenar" />
        <WebWorksReorderList typeKey={typework_key || undefined} />
      </main>
    </>
  )
}
