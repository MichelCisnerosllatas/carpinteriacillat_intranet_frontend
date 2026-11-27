import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import Link from 'next/link'
import { Button } from '@/shared/ui/button'
import { ArrowUpDown, Settings, Plus } from 'lucide-react'
import { TestimonyTable } from '@/features/testimony-web/ui/list/testimony-table'
import { Can } from '@/features/auth/ui/can'

export const metadata: Metadata = { title: 'Testimonios' }

export default function TestimonyWebPage() {
  return (
    <>
      <Header fixed title="Testimonios" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Testimonios</h2>
            <p className="text-muted-foreground">Gestión de testimonios de clientes mostrados en el sitio web</p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" className="space-x-1">
              <Link href="/testimony/settings"><Settings size={18} /><span className="hidden sm:inline">Configuración</span></Link>
            </Button>
            {/* Solo si tiene permiso de reordenar (ver ROLES_Y_PERMISOS.md) */}
            <Can permission="testimonies.reorder">
              <Button asChild variant="outline" className="space-x-1">
                <Link href="/testimony/reorder"><ArrowUpDown size={18} /><span>Reordenar</span></Link>
              </Button>
            </Can>
            {/* Solo si tiene permiso de crear (ver ROLES_Y_PERMISOS.md) */}
            <Can permission="testimonies.create">
              <Button asChild className="space-x-1">
                <Link href="/testimony/create"><Plus size={18} /><span>Nuevo Testimonio</span></Link>
              </Button>
            </Can>
          </div>
        </div>
        <TestimonyTable />
      </main>
    </>
  )
}
