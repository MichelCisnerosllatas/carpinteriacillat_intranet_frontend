import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { ProformaTemplatesBreadcrumb } from '@/features/proforma-templates/ui/proforma-templates-breadcrumb'
import { ProformaTemplateForm } from '@/features/proforma-templates/ui/form/proforma-template-form'

export const metadata: Metadata = { title: 'Plantillas de Proforma' }

export default async function ProformaTemplateEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <>
      <Header fixed title="Editar Plantilla de Proforma" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <ProformaTemplatesBreadcrumb currentPage="Editar Plantilla de Proforma" />
        <ProformaTemplateForm mode="edit" id={id} />
      </main>
    </>
  )
}
