import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import Link from 'next/link'
import { Button } from '@/shared/ui/button'
import { ArrowUpDown, Plus } from 'lucide-react'
import { Can } from '@/features/auth/ui/can'
import { SectionItemsTable } from '@/features/section-items/ui/list/section-items-table'

export const metadata: Metadata = { title: 'Items de Sección' }

export default function SectionItemsPage() {
  return (
    <>
      <Header fixed title="Items de Sección" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Items de Sección</h2>
            <p className="text-muted-foreground">Estadísticas, características, ubicaciones y valoraciones de cada sección</p>
          </div>
          <div className="flex gap-2">
            {/* Solo si tiene permiso de reordenar / crear items (ver ROLES_Y_PERMISOS.md) */}
            <Can permission="section_items.reorder">
              <Button asChild variant="outline" className="space-x-1">
                <Link href="/section-items/reorder"><ArrowUpDown size={18} /><span>Reordenar</span></Link>
              </Button>
            </Can>
            <Can permission="section_items.create">
              <Button asChild className="space-x-1">
                <Link href="/section-items/create"><Plus size={18} /><span>Nuevo Item</span></Link>
              </Button>
            </Can>
          </div>
        </div>
        <SectionItemsTable />
      </main>
    </>
  )
}
