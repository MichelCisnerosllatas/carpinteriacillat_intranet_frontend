import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { ImagesBreadcrumb } from '@/features/images/ui/images-breadcrumb'
import { ImageUploadForm } from '@/features/images/ui/form/image-upload-form'

export const metadata: Metadata = { title: 'Subir Imagen' }

export default function ImageUploadPage() {
  return (
    <>
      <Header fixed title="Subir Imagen" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <ImagesBreadcrumb currentPage="Subir Imagen" />
        <ImageUploadForm />
      </main>
    </>
  )
}
