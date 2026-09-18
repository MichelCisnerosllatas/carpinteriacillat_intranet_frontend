import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { SectionItemsBreadcrumb } from '@/features/section-items/ui/section-items-breadcrumb'
import { SectionItemSettingsForm } from '@/features/section-items/ui/form/section-item-settings-form'

export const metadata: Metadata = { title: 'Configuración de Item de Sección' }

export default async function SectionItemSettingsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <>
      <Header fixed title="Configuración de Item de Sección" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <SectionItemsBreadcrumb currentPage="Configuración" showHeader={true} />
        <SectionItemSettingsForm id={id} />
      </main>
    </>
  )
}
