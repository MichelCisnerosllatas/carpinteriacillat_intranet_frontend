import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { SectionItemsBreadcrumb } from '@/features/section-items/ui/section-items-breadcrumb'
import { SectionItemForm } from '@/features/section-items/ui/form/section-item-form'

export const metadata: Metadata = { title: 'Editar Item' }

export default async function SectionItemEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <>
      <Header fixed title="Editar Item" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <SectionItemsBreadcrumb currentPage="Editar Item" showHeader={true} />
        <SectionItemForm mode="edit" id={id} />
      </main>
    </>
  )
}
