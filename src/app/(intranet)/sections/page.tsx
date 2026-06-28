import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import Link from 'next/link'
import { Button } from '@/shared/ui/button'
import { Plus } from 'lucide-react'
import { SectionsTable } from '@/features/sections/ui/list/sections-table'

export const metadata: Metadata = { title: 'Secciones' }

export default function SectionsPage() {
  return (
    <>
      <Header fixed title="Secciones" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Secciones</h2>
            <p className="text-muted-foreground">Gestión de secciones del catálogo</p>
          </div>
          <Button asChild className="space-x-1">
            <Link href="/sections/create"><Plus size={18} /><span>Nueva Sección</span></Link>
          </Button>
        </div>
        <SectionsTable />
      </main>
    </>
  )
}
