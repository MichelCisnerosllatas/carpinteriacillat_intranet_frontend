import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { HardDrive } from 'lucide-react'
import { StorageGallery } from '@/features/images_storage/ui/gallery/storage-gallery'

export const metadata: Metadata = { title: 'Almacenamiento — Imágenes' }

export default function ImageStoragePage() {
  return (
    <>
      <Header fixed title="Almacenamiento del Servidor" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <HardDrive className="size-6" />
            Imagenes
          </h2>
          <p className="text-sm text-muted-foreground">
            Gestión de imagenes almacenadas en el servidor          
          </p>
        </div>
        <StorageGallery />
      </main>
    </>
  )
}
