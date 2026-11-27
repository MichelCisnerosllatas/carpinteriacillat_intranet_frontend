'use client'

// Orden de la Galería. El orden es GLOBAL (un solo `webwork_order` para todos los tipos).
// - Sin tipo: se reordena la lista completa y la API deja 1..N.
// - Con tipo (`typeKey`, ej. desde la pestaña Trabajos de la sección «Restauración»): solo se listan
//   y se mandan los trabajos de ese tipo; la API los reordena dentro de las posiciones que ya ocupan,
//   así los demás tipos no se mueven (ver WebWorksRepository::reorder en el backend).

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  DndContext, closestCenter, PointerSensor, TouchSensor, KeyboardSensor,
  useSensor, useSensors, type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { LoaderCircle, MousePointerClick } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { swalConfirm } from '@/shared/lib/swal'
import { toastError, toastSuccess } from '@/shared/lib/toast'
import { goBackOrFallback } from '@/shared/lib/navigation-history'
import { webWorksService } from '../../../services/web-works.service'
import { useWebWorkReorderStore } from '../../../stores/useWebWorkReorderStore'
import { useCan } from '@/features/auth/hooks/usePermission'
import type { ReorderItem } from './types'
import { SortableRow } from './sortable-row'

export function WebWorksReorderList({ typeKey }: { typeKey?: string }) {
  const router = useRouter()
  const canReorder = useCan('web_works.reorder')
  const { isSubmitting, confirm } = useWebWorkReorderStore()

  const [items, setItems]                 = useState<ReorderItem[]>([])
  const [originalItems, setOriginalItems] = useState<ReorderItem[]>([])
  const [isLoading, setIsLoading]         = useState(true)
  const [isError, setIsError]             = useState(false)
  const [reloadKey, setReloadKey]         = useState(0)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  useEffect(() => {
    let cancelled = false
    // La API ya devuelve en el orden de la Galería (webwork_order asc, nulos al final)
    webWorksService.getList({ page: 1, per_page: 100, typework_key: typeKey })
      .then((res) => {
        if (cancelled) return
        if (!res.success) { setIsError(true); return }
        const built: ReorderItem[] = res.data.map((w) => ({
          id: w.id_web_work,
          title: w.webwork_title,
          coverUrl: w.cover?.url ?? null,
          typeKey: w.type?.typework_key ?? '',
          typeName: w.type?.typework_name ?? '—',
          stateValue: w.webwork_state,
        }))
        setItems(built)
        setOriginalItems([...built])
      })
      .catch(() => { if (!cancelled) setIsError(true) })
      .finally(() => { if (!cancelled) setIsLoading(false) })
    return () => { cancelled = true }
  }, [reloadKey, typeKey])

  const hasChanges = useMemo(() => items.some((item, idx) => item.id !== originalItems[idx]?.id), [items, originalItems])

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return
    const oldIdx = items.findIndex((i) => i.id === active.id)
    const newIdx = items.findIndex((i) => i.id === over.id)
    setItems((prev) => arrayMove(prev, oldIdx, newIdx))
  }

  const moveItem = (id: number, direction: -1 | 1) => {
    const idx = items.findIndex((i) => i.id === id)
    const newIdx = idx + direction
    if (idx < 0 || newIdx < 0 || newIdx >= items.length) return
    setItems((prev) => arrayMove(prev, idx, newIdx))
  }

  const handleConfirm = async () => {
    const confirmed = await swalConfirm({
      title: '¿Confirmar nuevo orden?',
      text: `Se actualizará el orden de ${items.length} trabajo(s) en la web.`,
      confirmText: 'Sí, confirmar',
      cancelText: 'Cancelar',
    })
    if (!confirmed) return

    const ok = await confirm(items.map((i) => i.id))
    if (ok) {
      toastSuccess('Orden actualizado', 'El nuevo orden se guardó correctamente.')
      goBackOrFallback(router, '/web-works')
    } else {
      toastError('Error', useWebWorkReorderStore.getState().error ?? 'No se pudo actualizar el orden.')
    }
  }

  // Sin permiso de reordenar solo mostramos un aviso (ver ROLES_Y_PERMISOS.md)
  if (!canReorder) {
    return (
      <div className="flex min-h-[300px] items-center justify-center text-sm text-muted-foreground">
        No tienes permiso para reordenar.
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center">
        <LoaderCircle className="mb-3 size-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Cargando trabajos...</p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center gap-3">
        <p className="text-sm font-semibold">Error al cargar trabajos</p>
        <Button size="sm" variant="outline" onClick={() => { setIsLoading(true); setIsError(false); setReloadKey((k) => k + 1) }}>Reintentar</Button>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <Card>
        <CardContent className="flex flex-col gap-1 pt-6 text-sm text-muted-foreground">
          <span className="flex items-center gap-2"><MousePointerClick className="size-4" />Arrastra para cambiar el orden en que se muestran los trabajos en la web. Nada se guarda hasta que confirmes.</span>
          <span className="text-xs">
            {typeKey
              ? 'Solo se ordenan los trabajos de este tipo, entre ellos: los de otros tipos se quedan en su lugar.'
              : 'El orden es uno solo para todos los tipos: la Galería y el comparador «Restauración» lo respetan.'}
          </span>
        </CardContent>
      </Card>

      {items.length === 0 ? (
        <div className="flex min-h-[120px] items-center justify-center rounded-lg border text-sm text-muted-foreground">
          No hay trabajos para ordenar.
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col gap-2">
              {items.map((item, idx) => (
                <SortableRow
                  key={item.id}
                  item={item}
                  position={idx + 1}
                  onMoveUp={idx > 0 ? () => moveItem(item.id, -1) : undefined}
                  onMoveDown={idx < items.length - 1 ? () => moveItem(item.id, 1) : undefined}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <div className="flex items-center justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => goBackOrFallback(router, '/web-works')} disabled={isSubmitting}>Cancelar</Button>
        <Button type="button" disabled={!hasChanges || isSubmitting} onClick={handleConfirm} className="min-w-36">
          {isSubmitting ? <><LoaderCircle className="mr-2 size-4 animate-spin" />Guardando...</> : 'Confirmar orden'}
        </Button>
      </div>
    </div>
  )
}
