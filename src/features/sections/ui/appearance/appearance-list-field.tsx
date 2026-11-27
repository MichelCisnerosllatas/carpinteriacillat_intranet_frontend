'use client'

// Campo `list` del editor "Apariencia" (ej. filas de la ficha técnica): cada fila se puede
// arrastrar para cambiar el orden, renombrar (vacío = nombre original) y mostrar/ocultar.

import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, TouchSensor,
  useSensor, useSensors, type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import type { SectionDisplayListItem } from '../../model/sectionget.dto'
import { resolveFieldValue, type ListField } from './appearance-values'
import { SortableRow } from './sortable-row'

type Props = {
  field: ListField
  value: unknown
  disabled: boolean
  onChange: (value: SectionDisplayListItem[]) => void
}

export function AppearanceListField({ field, value, disabled, onChange }: Props) {
  // El valor del borrador puede venir incompleto (o vacío): siempre se trabaja con la lista resuelta.
  // Para los nombres se usa lo escrito tal cual (vacío = mostrar el placeholder con el original).
  const rows = (Array.isArray(value) ? value : []) as SectionDisplayListItem[]
  const resolved = resolveFieldValue(field, value) as SectionDisplayListItem[]
  const items = resolved.map((item) => ({ ...item, label: rows.find((r) => r.key === item.key)?.label ?? item.label }))
  const defaults = new Map(field.items.map((i) => [i.key, i.label]))

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const update = (index: number, patch: Partial<SectionDisplayListItem>) =>
    onChange(items.map((item, i) => (i === index ? { ...item, ...patch } : item)))
  const move = (from: number, to: number) => onChange(arrayMove(items, from, to))

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return
    const from = items.findIndex((i) => i.key === active.id)
    const to = items.findIndex((i) => i.key === over.id)
    if (from !== -1 && to !== -1) move(from, to)
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map((i) => i.key)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-1.5">
          {items.map((item, index) => (
            <SortableRow
              key={item.key}
              item={item}
              defaultLabel={defaults.get(item.key) ?? item.key}
              labelMax={field.label_max}
              disabled={disabled}
              onLabel={(label) => update(index, { label })}
              onVisible={(visible) => update(index, { visible })}
              onMoveUp={index > 0 ? () => move(index, index - 1) : undefined}
              onMoveDown={index < items.length - 1 ? () => move(index, index + 1) : undefined}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
