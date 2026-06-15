import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import Link from 'next/link'
import { Button } from '@/shared/ui/button'
import { Layers } from 'lucide-react'
import { TypeWoodsTable } from '@/features/typewoods/ui/typewoods-table'

export const metadata: Metadata = { title: 'Tipos de Madera' }

export default function TypeWoodsPage() {
  return (
    <>
      <Header fixed title="Tipos de Madera" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Maderas</h2>
            <p className="text-muted-foreground">Tipos de madera disponibles para muebles</p>
          </div>
          <Button asChild className="space-x-1">
            <Link href="/typewoods/create"><Layers size={18} /><span>Nueva Madera</span></Link>
          </Button>
        </div>
        <TypeWoodsTable />
      </main>
    </>
  )
}
