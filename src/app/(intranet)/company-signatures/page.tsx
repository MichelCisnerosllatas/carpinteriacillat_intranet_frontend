import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import Link from 'next/link'
import { Button } from '@/shared/ui/button'
import { Can } from '@/features/auth/ui/can'
import { PenTool } from 'lucide-react'
import { CompanySignaturesTable } from '@/features/company-signatures/ui/list/company-signatures-table'

export const metadata: Metadata = { title: 'Firmas de la Empresa' }

export default function CompanySignaturesPage() {
  return (
    <>
      <Header fixed title="Firmas de la Empresa" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Firmas de la Empresa</h2>
            <p className="text-muted-foreground">Firmas usadas en la impresión de proformas</p>
          </div>
          {/* Solo si tiene permiso de crear (ver ROLES_Y_PERMISOS.md) */}
          <Can permission="company_signatures.create">
            <Button asChild className="space-x-1">
              <Link href="/company-signatures/create"><PenTool size={18} /><span>Nueva Firma</span></Link>
            </Button>
          </Can>
        </div>
        <CompanySignaturesTable />
      </main>
    </>
  )
}
