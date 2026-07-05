import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { ProformaTemplatesBreadcrumb } from '@/features/proforma-templates/ui/proforma-templates-breadcrumb'
import { ProformaTemplateDetail } from '@/features/proforma-templates/ui/detail/proforma-template-detail'

export const metadata: Metadata = { title: 'Plantillas de Proforma' }

export default async function ProformaTemplateDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <>
      <Header fixed title="Detalle de Plantilla de Proforma" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <ProformaTemplatesBreadcrumb currentPage="Detalle" showHeader={false} />
        <ProformaTemplateDetail id={id} />
      </main>
    </>
  )
}
