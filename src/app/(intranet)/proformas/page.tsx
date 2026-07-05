import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import Link from 'next/link'
import { Button } from '@/shared/ui/button'
import { FileText } from 'lucide-react'
import { ProformasTable } from '@/features/proformas/ui/list/proformas-table'

export const metadata: Metadata = { title: 'Proformas' }

export default function ProformasPage() {
  return (
    <>
      <Header fixed title="Proformas" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Proformas</h2>
            <p className="text-muted-foreground">Cotizaciones emitidas a clientes</p>
          </div>
          <Button asChild className="space-x-1">
            <Link href="/proformas/create"><FileText size={18} /><span>Nueva Proforma</span></Link>
          </Button>
        </div>
        <ProformasTable />
      </main>
    </>
  )
}
