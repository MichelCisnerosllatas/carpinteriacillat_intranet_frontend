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
import { ChevronDown, ChevronUp, GripVertical, LayoutGrid, LoaderCircle, Navigation2 } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { Badge } from '@/shared/ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/shared/ui/collapsible'
import { cn } from '@/shared/lib/utils'
import { getStateOption } from '@/shared/config/entity-states'
import { swalConfirm } from '@/shared/lib/swal'
import { toastError, toastSuccess } from '@/shared/lib/toast'
import { sectionsService } from '../../services/sections.service'
import { useSectionReorderStore } from '../../stores/useSectionReorderStore'
import type { SectionReorderGroupDto } from '../../model/sectionreorder.dto'

type ReorderItem = {
  id: number
  name: string
  stateValue: number
}

type ReorderGroup = {
  idNavigation: number
  navigationName: string
  items: ReorderItem[]
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
      {/* Handle — antes 28px fijo; en touch, arrastrar con dnd-kit no es confiable
          (el gesto se confunde con el scroll de la página), así que se agranda un poco
          y se agrega touch-none para que el navegador no le dispute el gesto al drag */}
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
 * Un grupo = una navegación, con su propio `<DndContext>` — arrastrar dentro de un grupo
 * nunca puede mover una sección a otro grupo, así el orden (único por navegación) se
 * resecuencia siempre 1..N dentro de la navegación correcta.
 */
function ReorderGroupCard({ group, onChange }: { group: ReorderGroup; onChange: (items: ReorderItem[]) => void }) {
  const [open, setOpen] = useState(true)
  // PointerSensor cubre mouse; TouchSensor aparte con activación por demora (en vez de
  // distancia) para que intentar hacer scroll no dispare un arrastre por error en touch;
  // KeyboardSensor para reordenar con flechas sin necesidad de arrastrar.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIdx = group.items.findIndex((i) => i.id === active.id)
    const newIdx = group.items.findIndex((i) => i.id === over.id)
    onChange(arrayMove(group.items, oldIdx, newIdx))
  }

  // Alternativa al arrastre que siempre funciona, sin depender de dnd-kit ni del handle.
  const moveItem = (id: number, direction: -1 | 1) => {
    const idx = group.items.findIndex((i) => i.id === id)
    const newIdx = idx + direction
    if (idx < 0 || newIdx < 0 || newIdx >= group.items.length) return
    onChange(arrayMove(group.items, idx, newIdx))
  }

  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger asChild>
          <button type="button" className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-muted/40">
            <Navigation2 className="size-4 shrink-0 text-muted-foreground" />
            <span className="text-sm font-medium">{group.navigationName}</span>
            <Badge variant="secondary" className="ml-auto shrink-0 text-xs font-normal">
              {group.items.length} sección{group.items.length === 1 ? '' : 'es'}
            </Badge>
            <ChevronDown className={cn('size-4 shrink-0 text-muted-foreground transition-transform', open && 'rotate-180')} />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="border-t px-3 py-3">
          {group.items.length === 0 ? (
            <div className="flex min-h-[80px] items-center justify-center text-sm text-muted-foreground">
              Sin secciones en esta navegación.
            </div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={group.items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
                <div className="flex flex-col gap-2">
                  {group.items.map((item, idx) => (
                    <SortableRow
                      key={item.id}
                      item={item}
                      onMoveUp={idx > 0 ? () => moveItem(item.id, -1) : undefined}
                      onMoveDown={idx < group.items.length - 1 ? () => moveItem(item.id, 1) : undefined}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}

export function SectionsReorderList() {
  const router = useRouter()
  const { isSubmitting, confirm } = useSectionReorderStore()

  const [groups, setGroups]         = useState<ReorderGroup[]>([])
  const [originalGroups, setOriginalGroups] = useState<ReorderGroup[]>([])
  const [isLoading, setIsLoading]   = useState(true)
  const [isError, setIsError]       = useState(false)

  useEffect(() => {
    let cancelled = false
    sectionsService.getList({ per_page: 100, page: 1 })
      .then((res) => {
        if (cancelled) return
        if (!res.success) { setIsError(true); return }

        const byNavigation = new Map<number, { idNavigation: number; navigationName: string; items: (ReorderItem & { order: number })[] }>()
        for (const s of res.data) {
          const navId = s.navigation?.id_navigation
          if (navId == null) continue // secciones sin navegación no se pueden reordenar por grupo
          if (!byNavigation.has(navId)) {
            byNavigation.set(navId, { idNavigation: navId, navigationName: s.navigation!.navigation_name, items: [] })
          }
          byNavigation.get(navId)!.items.push({
            id: s.id_section, name: s.section_name, stateValue: s.section_state, order: s.section_order ?? 0,
          })
        }
        const built: ReorderGroup[] = Array.from(byNavigation.values())
          .map((g) => ({
            idNavigation: g.idNavigation,
            navigationName: g.navigationName,
            items: [...g.items].sort((a, b) => a.order - b.order).map(({ order: _order, ...item }) => item),
          }))
          .sort((a, b) => a.navigationName.localeCompare(b.navigationName))

        setGroups(built)
        setOriginalGroups(built.map((g) => ({ ...g, items: [...g.items] })))
      })
      .catch(() => { if (!cancelled) setIsError(true) })
      .finally(() => { if (!cancelled) setIsLoading(false) })
    return () => { cancelled = true }
  }, [])

  const hasChanges = groups.some((g, gi) => {
    const original = originalGroups[gi]
    if (!original) return true
    return g.items.some((item, idx) => item.id !== original.items[idx]?.id)
  })

  const handleGroupChange = (idNavigation: number, items: ReorderItem[]) => {
    setGroups((prev) => prev.map((g) => (g.idNavigation === idNavigation ? { ...g, items } : g)))
  }

  const handleConfirm = async () => {
    const totalSections = groups.reduce((acc, g) => acc + g.items.length, 0)
    const confirmed = await swalConfirm({
      title: '¿Confirmar nuevo orden?',
      text: `Se actualizará el orden de ${totalSections} sección(es) en ${groups.length} navegación(es).`,
      confirmText: 'Sí, confirmar',
      cancelText: 'Cancelar',
    })
    if (!confirmed) return

    // Solo se envían los grupos cuyo orden realmente cambió.
    const changedGroups: SectionReorderGroupDto[] = groups
      .filter((g, gi) => {
        const original = originalGroups[gi]
        return !original || g.items.some((item, idx) => item.id !== original.items[idx]?.id)
      })
      .map((g) => ({ id_navigation: g.idNavigation, ids: g.items.map((i) => i.id) }))

    const ok = await confirm(changedGroups)
    if (ok) {
      toastSuccess('Orden actualizado', 'El nuevo orden se guardó correctamente.')
      router.push('/sections')
    } else {
      toastError('Error', 'No se pudo actualizar el orden.')
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center">
        <LoaderCircle className="mb-3 size-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Cargando secciones...</p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center gap-3">
        <p className="text-sm font-semibold">Error al cargar secciones</p>
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
            Arrastra dentro de cada navegación para cambiar su orden. Nada se guarda hasta que confirmes.
          </div>
        </CardContent>
      </Card>

      {groups.length === 0 ? (
        <div className="flex min-h-[120px] items-center justify-center rounded-lg border text-sm text-muted-foreground">
          No hay secciones para reordenar.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {groups.map((g) => (
            <ReorderGroupCard key={g.idNavigation} group={g} onChange={(items) => handleGroupChange(g.idNavigation, items)} />
          ))}
        </div>
      )}

      <div className="flex items-center justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.push('/sections')} disabled={isSubmitting}>
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
