'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Controller, useFormContext } from 'react-hook-form'
import { GripVertical, Trash2 } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { VisibilityToggle } from '@/shared/ui/visibility-toggle'
import { type WebWorkFormValues } from '../web-work-form.schema'
import { PairSlot } from './pair-slot'

interface SortablePairCardProps {
  sortableId: string
  index: number
  onRemove: () => void
  disabled?: boolean
}

export function SortablePairCard({ sortableId, index, onRemove, disabled }: SortablePairCardProps) {
  const { control, register, watch, formState: { errors } } = useFormContext<WebWorkFormValues>()
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: sortableId })
  const visible = watch(`pairs.${index}.visible`)
  const pairErrors = errors.pairs?.[index]

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn('flex flex-col gap-3 rounded-lg border bg-card p-3 shadow-sm', isDragging && 'z-50 opacity-75 shadow-md', !visible && 'opacity-80')}
    >
      <div className="flex items-center gap-2">
        <div
          {...attributes}
          {...listeners}
          title="Arrastra para ordenar"
          className="flex size-7 shrink-0 cursor-grab touch-none items-center justify-center rounded text-muted-foreground hover:bg-muted active:cursor-grabbing"
        >
          <GripVertical className="size-4" />
        </div>
        <span className="flex-1 text-sm font-semibold">Par {index + 1}</span>
        <Controller
          control={control}
          name={`pairs.${index}.visible`}
          render={({ field }) => <VisibilityToggle checked={field.value} onCheckedChange={field.onChange} disabled={disabled} />}
        />
        <Button type="button" size="icon" variant="ghost" className="size-8 text-destructive" onClick={onRemove} disabled={disabled} title="Quitar par" aria-label={`Quitar par ${index + 1}`}>
          <Trash2 className="size-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <PairSlot index={index} side="before" label="Antes" error={pairErrors?.id_image_before?.message} disabled={disabled} />
        <PairSlot index={index} side="after" label="Después" error={pairErrors?.id_image_after?.message} disabled={disabled} />
      </div>

      <div className="flex flex-col gap-1">
        <Input placeholder="Pie de foto del par (opcional). Ej: Frente" maxLength={150} className="h-8 text-sm" disabled={disabled} {...register(`pairs.${index}.webworkpair_caption`)} />
        {pairErrors?.webworkpair_caption?.message && <p className="text-xs text-destructive">{pairErrors.webworkpair_caption.message}</p>}
      </div>
    </div>
  )
}
