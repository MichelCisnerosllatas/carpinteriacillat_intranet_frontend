import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import Link from 'next/link'
import { Button } from '@/shared/ui/button'
import { Can } from '@/features/auth/ui/can'
import { FileText } from 'lucide-react'
import { TypeDocsTable } from '@/features/typedocs/ui/list/typedocs-table'

export const metadata: Metadata = { title: 'Tipos de Documento' }

export default function TypeDocsPage() {
  return (
    <>
      <Header fixed title="Tipos de Documento" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Documentos</h2>
            <p className="text-muted-foreground">Tipos de documento de identidad</p>
          </div>
          {/* Solo si tiene permiso de crear (ver ROLES_Y_PERMISOS.md) */}
          <Can permission="type_docs.create">
            <Button asChild className="space-x-1">
              <Link href="/typedocs/create"><FileText size={18} /><span>Nuevo Documento</span></Link>
            </Button>
          </Can>
        </div>
        <TypeDocsTable />
      </main>
    </>
  )
}
