'use client'

import { useRouter } from 'next/navigation'
import NProgress from 'nprogress'
import { ArrowUpDown, Image as ImageIcon, Plus } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { SectionImagesTable } from '@/features/sectionimages/ui/list/sectionimages-table'
import { GroupedImagesManager, getGroupedSectionConfig } from '@/features/sectionimages/grouped'

interface SectionDetailImagesTabProps {
  sectionId: number
  /** `type_section.typesection_key` — las secciones especiales (hero de Servicios, carrusel de categorías) usan la vista agrupada por item (ver getGroupedSectionConfig). */
  typesectionKey?: string | null
  /** `web_settings.images_add` — oculta "Agregar imagen". Default `true` (comportamiento de siempre). */
  canAdd?: boolean
  /** `web_settings.images_reorder` — oculta "Reordenar". */
  canReorder?: boolean
  /** `web_settings.images_delete` — oculta la acción "Eliminar" (tarjeta y masivo). */
  canDelete?: boolean
}

/** Tab "Imágenes" del detalle de Section — lista embebida (filtrada a esta sección) + alta/reordenar. */
export function SectionDetailImagesTab({ sectionId, typesectionKey, canAdd = true, canReorder = true, canDelete = true }: SectionDetailImagesTabProps) {
  const router = useRouter()
  const goTo = (path: string) => { NProgress.start(); router.push(path) }

  // Botones de arriba (iguales para todas las secciones): "Reordenar" y "Agregar imagen".
  // "Agregar imagen" abre el formulario con la sección ya elegida; ahí se elige el item/servicio.
  // Al guardar, el formulario vuelve a esta pestaña (goBackOrFallback).
  const actionButtons = (
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
  )

  // Secciones especiales: hero de Servicios y carrusel de categorías (ver features/sectionimages/grouped)
  const groupedConfig = getGroupedSectionConfig(typesectionKey)
  if (groupedConfig) {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="flex flex-col gap-1">
            <h3 className="flex items-center gap-2 text-sm font-medium"><ImageIcon className="size-4" />{groupedConfig.tabTitle}</h3>
            <p className="max-w-2xl text-xs text-muted-foreground">{groupedConfig.tabDescription}</p>
            {/* Aviso propio de la sección (ej. carrusel: qué pasa si una categoría no tiene fotos) */}
            {groupedConfig.helpText && (
              <p className="max-w-2xl text-xs font-medium text-sky-700 dark:text-sky-400">{groupedConfig.helpText}</p>
            )}
          </div>
          {actionButtons}
        </div>
        <GroupedImagesManager config={groupedConfig} idSection={sectionId} canDelete={canDelete} />
      </div>
    )
  }

  // Resto de secciones: vista general
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-sm font-medium"><ImageIcon className="size-4" />Imágenes de la sección</h3>
        {actionButtons}
      </div>
      {/* Las fotos salen agrupadas por item (01 · Título...) con su rol: Principal ★ / Oculta */}
      <SectionImagesTable idSection={sectionId} canDelete={canDelete} canAdd={canAdd} canReorder={canReorder} />
    </div>
  )
}
