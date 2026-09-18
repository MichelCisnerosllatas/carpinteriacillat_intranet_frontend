'use client'

import { useRouter } from 'next/navigation'
import NProgress from 'nprogress'
import { ArrowUpDown, MousePointerClick, Plus } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { SectionButtonsTable } from '@/features/section-buttons/ui/list/section-buttons-table'

interface SectionDetailButtonsTabProps {
  sectionId: number
  /** `type_section.web_settings.buttons_add` — oculta "Nuevo botón" cuando el conjunto de
   * botones es fijo (ej. "contact", cuyos 2 botones son parte fija del layout web). */
  canAdd?: boolean
  /** `type_section.web_settings.buttons_reorder` — oculta "Reordenar" y la columna "Orden"
   * cuando el orden no afecta nada en el sitio web (ej. "contact", donde cada botón se ubica
   * por su `action_key`, no por su posición). */
  canReorder?: boolean
  /** `type_section.web_settings.buttons_delete` — oculta la acción "Eliminar" (fila y masivo). */
  canDelete?: boolean
}

/** Tab "Botones" del detalle de Section — lista embebida (filtrada a esta sección) + alta/reordenar. */
export function SectionDetailButtonsTab({ sectionId, canAdd = true, canReorder = true, canDelete = true }: SectionDetailButtonsTabProps) {
  const router = useRouter()
  const goTo = (path: string) => { NProgress.start(); router.push(path) }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-sm font-medium"><MousePointerClick className="size-4" />Botones de la sección</h3>
        <div className="flex items-center gap-2">
          {canReorder && (
            <Button size="sm" variant="outline" onClick={() => goTo(`/section-buttons/reorder?id_section=${sectionId}`)}>
              <ArrowUpDown className="mr-1.5 size-4" />Reordenar
            </Button>
          )}
          {canAdd && (
            <Button size="sm" onClick={() => goTo(`/section-buttons/create?id_section=${sectionId}`)}>
              <Plus className="mr-1.5 size-4" />Nuevo botón
            </Button>
          )}
        </div>
      </div>
      {(!canAdd || !canDelete) && (
        <p className="text-xs text-muted-foreground">Este tipo de sección tiene un conjunto fijo de botones — podés editar su texto y activarlos/desactivarlos, pero no agregar ni eliminar.</p>
      )}
      {!canReorder && (
        <p className="text-xs text-muted-foreground">El orden de estos botones no afecta nada en el sitio web — cada uno se ubica por su función, no por su posición.</p>
      )}
      <SectionButtonsTable idSection={sectionId} canReorder={canReorder} canDelete={canDelete} />
    </div>
  )
}
