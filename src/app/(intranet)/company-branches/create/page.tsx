import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { CompanyBranchesBreadcrumb } from '@/features/company-branches/ui/company-branches-breadcrumb'
import { CompanyBranchForm } from '@/features/company-branches/ui/form/company-branch-form'

export const metadata: Metadata = { title: 'Sucursales' }

export default function CompanyBranchCreatePage() {
  return (
    <>
      <Header fixed title="Nueva Sucursal" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <CompanyBranchesBreadcrumb currentPage="Nueva Sucursal" />
        <CompanyBranchForm mode="create" />
      </main>
    </>
  )
}
