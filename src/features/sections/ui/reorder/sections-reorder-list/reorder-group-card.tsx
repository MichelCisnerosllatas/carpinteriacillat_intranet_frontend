'use client'

import { useState } from 'react'
import {
  DndContext,
  closestCenter,
  MouseSensor,
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
import { ChevronDown, Navigation2 } from 'lucide-react'
import { Badge } from '@/shared/ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/shared/ui/collapsible'
import { cn } from '@/shared/lib/utils'
import type { ReorderGroup, ReorderItem } from './types'
import { SortableRow } from './sortable-row'

/**
 * Un grupo = una navegación, con su propio `<DndContext>` — arrastrar dentro de un grupo
 * nunca puede mover una sección a otro grupo, así el orden (único por navegación) se
 * resecuencia siempre 1..N dentro de la navegación correcta.
 */
export function ReorderGroupCard({ group, onChange }: { group: ReorderGroup; onChange: (items: ReorderItem[]) => void }) {
  const [open, setOpen] = useState(true)
  // Sensores del arrastre:
  // - MouseSensor (no PointerSensor): el PointerSensor también toma el dedo y bloquea el scroll en celular.
  // - TouchSensor: hay que mantener presionado el asa ~¼ s; si el dedo se desliza antes, es scroll normal.
  // - KeyboardSensor: reordenar con teclado (Espacio + flechas).
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 8 } }),
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
