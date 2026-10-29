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
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, arrayMove, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ChevronDown, ChevronUp, GripVertical, ImageOff, LoaderCircle, MousePointerClick } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { Badge } from '@/shared/ui/badge'
import { cn } from '@/shared/lib/utils'
import { swalConfirm } from '@/shared/lib/swal'
import { toastError, toastSuccess } from '@/shared/lib/toast'
import { goBackOrFallback } from '@/shared/lib/navigation-history'
import { webWorksService } from '../../services/web-works.service'
import { useWebWorkReorderStore } from '../../stores/useWebWorkReorderStore'
import { getTypeWorkBadge, getWebWorkStateOption } from '../../data/data'

type ReorderItem = {
  id: number
  title: string
  coverUrl: string | null
  typeKey: string
  typeName: string
  stateValue: number
}

function SortableRow({ item, position, onMoveUp, onMoveDown }: {
  item: ReorderItem
  position: number
  onMoveUp?: () => void
  onMoveDown?: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id })
  const stateOpt = getWebWorkStateOption(item.stateValue)

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn('flex items-center gap-3 rounded-lg border bg-card px-3 py-2 shadow-sm', isDragging && 'z-50 opacity-75 shadow-md')}
    >
      <div
        {...attributes}
        {...listeners}
        className="flex size-7 shrink-0 cursor-grab touch-none items-center justify-center rounded text-muted-foreground hover:bg-muted active:cursor-grabbing pointer-coarse:size-9"
      >
        <GripVertical className="size-4 pointer-coarse:size-5" />
      </div>
      <span className="w-6 shrink-0 text-center text-xs tabular-nums text-muted-foreground">{position}</span>
      <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded border bg-muted">
        {item.coverUrl ? <img src={item.coverUrl} alt={item.title} className="h-full w-full object-cover" /> : <ImageOff className="size-4 text-muted-foreground" />}
      </div>
      <span className="min-w-0 flex-1 truncate text-sm font-medium">{item.title}</span>
      <Badge variant="outline" className={cn('hidden text-xs sm:inline-flex', getTypeWorkBadge(item.typeKey))}>{item.typeName}</Badge>
      <Badge variant="outline" className={cn('text-xs', stateOpt.badge)}>{stateOpt.label}</Badge>
      <div className="flex shrink-0 flex-col gap-0.5">
        <button type="button" onClick={onMoveUp} disabled={!onMoveUp} className="flex size-6 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-30 pointer-coarse:size-8">
          <ChevronUp className="size-3.5 pointer-coarse:size-4" />
        </button>
        <button type="button" onClick={onMoveDown} disabled={!onMoveDown} className="flex size-6 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-30 pointer-coarse:size-8">
          <ChevronDown className="size-3.5 pointer-coarse:size-4" />
        </button>
      </div>
    </div>
  )
}

export function WebWorksReorderList({ typeKey }: { typeKey?: string }) {
  const router = useRouter()
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
