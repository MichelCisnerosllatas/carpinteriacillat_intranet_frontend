import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { SectionsBreadcrumb } from '@/features/sections/ui/sections-breadcrumb'
import { SectionForm } from '@/features/sections/ui/form/section-form'

export const metadata: Metadata = { title: 'Nueva Sección' }

export default function SectionCreatePage() {
  return (
    <>
      <Header fixed title="Nueva Sección" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <SectionsBreadcrumb currentPage="Nueva Sección" showHeader={true} />
        <SectionForm mode="create" />
      </main>
    </>
  )
}
