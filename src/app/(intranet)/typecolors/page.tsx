import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import Link from 'next/link'
import { Button } from '@/shared/ui/button'
import { ShieldPlus } from 'lucide-react'
import { TypeColorsTable } from '@/features/typecolors/ui/list/typecolors-table'

export const metadata: Metadata = { title: 'Tipos de Color' }

export default function TypeColorsPage() {
  return (
    <>
      <Header fixed title="Tipos de Color" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Colores</h2>
            <p className="text-muted-foreground">Tipos de color disponibles para muebles</p>
          </div>
          <Button asChild className="space-x-1">
            <Link href="/typecolors/create"><ShieldPlus size={18} /><span>Nuevo Color</span></Link>
          </Button>
        </div>
        <TypeColorsTable />
      </main>
    </>
  )
}
