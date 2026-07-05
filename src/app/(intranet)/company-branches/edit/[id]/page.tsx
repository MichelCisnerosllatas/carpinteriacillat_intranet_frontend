import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { CompanyBranchesBreadcrumb } from '@/features/company-branches/ui/company-branches-breadcrumb'
import { CompanyBranchForm } from '@/features/company-branches/ui/form/company-branch-form'

export const metadata: Metadata = { title: 'Sucursales' }

export default async function CompanyBranchEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <>
      <Header fixed title="Editar Sucursal" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <CompanyBranchesBreadcrumb currentPage="Editar Sucursal" />
        <CompanyBranchForm mode="edit" id={id} />
      </main>
    </>
  )
}
