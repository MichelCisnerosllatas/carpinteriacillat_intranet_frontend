// Página para crear una alerta del sitio.

import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { WebAlertsBreadcrumb } from '@/features/web-alerts/ui/web-alerts-breadcrumb'
import { WebAlertForm } from '@/features/web-alerts/ui/form/web-alert-form'

export const metadata: Metadata = { title: 'Nueva alerta' }

export default function WebAlertCreatePage() {
  return (
    <>
      <Header fixed title="Nueva alerta" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <WebAlertsBreadcrumb currentPage="Nueva alerta" />
        <WebAlertForm mode="create" />
      </main>
    </>
  )
}
