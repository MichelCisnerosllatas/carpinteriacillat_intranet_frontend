import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import Link from 'next/link'
import { Button } from '@/shared/ui/button'
import { FileStack } from 'lucide-react'
import { ProformaTemplatesTable } from '@/features/proforma-templates/ui/list/proforma-templates-table'

export const metadata: Metadata = { title: 'Plantillas de Proforma' }

export default function ProformaTemplatesPage() {
  return (
    <>
      <Header fixed title="Plantillas de Proforma" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Plantillas de Proforma</h2>
            <p className="text-muted-foreground">Diseños de PDF para proformas</p>
          </div>
          <Button asChild className="space-x-1">
            <Link href="/proforma-templates/create"><FileStack size={18} /><span>Nueva Plantilla</span></Link>
          </Button>
        </div>
        <ProformaTemplatesTable />
      </main>
    </>
  )
}
