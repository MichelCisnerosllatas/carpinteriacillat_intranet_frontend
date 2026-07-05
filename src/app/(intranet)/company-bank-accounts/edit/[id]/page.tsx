import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { CompanyBankAccountsBreadcrumb } from '@/features/company-bank-accounts/ui/company-bank-accounts-breadcrumb'
import { CompanyBankAccountForm } from '@/features/company-bank-accounts/ui/form/company-bank-account-form'

export const metadata: Metadata = { title: 'Cuentas Bancarias' }

export default async function CompanyBankAccountEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <>
      <Header fixed title="Editar Cuenta Bancaria" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <CompanyBankAccountsBreadcrumb currentPage="Editar Cuenta Bancaria" />
        <CompanyBankAccountForm mode="edit" id={id} />
      </main>
    </>
  )
}
