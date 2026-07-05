import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import Link from 'next/link'
import { Button } from '@/shared/ui/button'
import { Tags } from 'lucide-react'
import { ProformaTypesTable } from '@/features/proforma-types/ui/list/proforma-types-table'

export const metadata: Metadata = { title: 'Tipos de Proforma' }

export default function ProformaTypesPage() {
  return (
    <>
      <Header fixed title="Tipos de Proforma" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Tipos de Proforma</h2>
            <p className="text-muted-foreground">Catálogo de tipos de proforma</p>
          </div>
          <Button asChild className="space-x-1">
            <Link href="/proforma-types/create"><Tags size={18} /><span>Nuevo Tipo</span></Link>
          </Button>
        </div>
        <ProformaTypesTable />
      </main>
    </>
  )
}
