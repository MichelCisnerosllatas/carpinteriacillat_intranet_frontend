'use client'

// Pares Antes/Después (SOLO restauraciones). Cada par = dos bloques lado a lado (Antes | Después)
// con su foto del banco, más pie de foto y visible/oculto del par. Se arrastran para ordenar.
// El arreglo vive en el formulario padre (useFieldArray de `pairs`).

import {
  DndContext, closestCenter, PointerSensor, TouchSensor, KeyboardSensor,
  useSensor, useSensors, type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { type UseFieldArrayReturn } from 'react-hook-form'
import { Plus, SplitSquareHorizontal } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { emptyPair, type WebWorkFormValues } from '../web-work-form.schema'
import { SortablePairCard } from './sortable-pair-card'

type PairsArray = UseFieldArrayReturn<WebWorkFormValues, 'pairs', 'key'>

interface WebWorkPairsFieldProps {
  pairs: PairsArray
  disabled?: boolean
}

export function WebWorkPairsField({ pairs, disabled }: WebWorkPairsFieldProps) {
  const { fields, append, move, remove } = pairs

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return
    const from = fields.findIndex((f) => f.key === active.id)
    const to = fields.findIndex((f) => f.key === over.id)
    if (from >= 0 && to >= 0) move(from, to)
  }

  return (
    <div className="flex flex-col gap-3">
      {fields.length === 0 ? (
        <div className="flex min-h-[90px] flex-col items-center justify-center gap-1 rounded-md border border-dashed text-center text-xs text-muted-foreground">
          <SplitSquareHorizontal className="size-5" />
          Sin pares todavía. Sin al menos un par visible, el trabajo no aparece en el comparador «Restauración».
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={fields.map((f) => f.key)} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col gap-3">
              {fields.map((field, index) => (
                <SortablePairCard key={field.key} sortableId={field.key} index={index} onRemove={() => remove(index)} disabled={disabled} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <Button type="button" variant="outline" size="sm" className="w-fit" onClick={() => append(emptyPair())} disabled={disabled}>
        <Plus className="mr-1 size-4" />Agregar par
      </Button>
    </div>
  )
}
