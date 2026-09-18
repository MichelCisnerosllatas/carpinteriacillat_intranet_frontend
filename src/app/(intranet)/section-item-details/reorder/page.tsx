import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { SectionItemDetailsBreadcrumb } from '@/features/section-item-details/ui/section-item-details-breadcrumb'
import { SectionItemDetailsReorderList } from '@/features/section-item-details/ui/reorder/section-item-details-reorder-list'
import { SectionItemDetailsReorderPicker } from '@/features/section-item-details/ui/reorder/section-item-details-reorder-picker'

export const metadata: Metadata = { title: 'Reordenar Detalles de Item de Sección' }

export default async function SectionItemDetailsReorderPage({ searchParams }: { searchParams: Promise<{ id_section_item?: string }> }) {
  const { id_section_item } = await searchParams
  const idSectionItem = id_section_item ? Number(id_section_item) : null

  return (
    <>
      <Header fixed title="Reordenar Detalles de Item de Sección" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <SectionItemDetailsBreadcrumb currentPage="Reordenar" />
        {/* Con `?id_section_item=` (deep link desde el tab de un item de sección) se salta
            directo a la lista; sin él, se muestra primero el picker para elegir el item. */}
        {idSectionItem ? <SectionItemDetailsReorderList idSectionItem={idSectionItem} /> : <SectionItemDetailsReorderPicker />}
      </main>
    </>
  )
}
