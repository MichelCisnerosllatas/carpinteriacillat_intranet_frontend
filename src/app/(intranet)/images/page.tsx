import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import Link from 'next/link'
import { Button } from '@/shared/ui/button'
import { Upload } from 'lucide-react'
import { ImagesGrid } from '@/features/images/ui/images-grid'

export const metadata: Metadata = { title: 'Imágenes' }

export default function ImagesPage() {
  return (
    <>
      <Header fixed title="Gestión de Imágenes" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Imágenes</h2>
            <p className="text-muted-foreground">Gestiona las imágenes registradas en el sistema</p>
          </div>
          <Button asChild className="space-x-1">
            <Link href="/images/upload"><Upload size={18} /><span>Subir imagen</span></Link>
          </Button>
        </div>
        <ImagesGrid />
      </main>
    </>
  )
}
