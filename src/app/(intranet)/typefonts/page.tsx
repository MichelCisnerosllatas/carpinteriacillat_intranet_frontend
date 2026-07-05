import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import Link from 'next/link'
import { Button } from '@/shared/ui/button'
import { Type } from 'lucide-react'
import { TypeFontsTable } from '@/features/typefonts/ui/list/typefonts-table'

export const metadata: Metadata = { title: 'Tipos de Tipografía' }

export default function TypeFontsPage() {
  return (
    <>
      <Header fixed title="Tipos de Tipografía" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Tipografías</h2>
            <p className="text-muted-foreground">Tipos de tipografía disponibles para muebles</p>
          </div>
          <Button asChild className="space-x-1">
            <Link href="/typefonts/create"><Type size={18} /><span>Nueva Tipografía</span></Link>
          </Button>
        </div>
        <TypeFontsTable />
      </main>
    </>
  )
}
