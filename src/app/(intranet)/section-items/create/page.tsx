import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { SectionItemsBreadcrumb } from '@/features/section-items/ui/section-items-breadcrumb'
import { SectionItemForm } from '@/features/section-items/ui/form/section-item-form'

export const metadata: Metadata = { title: 'Nuevo Item' }

export default function SectionItemCreatePage() {
  return (
    <>
      <Header fixed title="Nuevo Item" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <SectionItemsBreadcrumb currentPage="Nuevo Item" showHeader={true} />
        <SectionItemForm mode="create" />
      </main>
    </>
  )
}
