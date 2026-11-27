import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Header } from '@/widgets/header/header'
import { SectionsBreadcrumb } from '@/features/sections/ui/sections-breadcrumb'
import { SectionSettingsTabs } from '@/features/sections/ui/form/section-settings-tabs'

export const metadata: Metadata = { title: 'Configuración de Sección' }

export default async function SectionSettingsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <>
      <Header fixed title="Configuración de Sección" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <SectionsBreadcrumb currentPage="Configuración" showHeader={true} />
        {/* SectionSettingsTabs sincroniza la pestaña activa con `?tab=` (useSearchParams) — Next.js
            exige un boundary de Suspense alrededor de cualquier componente que lo use. */}
        <Suspense fallback={null}>
          <SectionSettingsTabs id={id} />
        </Suspense>
      </main>
    </>
  )
}
