import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { ProformasBreadcrumb } from '@/features/proformas/ui/proformas-breadcrumb'
import { ProformaForm } from '@/features/proformas/ui/form/proforma-form'

export const metadata: Metadata = { title: 'Proformas' }

export default function ProformaCreatePage() {
  return (
    <>
      <Header fixed title="Proformas" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <ProformasBreadcrumb currentPage="Nueva Proforma" />
        <ProformaForm mode="create" />
      </main>
    </>
  )
}
