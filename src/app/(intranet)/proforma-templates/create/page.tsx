import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { ProformaTemplatesBreadcrumb } from '@/features/proforma-templates/ui/proforma-templates-breadcrumb'
import { ProformaTemplateForm } from '@/features/proforma-templates/ui/form/proforma-template-form'

export const metadata: Metadata = { title: 'Plantillas de Proforma' }

export default function ProformaTemplateCreatePage() {
  return (
    <>
      <Header fixed title="Nueva Plantilla de Proforma" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <ProformaTemplatesBreadcrumb currentPage="Nueva Plantilla de Proforma" />
        <ProformaTemplateForm mode="create" />
      </main>
    </>
  )
}
