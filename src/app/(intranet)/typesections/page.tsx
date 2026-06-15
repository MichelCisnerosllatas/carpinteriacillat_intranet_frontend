import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import Link from 'next/link'
import { Button } from '@/shared/ui/button'
import { LayoutGrid } from 'lucide-react'
import { TypeSectionsTable } from '@/features/typesections/ui/typesections-table'

export const metadata: Metadata = { title: 'Tipos de Sección' }

export default function TypeSectionsPage() {
  return (
    <>
      <Header fixed title="Tipos de Sección" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Secciones</h2>
            <p className="text-muted-foreground">Tipos de sección del sitio web</p>
          </div>
          <Button asChild className="space-x-1">
            <Link href="/typesections/create"><LayoutGrid size={18} /><span>Nueva Sección</span></Link>
          </Button>
        </div>
        <TypeSectionsTable />
      </main>
    </>
  )
}
