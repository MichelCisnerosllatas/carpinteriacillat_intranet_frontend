import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { SectionButtonsBreadcrumb } from '@/features/section-buttons/ui/section-buttons-breadcrumb'
import { SectionButtonsReorderList } from '@/features/section-buttons/ui/reorder/section-buttons-reorder-list'
import { SectionButtonsReorderPicker } from '@/features/section-buttons/ui/reorder/section-buttons-reorder-picker'

export const metadata: Metadata = { title: 'Reordenar Botones de Sección' }

export default async function SectionButtonsReorderPage({ searchParams }: { searchParams: Promise<{ id_section?: string }> }) {
  const { id_section } = await searchParams
  const idSection = id_section ? Number(id_section) : null

  return (
    <>
      <Header fixed title="Reordenar Botones de Sección" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <SectionButtonsBreadcrumb currentPage="Reordenar" />
        {/* Con `?id_section=` (deep link desde el tab de una sección) se salta directo a la
            lista; sin él, se muestra primero el picker para elegir la sección. */}
        {idSection ? <SectionButtonsReorderList idSection={idSection} /> : <SectionButtonsReorderPicker />}
      </main>
    </>
  )
}
