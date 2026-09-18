'use client'

import { useRouter } from 'next/navigation'
import NProgress from 'nprogress'
import { ArrowUpDown, LayoutList, Plus } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { SectionItemsTable } from '@/features/section-items/ui/list/section-items-table'

interface SectionDetailItemsTabProps {
  sectionId: number
  /** `type_section.web_settings.items_add` — oculta "Nuevo item" cuando el conjunto de items es
   * fijo (ej. "contact", cuyos 4 items de datos son parte fija del layout web). */
  canAdd?: boolean
  /** `type_section.web_settings.items_reorder` — oculta "Reordenar" y la columna "Orden" cuando
   * el orden no afecta nada en el sitio web (ej. "contact", donde cada item se ubica por su
   * `item_type`, no por su posición). */
  canReorder?: boolean
  /** `type_section.web_settings.items_delete` — oculta la acción "Eliminar" (fila y masivo). */
  canDelete?: boolean
}

/** Tab "Items" del detalle de Section — lista embebida (filtrada a esta sección) + alta/reordenar. */
export function SectionDetailItemsTab({ sectionId, canAdd = true, canReorder = true, canDelete = true }: SectionDetailItemsTabProps) {
  const router = useRouter()
  const goTo = (path: string) => { NProgress.start(); router.push(path) }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-sm font-medium"><LayoutList className="size-4" />Items de la sección</h3>
        <div className="flex items-center gap-2">
          {canReorder && (
            <Button size="sm" variant="outline" onClick={() => goTo(`/section-items/reorder?id_section=${sectionId}`)}>
              <ArrowUpDown className="mr-1.5 size-4" />Reordenar
            </Button>
          )}
          {canAdd && (
            <Button size="sm" onClick={() => goTo(`/section-items/create?id_section=${sectionId}`)}>
              <Plus className="mr-1.5 size-4" />Nuevo item
            </Button>
          )}
        </div>
      </div>
      
      {(!canAdd || !canDelete) && (
        <p className="text-xs text-muted-foreground">Este tipo de sección tiene un conjunto fijo de items — podés editar su texto y activarlos/desactivarlos, pero no agregar ni eliminar.</p>
      )}

      {!canReorder && (
        <p className="text-xs text-muted-foreground">El orden de estos items no afecta nada en el sitio web — cada uno se ubica por su tipo, no por su posición.</p>
      )}
      
      <SectionItemsTable idSection={sectionId} canReorder={canReorder} canDelete={canDelete} />
    </div>
  )
}
