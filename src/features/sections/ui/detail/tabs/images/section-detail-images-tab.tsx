'use client'

import { useRouter } from 'next/navigation'
import NProgress from 'nprogress'
import { ArrowUpDown, Image as ImageIcon, Plus } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { SectionImagesTable } from '@/features/sectionimages/ui/list/sectionimages-table'

interface SectionDetailImagesTabProps {
  sectionId: number
  /** `web_settings.images_add` — oculta "Agregar imagen". Default `true` (comportamiento de siempre). */
  canAdd?: boolean
  /** `web_settings.images_reorder` — oculta "Reordenar". */
  canReorder?: boolean
  /** `web_settings.images_delete` — oculta la acción "Eliminar" (tarjeta y masivo). */
  canDelete?: boolean
}

/** Tab "Imágenes" del detalle de Section — lista embebida (filtrada a esta sección) + alta/reordenar. */
export function SectionDetailImagesTab({ sectionId, canAdd = true, canReorder = true, canDelete = true }: SectionDetailImagesTabProps) {
  const router = useRouter()
  const goTo = (path: string) => { NProgress.start(); router.push(path) }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-sm font-medium"><ImageIcon className="size-4" />Imágenes de la sección</h3>
        <div className="flex items-center gap-2">
          {canReorder && (
            <Button size="sm" variant="outline" onClick={() => goTo(`/section-images/reorder?id_section=${sectionId}`)}>
              <ArrowUpDown className="mr-1.5 size-4" />Reordenar
            </Button>
          )}
          {canAdd && (
            <Button size="sm" onClick={() => goTo(`/section-images/create?id_section=${sectionId}`)}>
              <Plus className="mr-1.5 size-4" />Agregar imagen
            </Button>
          )}
        </div>
      </div>
      <SectionImagesTable idSection={sectionId} canDelete={canDelete} />
    </div>
  )
}
