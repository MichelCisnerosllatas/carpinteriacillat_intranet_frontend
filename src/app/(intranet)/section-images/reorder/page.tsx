import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { SectionImagesBreadcrumb } from '@/features/sectionimages/ui/sectionimages-breadcrumb'
import { SectionImagesReorderList } from '@/features/sectionimages/ui/reorder/section-images-reorder-list'
import { SectionImagesReorderPicker } from '@/features/sectionimages/ui/reorder/section-images-reorder-picker'

export const metadata: Metadata = { title: 'Reordenar Imágenes de Sección' }

export default async function SectionImagesReorderPage({ searchParams }: { searchParams: Promise<{ id_section?: string }> }) {
  const { id_section } = await searchParams
  const idSection = id_section ? Number(id_section) : null

  return (
    <>
      <Header fixed title="Reordenar Imágenes de Sección" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <SectionImagesBreadcrumb currentPage="Reordenar" />
        {/* Con `?id_section=` (deep link desde el tab de una sección) se salta directo a la
            lista; sin él, se muestra primero el picker para elegir la sección. */}
        {idSection ? <SectionImagesReorderList idSection={idSection} /> : <SectionImagesReorderPicker />}
      </main>
    </>
  )
}
