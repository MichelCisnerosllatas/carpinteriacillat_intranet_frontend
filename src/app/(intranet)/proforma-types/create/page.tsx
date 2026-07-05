import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { ProformaTypesBreadcrumb } from '@/features/proforma-types/ui/proforma-types-breadcrumb'
import { ProformaTypeForm } from '@/features/proforma-types/ui/form/proforma-type-form'

export const metadata: Metadata = { title: 'Tipos de Proforma' }

export default function ProformaTypeCreatePage() {
  return (
    <>
      <Header fixed title="Nuevo Tipo de Proforma" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <ProformaTypesBreadcrumb currentPage="Nuevo Tipo de Proforma" />
        <ProformaTypeForm mode="create" />
      </main>
    </>
  )
}
