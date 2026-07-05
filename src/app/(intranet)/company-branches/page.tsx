import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import Link from 'next/link'
import { Button } from '@/shared/ui/button'
import { Building2 } from 'lucide-react'
import { CompanyBranchesTable } from '@/features/company-branches/ui/list/company-branches-table'

export const metadata: Metadata = { title: 'Sucursales' }

export default function CompanyBranchesPage() {
  return (
    <>
      <Header fixed title="Sucursales" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Sucursales</h2>
            <p className="text-muted-foreground">Sucursales y talleres de la empresa</p>
          </div>
          <Button asChild className="space-x-1">
            <Link href="/company-branches/create"><Building2 size={18} /><span>Nueva Sucursal</span></Link>
          </Button>
        </div>
        <CompanyBranchesTable />
      </main>
    </>
  )
}
