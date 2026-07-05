import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { CompanyBranchesBreadcrumb } from '@/features/company-branches/ui/company-branches-breadcrumb'
import { CompanyBranchDetail } from '@/features/company-branches/ui/detail/company-branch-detail'

export const metadata: Metadata = { title: 'Sucursales' }

export default async function CompanyBranchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <>
      <Header fixed title="Detalle de Sucursal" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <CompanyBranchesBreadcrumb currentPage="Detalle" showHeader={false} />
        <CompanyBranchDetail id={id} />
      </main>
    </>
  )
}
