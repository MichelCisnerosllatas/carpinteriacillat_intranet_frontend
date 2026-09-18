'use client'

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
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ChevronDown, ChevronUp, GripVertical, LoaderCircle, Quote } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { Badge } from '@/shared/ui/badge'
import { cn } from '@/shared/lib/utils'
import { getStateOption } from '@/shared/config/entity-states'
import { swalConfirm } from '@/shared/lib/swal'
import { toastError, toastSuccess } from '@/shared/lib/toast'
import { goBackOrFallback } from '@/shared/lib/navigation-history'
import { testimonyService } from '../../services/testimony.service'
import { useTestimonyReorderStore } from '../../stores/useTestimonyReorderStore'
import { useTestimonySectionStore } from '../../stores/useTestimonySectionStore'

type ReorderItem = {
  id: number
  name: string
  stateValue: number
}

function SortableRow({
  item, onMoveUp, onMoveDown,
}: {
  item: ReorderItem
  onMoveUp?:   () => void
  onMoveDown?: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id })
  const stateOpt = getStateOption(item.stateValue)

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        'flex items-center gap-3 rounded-lg border bg-card px-3 py-2.5 shadow-sm',
        isDragging && 'z-50 opacity-75 shadow-md'
      )}
    >
      {/* Handle — en touch, arrastrar con dnd-kit no es confiable (el gesto se confunde con
          el scroll de la página), así que se agranda un poco y se agrega touch-none para
          que el navegador no le dispute el gesto al drag */}
      <div
        {...attributes}
        {...listeners}
        className="flex size-7 shrink-0 cursor-grab touch-none items-center justify-center rounded text-muted-foreground hover:bg-muted active:cursor-grabbing pointer-coarse:size-9"
      >
        <GripVertical className="size-4 pointer-coarse:size-5" />
      </div>
      <span className="min-w-0 flex-1 truncate text-sm font-medium">{item.name}</span>
      <Badge variant="outline" className={cn('text-xs', stateOpt.badge)}>{stateOpt.label}</Badge>

      {/* Subir/bajar — alternativa fija al arrastre, siempre funciona (mouse, touch o
          teclado) sin depender de acertar ni sostener el handle */}
      <div className="flex shrink-0 flex-col gap-0.5">
        <button
          type="button"
          onClick={onMoveUp}
          disabled={!onMoveUp}
          className="flex size-6 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-30 pointer-coarse:size-8"
        >
          <ChevronUp className="size-3.5 pointer-coarse:size-4" />
        </button>
        <button
          type="button"
          onClick={onMoveDown}
          disabled={!onMoveDown}
          className="flex size-6 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-30 pointer-coarse:size-8"
        >
          <ChevronDown className="size-3.5 pointer-coarse:size-4" />
        </button>
      </div>
    </div>
  )
}

/**
 * En la práctica existe una única sección de testimonios en todo el sitio (`useTestimonySectionStore`
 * la resuelve por su tipo, sin que el usuario tenga que elegirla) — así que esta pantalla es una
 * lista plana con un único `<DndContext>`, sin nivel de agrupación ni selector de sección.
 */
export function TestimonyReorderList() {
  const router = useRouter()
  const { isSubmitting, confirm } = useTestimonyReorderStore()
  const { idSection, isError: isSectionError, error: sectionError, get: getSection } = useTestimonySectionStore()

  const [items, setItems]                 = useState<ReorderItem[]>([])
  const [originalItems, setOriginalItems] = useState<ReorderItem[]>([])
  const [isLoading, setIsLoading]         = useState(true)
  const [isError, setIsError]             = useState(false)

  // PointerSensor cubre mouse; TouchSensor aparte con activación por demora (en vez de
  // distancia) para que intentar hacer scroll no dispare un arrastre por error en touch;
  // KeyboardSensor para reordenar con flechas sin necesidad de arrastrar.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  useEffect(() => { void getSection() }, [])

  useEffect(() => {
    if (idSection === null) return
    let cancelled = false
    testimonyService.getList({ id_section: idSection, per_page: 100, page: 1 })
      .then((res) => {
        if (cancelled) return
        if (!res.success) { setIsError(true); return }

        const built: ReorderItem[] = [...res.data]
          .sort((a, b) => (a.testimony_order ?? 0) - (b.testimony_order ?? 0))
          .map((t) => ({ id: t.id_testimony_web, name: t.testimony_name, stateValue: t.testimony_state }))

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
      text: `Se actualizará el orden de ${items.length} testimonio(s).`,
      confirmText: 'Sí, confirmar',
      cancelText: 'Cancelar',
    })
    if (!confirmed || idSection === null) return

    const ok = await confirm(idSection, items.map((i) => i.id))
    if (ok) {
      toastSuccess('Orden actualizado', 'El nuevo orden se guardó correctamente.')
      goBackOrFallback(router, '/testimony')
    } else {
      toastError('Error', 'No se pudo actualizar el orden.')
    }
  }

  if (isSectionError) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center gap-3">
        <p className="text-sm font-semibold">{sectionError}</p>
        <Button size="sm" variant="outline" onClick={() => router.refresh()}>Reintentar</Button>
      </div>
    )
  }

  if (isLoading || idSection === null) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center">
        <LoaderCircle className="mb-3 size-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Cargando testimonios de sección...</p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center gap-3">
        <p className="text-sm font-semibold">Error al cargar testimonios de sección</p>
        <Button size="sm" variant="outline" onClick={() => router.refresh()}>Reintentar</Button>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <Card>
        <CardContent className="flex flex-col gap-3 pt-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Quote className="size-4" />
            Arrastra para cambiar el orden de los testimonios. Nada se guarda hasta que confirmes.
          </div>
        </CardContent>
      </Card>

      {items.length === 0 ? (
        <div className="flex min-h-[120px] items-center justify-center rounded-lg border text-sm text-muted-foreground">
          No hay testimonios para reordenar en esta sección.
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
        <Button type="button" variant="outline" onClick={() => goBackOrFallback(router, '/testimony')} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="button" disabled={!hasChanges || isSubmitting} onClick={handleConfirm} className="min-w-36">
          {isSubmitting
            ? <><LoaderCircle className="mr-2 size-4 animate-spin" />Guardando...</>
            : 'Confirmar orden'}
        </Button>
      </div>
    </div>
  )
}
