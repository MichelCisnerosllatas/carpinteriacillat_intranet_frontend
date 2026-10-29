'use client'

// Campo `list` del editor "Apariencia" (ej. filas de la ficha técnica): cada fila se puede
// arrastrar para cambiar el orden, renombrar (vacío = nombre original) y mostrar/ocultar.

import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, TouchSensor,
  useSensor, useSensors, type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ChevronDown, ChevronUp, GripVertical } from 'lucide-react'
import { Input } from '@/shared/ui/input'
import { Switch } from '@/shared/ui/switch'
import { cn } from '@/shared/lib/utils'
import type { SectionDisplayListItem } from '../../model/sectionget.dto'
import { resolveFieldValue, type ListField } from './appearance-values'

type Props = {
  field: ListField
  value: unknown
  disabled: boolean
  onChange: (value: SectionDisplayListItem[]) => void
}

function SortableRow({
  item, defaultLabel, labelMax, disabled, onLabel, onVisible, onMoveUp, onMoveDown,
}: {
  item: SectionDisplayListItem
  defaultLabel: string
  labelMax?: number
  disabled: boolean
  onLabel: (label: string) => void
  onVisible: (visible: boolean) => void
  onMoveUp?: () => void
  onMoveDown?: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.key, disabled })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        'flex items-center gap-2 rounded-md border bg-card px-2 py-1.5',
        isDragging && 'z-50 opacity-75 shadow-md',
        !item.visible && 'bg-muted/40',
      )}
    >
      {/* Handle — touch-none para que el navegador no le dispute el gesto al arrastre */}
      <div
        {...attributes}
        {...listeners}
        aria-label={`Arrastrar «${item.label}»`}
        className="flex size-7 shrink-0 cursor-grab touch-none items-center justify-center rounded text-muted-foreground hover:bg-muted active:cursor-grabbing pointer-coarse:size-9"
      >
        <GripVertical className="size-4" />
      </div>
      <Input
        value={item.label}
        placeholder={defaultLabel}
        maxLength={labelMax}
        disabled={disabled}
        aria-label={`Nombre de la fila «${defaultLabel}»`}
        onChange={(e) => onLabel(e.target.value)}
        className={cn('h-8 min-w-0 flex-1', !item.visible && 'text-muted-foreground line-through')}
      />
      {/* Subir/bajar — alternativa fija al arrastre (mouse, touch o teclado) */}
      <div className="flex shrink-0 flex-col">
        <button
          type="button" onClick={onMoveUp} disabled={!onMoveUp || disabled} aria-label="Subir"
          className="flex size-4 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30 pointer-coarse:size-6"
        >
          <ChevronUp className="size-3.5" />
        </button>
        <button
          type="button" onClick={onMoveDown} disabled={!onMoveDown || disabled} aria-label="Bajar"
          className="flex size-4 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30 pointer-coarse:size-6"
        >
          <ChevronDown className="size-3.5" />
        </button>
      </div>
      <Switch
        checked={item.visible}
        onCheckedChange={onVisible}
        disabled={disabled}
        aria-label={item.visible ? `Ocultar «${defaultLabel}»` : `Mostrar «${defaultLabel}»`}
      />
    </div>
  )
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
