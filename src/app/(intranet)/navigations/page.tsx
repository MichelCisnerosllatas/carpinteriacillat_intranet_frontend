import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import Link from 'next/link'
import { Button } from '@/shared/ui/button'
import { ArrowUpDown, Plus } from 'lucide-react'
import { NavigationsTable } from '@/features/navigations/ui/list/navigations-table'
import { Can } from '@/features/auth/ui/can'

export const metadata: Metadata = { title: 'Navegaciones' }

export default function NavigationsPage() {
  return (
    <>
      <Header fixed title="Navegaciones" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Navegaciones</h2>
            <p className="text-muted-foreground">Gestión de ítems del menú de navegación</p>
          </div>
          <div className="flex gap-2">
            {/* Solo si tiene permiso de reordenar (ver ROLES_Y_PERMISOS.md) */}
            <Can permission="navigations.reorder">
              <Button asChild variant="outline" className="space-x-1">
                <Link href="/navigations/reorder"><ArrowUpDown size={18} /><span>Reordenar</span></Link>
              </Button>
            </Can>
            {/* Solo si tiene permiso de crear (ver ROLES_Y_PERMISOS.md) */}
            <Can permission="navigations.create">
              <Button asChild className="space-x-1">
                <Link href="/navigations/create"><Plus size={18} /><span>Nueva Navegación</span></Link>
              </Button>
            </Can>
          </div>
        </div>
        <NavigationsTable />
      </main>
    </>
  )
}
