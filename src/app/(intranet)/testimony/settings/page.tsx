import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { TestimonyWebBreadcrumb } from '@/features/testimony-web/ui/testimony-web-breadcrumb'
import { TestimonyWebSettingForm } from '@/features/testimony-web/ui/form/testimony-web-setting-form'

export const metadata: Metadata = { title: 'Configuración de Testimonios' }

/**
 * Config de `testimony_web_setting` — SINGLETON GLOBAL (no por sección: solo existe una sección
 * de testimonios en todo el sitio), así que no hay nada que elegir de antemano.
 */
export default function TestimonyWebSettingsPage() {
  return (
    <>
      <Header fixed title="Configuración de Testimonios" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <TestimonyWebBreadcrumb currentPage="Configuración" />
        <TestimonyWebSettingForm />
      </main>
    </>
  )
}
