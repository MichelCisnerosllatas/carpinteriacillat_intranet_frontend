import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import Link from 'next/link'
import { Button } from '@/shared/ui/button'
import { FileStack } from 'lucide-react'
import { ProformaTemplatesTable } from '@/features/proforma-templates/ui/list/proforma-templates-table'
import { Can } from '@/features/auth/ui/can'

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
          {/* Solo si tiene permiso de crear plantillas (ver ROLES_Y_PERMISOS.md) */}
          <Can permission="proforma_templates.create">
            <Button asChild className="space-x-1">
              <Link href="/proforma-templates/create"><FileStack size={18} /><span>Nueva Plantilla</span></Link>
            </Button>
          </Can>
        </div>
        <ProformaTemplatesTable />
      </main>
    </>
  )
}
