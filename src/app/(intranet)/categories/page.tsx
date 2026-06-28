import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import Link from 'next/link'
import { Button } from '@/shared/ui/button'
import { FolderPlus } from 'lucide-react'
import { CategoriesTable } from '@/features/categories/ui/list/categories-table'

export const metadata: Metadata = { title: 'Categorías' }

export default function CategoriesPage() {
  return (
    <>
      <Header fixed title="Categorías de Muebles" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Categorías</h2>
            <p className="text-muted-foreground">Gestiona las categorías del catálogo de muebles</p>
          </div>
          <Button asChild className="space-x-1">
            <Link href="/categories/create"><FolderPlus size={18} /><span>Nueva Categoría</span></Link>
          </Button>
        </div>
        <CategoriesTable />
      </main>
    </>
  )
}
