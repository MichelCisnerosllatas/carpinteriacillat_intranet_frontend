import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { WebWorksBreadcrumb } from '@/features/web-works/ui/web-works-breadcrumb'
import { WebWorkForm } from '@/features/web-works/ui/form/web-work-form'

export const metadata: Metadata = { title: 'Nuevo Trabajo' }

export default async function WebWorkCreatePage({ searchParams }: { searchParams: Promise<{ id_furniture?: string; typework_key?: string }> }) {
  const { id_furniture, typework_key } = await searchParams
  // `?id_furniture=` (botón "Crear trabajo con este mueble" de la ficha de muebles) preselecciona el mueble
  const furnitureId = id_furniture && Number(id_furniture) > 0 ? Number(id_furniture) : null
  // `?typework_key=` (pestaña Trabajos de la sección «Restauración») preselecciona el tipo
  return (
    <>
      <Header fixed title="Nuevo Trabajo" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6">
        <WebWorksBreadcrumb currentPage="Nuevo Trabajo" />
        <WebWorkForm mode="create" initialFurnitureId={furnitureId} initialTypeKey={typework_key || null} />
      </main>
    </>
  )
}
