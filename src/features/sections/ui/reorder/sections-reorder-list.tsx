'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, LayoutGrid, LoaderCircle, Navigation2 } from 'lucide-react'
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

function SortableRow({ item }: { item: ReorderItem }) {
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
      <div
        {...attributes}
        {...listeners}
        className="flex size-7 shrink-0 cursor-grab items-center justify-center rounded text-muted-foreground hover:bg-muted active:cursor-grabbing"
      >
        <GripVertical className="size-4" />
      </div>
      <span className="min-w-0 flex-1 truncate text-sm font-medium">{item.name}</span>
      <Badge variant="outline" className={cn('text-xs', stateOpt.badge)}>{stateOpt.label}</Badge>
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
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIdx = group.items.findIndex((i) => i.id === active.id)
    const newIdx = group.items.findIndex((i) => i.id === over.id)
    onChange(arrayMove(group.items, oldIdx, newIdx))
  }

  return (
    <Card>
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger asChild>
          <button type="button" className="flex w-full items-center gap-3 px-4 py-3 text-left">
            <Navigation2 className="size-4 shrink-0 text-muted-foreground" />
            <span className="font-medium">{group.navigationName}</span>
            <Badge variant="secondary" className="ml-auto shrink-0 text-xs font-normal">
              {group.items.length} sección{group.items.length === 1 ? '' : 'es'}
            </Badge>
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="flex flex-col gap-2 pt-0">
            {group.items.length === 0 ? (
              <div className="flex min-h-[80px] items-center justify-center text-sm text-muted-foreground">
                Sin secciones en esta navegación.
              </div>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={group.items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
                  <div className="flex flex-col gap-2">
                    {group.items.map((item) => <SortableRow key={item.id} item={item} />)}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
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
