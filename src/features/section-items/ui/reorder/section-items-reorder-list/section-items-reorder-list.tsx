'use client'

import { useCan } from '@/features/auth/hooks/usePermission'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { LayoutGrid, LoaderCircle } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { swalConfirm } from '@/shared/lib/swal'
import { toastError, toastSuccess } from '@/shared/lib/toast'
import { goBackOrFallback } from '@/shared/lib/navigation-history'
import { sectionItemsService } from '../../../services/sectionitems.service'
import { useSectionItemReorderStore } from '../../../stores/useSectionItemReorderStore'
import type { ReorderItem } from './types'
import { SortableRow } from './sortable-row'

/**
 * A diferencia de `sections` (varios grupos por navegación), `sectionitem_order` es único por
 * `id_section` — un solo grupo, lista plana, un solo request a /reorder con { id_section, ids }.
 */
export function SectionItemsReorderList({ idSection }: { idSection: number }) {
  // Solo puede guardar el nuevo orden si tiene permiso de reordenar (ver ROLES_Y_PERMISOS.md)
  const canReorder = useCan('section_items.reorder')
  const router = useRouter()
  const { isSubmitting, confirm } = useSectionItemReorderStore()

  const [items, setItems]                 = useState<ReorderItem[]>([])
  const [originalItems, setOriginalItems]  = useState<ReorderItem[]>([])
  const [isLoading, setIsLoading]          = useState(true)
  const [isError, setIsError]              = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  useEffect(() => {
    let cancelled = false
    sectionItemsService.getList({ id_section: idSection, per_page: 100, page: 1 })
      .then((res) => {
        if (cancelled) return
        if (!res.success) { setIsError(true); return }

        const built = res.data
          .map((i) => ({
            id: i.id_section_item,
            label: i.sectionitem_title || i.sectionitem_label || i.sectionitem_key || `Item #${i.id_section_item}`,
            type: i.sectionitem_type,
            stateValue: i.sectionitem_state,
            order: i.sectionitem_order ?? 0,
          }))
          .sort((a, b) => a.order - b.order)
          .map(({ order: _order, ...item }) => item)

        setItems(built)
        setOriginalItems([...built])
      })
      .catch(() => { if (!cancelled) setIsError(true) })
      .finally(() => { if (!cancelled) setIsLoading(false) })
    return () => { cancelled = true }
  }, [idSection])

  const hasChanges = items.some((item, idx) => item.id !== originalItems[idx]?.id)

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIdx = items.findIndex((i) => i.id === active.id)
    const newIdx = items.findIndex((i) => i.id === over.id)
    setItems((prev) => arrayMove(prev, oldIdx, newIdx))
  }

  // Alternativa al arrastre que siempre funciona, sin depender de dnd-kit ni del handle.
  const moveItem = (id: number, direction: -1 | 1) => {
    const idx = items.findIndex((i) => i.id === id)
    const newIdx = idx + direction
    if (idx < 0 || newIdx < 0 || newIdx >= items.length) return
    setItems((prev) => arrayMove(prev, idx, newIdx))
  }

  const handleConfirm = async () => {
    const confirmed = await swalConfirm({
      title: '¿Confirmar nuevo orden?',
      text: `Se actualizará el orden de ${items.length} item(s) de esta sección.`,
      confirmText: 'Sí, confirmar',
      cancelText: 'Cancelar',
    })
    if (!confirmed) return

    const ok = await confirm(idSection, items.map((i) => i.id))
    if (ok) {
      toastSuccess('Orden actualizado', 'El nuevo orden se guardó correctamente.')
      goBackOrFallback(router, '/section-items')
    } else {
      toastError('Error', 'No se pudo actualizar el orden.')
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center">
        <LoaderCircle className="mb-3 size-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Cargando items...</p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center gap-3">
        <p className="text-sm font-semibold">Error al cargar items</p>
        <Button size="sm" variant="outline" onClick={() => router.refresh()}>Reintentar</Button>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <Card>
        <CardContent className="flex flex-col gap-3 pt-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <LayoutGrid className="size-4" />
            Arrastra para cambiar el orden de los items de esta sección. Nada se guarda hasta que confirmes.
          </div>
        </CardContent>
      </Card>

      {items.length === 0 ? (
        <div className="flex min-h-[120px] items-center justify-center rounded-lg border text-sm text-muted-foreground">
          No hay items para reordenar en esta sección.
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col gap-2">
              {items.map((item, idx) => (
                <SortableRow
                  key={item.id}
                  item={item}
                  onMoveUp={idx > 0 ? () => moveItem(item.id, -1) : undefined}
                  onMoveDown={idx < items.length - 1 ? () => moveItem(item.id, 1) : undefined}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <div className="flex items-center justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => goBackOrFallback(router, '/section-items')} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="button" disabled={!canReorder || !hasChanges || isSubmitting} onClick={handleConfirm} className="min-w-36">
          {isSubmitting
            ? <><LoaderCircle className="mr-2 size-4 animate-spin" />Guardando...</>
            : 'Confirmar orden'}
        </Button>
      </div>
    </div>
  )
}
