import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import Link from 'next/link'
import { Button } from '@/shared/ui/button'
import { Plus } from 'lucide-react'
import { FurnituresTable } from '@/features/furnitures/ui/list/furnitures-table'

export const metadata: Metadata = { title: 'Muebles' }

export default function FurnituresPage() {
  return (
    <>
      <Header fixed title="Muebles" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Muebles</h2>
            <p className="text-muted-foreground">Catálogo de muebles disponibles</p>
          </div>
          <Button asChild className="space-x-1">
            <Link href="/furnitures/create"><Plus size={18} /><span>Nuevo Mueble</span></Link>
          </Button>
        </div>
        <FurnituresTable />
      </main>
    </>
  )
}
