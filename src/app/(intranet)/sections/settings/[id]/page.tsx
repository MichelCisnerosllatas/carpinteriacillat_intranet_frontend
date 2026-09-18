import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { SectionsBreadcrumb } from '@/features/sections/ui/sections-breadcrumb'
import { SectionSettingsForm } from '@/features/sections/ui/form/section-settings-form'

export const metadata: Metadata = { title: 'Configuración de Sección' }

export default async function SectionSettingsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <>
      <Header fixed title="Configuración de Sección" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <SectionsBreadcrumb currentPage="Configuración" showHeader={true} />
        <SectionSettingsForm id={id} />
      </main>
    </>
  )
}
