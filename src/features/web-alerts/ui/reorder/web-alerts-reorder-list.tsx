'use client'

// Pantalla "Ordenar alertas": se arrastran (o se mueven con las flechas) para elegir
// en qué orden aparecen arriba de la web. Nada se guarda hasta tocar "Confirmar orden".

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  DndContext, closestCenter, PointerSensor, TouchSensor, KeyboardSensor,
  useSensor, useSensors, type DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, arrayMove, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ChevronDown, ChevronUp, GripVertical, LoaderCircle, MousePointerClick } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { Badge } from '@/shared/ui/badge'
import { cn } from '@/shared/lib/utils'
import { swalConfirm } from '@/shared/lib/swal'
import { toastError, toastSuccess } from '@/shared/lib/toast'
import { goBackOrFallback } from '@/shared/lib/navigation-history'
import { webAlertsService } from '../../services/web-alerts.service'
import { useWebAlertReorderStore } from '../../stores/useWebAlertReorderStore'
import { mapWebAlertFromApi } from '../../stores/useWebAlertListStore'
import { getAlertStyle, getAlertVisibilityStatus } from '../../data/data'
import type { WebAlert } from '../../data/schema'

/** Una fila que se puede arrastrar. */
function SortableRow({ item, position, onMoveUp, onMoveDown }: {
  item: WebAlert
  position: number
  onMoveUp?: () => void
  onMoveDown?: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id })
  const style = getAlertStyle(item.style)
  const status = getAlertVisibilityStatus(item.visibilityStatus)

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn('flex items-center gap-3 rounded-lg border bg-card px-3 py-2 shadow-sm', isDragging && 'z-50 opacity-75 shadow-md')}
    >
      {/* Agarradera para arrastrar */}
      <div
        {...attributes}
        {...listeners}
        className="flex size-7 shrink-0 cursor-grab touch-none items-center justify-center rounded text-muted-foreground hover:bg-muted active:cursor-grabbing pointer-coarse:size-9"
      >
        <GripVertical className="size-4 pointer-coarse:size-5" />
      </div>
      <span className="w-6 shrink-0 text-center text-xs tabular-nums text-muted-foreground">{position}</span>
      <span className={cn('size-5 shrink-0 rounded-full', style.barClass)} title={style.label} />
      <span className="min-w-0 flex-1 truncate text-sm font-medium">{item.title ?? item.subtitle}</span>
      <Badge variant="outline" className={cn('text-xs', status.badge)}>{status.label}</Badge>
      {/* Flechas para mover sin arrastrar */}
      <div className="flex shrink-0 flex-col gap-0.5">
        <button type="button" onClick={onMoveUp} disabled={!onMoveUp} aria-label="Subir" className="flex size-6 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-30 pointer-coarse:size-8">
          <ChevronUp className="size-3.5 pointer-coarse:size-4" />
        </button>
        <button type="button" onClick={onMoveDown} disabled={!onMoveDown} aria-label="Bajar" className="flex size-6 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-30 pointer-coarse:size-8">
          <ChevronDown className="size-3.5 pointer-coarse:size-4" />
        </button>
      </div>
    </div>
  )
}

export function WebAlertsReorderList() {
  const router = useRouter()
  const { isSubmitting, confirm } = useWebAlertReorderStore()

  const [items, setItems]                 = useState<WebAlert[]>([])
  const [originalItems, setOriginalItems] = useState<WebAlert[]>([])
  const [isLoading, setIsLoading]         = useState(true)
  const [isError, setIsError]             = useState(false)
  const [reloadKey, setReloadKey]         = useState(0)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  // Se piden todas las alertas (la API ya las manda en el orden actual)
  useEffect(() => {
    let cancelled = false
    webAlertsService.getList({ page: 1, per_page: 100 })
      .then((res) => {
        if (cancelled) return
        if (!res.success) { setIsError(true); return }
        const list = res.data.map(mapWebAlertFromApi)
        setItems(list)
        setOriginalItems(list)
      })
      .catch(() => { if (!cancelled) setIsError(true) })
      .finally(() => { if (!cancelled) setIsLoading(false) })
    return () => { cancelled = true }
  }, [reloadKey])

  // ¿Cambió algo respecto al orden original?
  const hasChanges = items.some((item, idx) => item.id !== originalItems[idx]?.id)

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return
    const oldIdx = items.findIndex((i) => i.id === active.id)
    const newIdx = items.findIndex((i) => i.id === over.id)
    setItems((prev) => arrayMove(prev, oldIdx, newIdx))
  }

  const moveItem = (idx: number, direction: -1 | 1) => {
    setItems((prev) => arrayMove(prev, idx, idx + direction))
  }

  const handleConfirm = async () => {
    const confirmed = await swalConfirm({
      title: '¿Confirmar nuevo orden?',
      text: `Se actualizará el orden de ${items.length} alerta(s) en la web.`,
      confirmText: 'Sí, confirmar',
      cancelText: 'Cancelar',
    })
    if (!confirmed) return

    const ok = await confirm(items.map((i) => i.id))
    if (ok) {
      toastSuccess('Orden guardado', 'Las alertas se mostrarán en este orden.')
      goBackOrFallback(router, '/web-alerts')
    } else {
      toastError('Error', useWebAlertReorderStore.getState().error ?? 'No se pudo guardar el orden.')
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center">
        <LoaderCircle className="mb-3 size-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Cargando alertas...</p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center gap-3">
        <p className="text-sm font-semibold">Error al cargar las alertas</p>
        <Button size="sm" variant="outline" onClick={() => { setIsLoading(true); setIsError(false); setReloadKey((k) => k + 1) }}>Reintentar</Button>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <Card>
        <CardContent className="pt-6 text-sm text-muted-foreground">
          <span className="flex items-center gap-2">
            <MousePointerClick className="size-4 shrink-0" />
            Arrastra para cambiar el orden: la primera queda más arriba en la web. Nada se guarda hasta que confirmes.
          </span>
        </CardContent>
      </Card>

      {items.length === 0 ? (
        <div className="flex min-h-[120px] items-center justify-center rounded-lg border text-sm text-muted-foreground">
          No hay alertas para ordenar.
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
                  onMoveUp={idx > 0 ? () => moveItem(idx, -1) : undefined}
                  onMoveDown={idx < items.length - 1 ? () => moveItem(idx, 1) : undefined}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <div className="flex items-center justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => goBackOrFallback(router, '/web-alerts')} disabled={isSubmitting}>Cancelar</Button>
        <Button type="button" disabled={!hasChanges || isSubmitting} onClick={handleConfirm} className="min-w-36">
          {isSubmitting ? <><LoaderCircle className="mr-2 size-4 animate-spin" />Guardando...</> : 'Confirmar orden'}
        </Button>
      </div>
    </div>
  )
}
