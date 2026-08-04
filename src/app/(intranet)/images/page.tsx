import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { ImagesGrid } from '@/features/images/ui/list/images-grid'
import { ImagesHeaderActions } from '@/features/images/ui/list/images-header-actions'

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
          <ImagesHeaderActions />
        </div>
        <ImagesGrid />
      </main>
    </>
  )
}
