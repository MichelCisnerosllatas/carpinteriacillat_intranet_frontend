import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { CompanyBankAccountsBreadcrumb } from '@/features/company-bank-accounts/ui/company-bank-accounts-breadcrumb'
import { CompanyBankAccountDetail } from '@/features/company-bank-accounts/ui/detail/company-bank-account-detail'

export const metadata: Metadata = { title: 'Cuentas Bancarias' }

export default async function CompanyBankAccountDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <>
      <Header fixed title="Detalle de Cuenta Bancaria" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <CompanyBankAccountsBreadcrumb currentPage="Detalle" showHeader={false} />
        <CompanyBankAccountDetail id={id} />
      </main>
    </>
  )
}
