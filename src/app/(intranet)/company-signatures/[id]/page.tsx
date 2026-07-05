import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { CompanySignaturesBreadcrumb } from '@/features/company-signatures/ui/company-signatures-breadcrumb'
import { CompanySignatureDetail } from '@/features/company-signatures/ui/detail/company-signature-detail'

export const metadata: Metadata = { title: 'Firmas de la Empresa' }

export default async function CompanySignatureDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <>
      <Header fixed title="Detalle de Firma" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <CompanySignaturesBreadcrumb currentPage="Detalle" showHeader={false} />
        <CompanySignatureDetail id={id} />
      </main>
    </>
  )
}
