import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { TypeFontsBreadcrumb } from '@/features/typefonts/ui/typefonts-breadcrumb'
import { TypeFontForm } from '@/features/typefonts/ui/form/typefont-form'

export const metadata: Metadata = { title: 'Nueva Tipografía' }

export default function TypeFontCreatePage() {
  return (
    <>
      <Header fixed title="Nueva Tipografía" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <TypeFontsBreadcrumb currentPage="Nueva Tipografía" />
        <TypeFontForm mode="create" />
      </main>
    </>
  )
}
