import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { CompanySignaturesBreadcrumb } from '@/features/company-signatures/ui/company-signatures-breadcrumb'
import { CompanySignatureForm } from '@/features/company-signatures/ui/form/company-signature-form'

export const metadata: Metadata = { title: 'Firmas de la Empresa' }

export default function CompanySignatureCreatePage() {
  return (
    <>
      <Header fixed title="Nueva Firma" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <CompanySignaturesBreadcrumb currentPage="Nueva Firma" />
        <CompanySignatureForm mode="create" />
      </main>
    </>
  )
}
