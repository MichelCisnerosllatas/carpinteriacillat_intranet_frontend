import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { CompanyBankAccountsTable } from '@/features/company-bank-accounts/ui/list/company-bank-accounts-table'
import { CompanyBankAccountsPrimaryButtons } from '@/features/company-bank-accounts/ui/company-bank-accounts-primary-buttons'

export const metadata: Metadata = { title: 'Cuentas Bancarias' }

export default function CompanyBankAccountsPage() {
  return (
    <>
      <Header fixed title="Cuentas Bancarias" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Cuentas Bancarias</h2>
            <p className="text-muted-foreground">Cuentas bancarias de la empresa mostradas en las proformas</p>
          </div>
          <CompanyBankAccountsPrimaryButtons />
        </div>
        <CompanyBankAccountsTable />
      </main>
    </>
  )
}
