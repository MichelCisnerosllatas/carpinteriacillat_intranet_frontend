import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import Link from 'next/link'
import { Button } from '@/shared/ui/button'
import { Shapes } from 'lucide-react'
import { TypeWorksTable } from '@/features/typeworks/ui/list/typeworks-table'

export const metadata: Metadata = { title: 'Tipos de Trabajo' }

export default function TypeWorksPage() {
  return (
    <>
      <Header fixed title="Tipos de Trabajo" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Tipos de trabajo</h2>
            <p className="text-muted-foreground">Clasifican los trabajos de la galería web (Fabricación, Restauración)</p>
          </div>
          <Button asChild className="space-x-1">
            <Link href="/typeworks/create"><Shapes size={18} /><span>Nuevo Tipo</span></Link>
          </Button>
        </div>
        <TypeWorksTable />
      </main>
    </>
  )
}
