import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import Link from 'next/link'
import { Button } from '@/shared/ui/button'
import { Plus } from 'lucide-react'
import { NavigationsTable } from '@/features/navigations/ui/navigations-table'

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
          <Button asChild className="space-x-1">
            <Link href="/navigations/create"><Plus size={18} /><span>Nueva Navegación</span></Link>
          </Button>
        </div>
        <NavigationsTable />
      </main>
    </>
  )
}
