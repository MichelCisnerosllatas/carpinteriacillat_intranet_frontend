import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import Link from 'next/link'
import { Button } from '@/shared/ui/button'
import { Plus } from 'lucide-react'
import { SectionImagesTable } from '@/features/sectionimages/ui/sectionimages-table'

export const metadata: Metadata = { title: 'Sección — Imágenes' }

export default function SectionImagesPage() {
  return (
    <>
      <Header fixed title="Sección — Imágenes" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Sección — Imágenes</h2>
            <p className="text-muted-foreground">Asignación de imágenes a secciones del catálogo</p>
          </div>
          <Button asChild className="space-x-1">
            <Link href="/section-images/create"><Plus size={18} /><span>Nueva Asignación</span></Link>
          </Button>
        </div>
        <SectionImagesTable />
      </main>
    </>
  )
}
