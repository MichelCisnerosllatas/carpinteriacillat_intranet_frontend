import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import Link from 'next/link'
import { Button } from '@/shared/ui/button'
import { ArrowUpDown, Settings2, Plus } from 'lucide-react'
import { TestimonyTable } from '@/features/testimony-web/ui/list/testimony-table'

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
              <Link href="/testimony/settings"><Settings2 size={18} /><span>Configuración</span></Link>
            </Button>
            <Button asChild variant="outline" className="space-x-1">
              <Link href="/testimony/reorder"><ArrowUpDown size={18} /><span>Reordenar</span></Link>
            </Button>
            <Button asChild className="space-x-1">
              <Link href="/testimony/create"><Plus size={18} /><span>Nuevo Testimonio</span></Link>
            </Button>
          </div>
        </div>
        <TestimonyTable />
      </main>
    </>
  )
}
