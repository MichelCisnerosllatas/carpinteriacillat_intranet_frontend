import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { SectionsBreadcrumb } from '@/features/sections/ui/sections-breadcrumb'
import { SectionsReorderList } from '@/features/sections/ui/reorder/sections-reorder-list'

export const metadata: Metadata = { title: 'Reordenar Secciones' }

export default function SectionReorderPage() {
  return (
    <>
      <Header fixed title="Reordenar Secciones" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <SectionsBreadcrumb currentPage="Reordenar" />
        <SectionsReorderList />
      </main>
    </>
  )
}
