// Página para editar una alerta del sitio (el id viene en la URL).

import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { WebAlertsBreadcrumb } from '@/features/web-alerts/ui/web-alerts-breadcrumb'
import { WebAlertForm } from '@/features/web-alerts/ui/form/web-alert-form'

export const metadata: Metadata = { title: 'Editar alerta' }

export default async function WebAlertEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <>
      <Header fixed title="Editar alerta" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <WebAlertsBreadcrumb currentPage="Editar alerta" />
        <WebAlertForm mode="edit" id={id} />
      </main>
    </>
  )
}
