'use client'

// Pares Antes/Después (SOLO restauraciones). Cada par = dos bloques lado a lado (Antes | Después)
// con su foto del banco, más pie de foto y visible/oculto del par. Se arrastran para ordenar.
// El arreglo vive en el formulario padre (useFieldArray de `pairs`).

import { useState } from 'react'
import {
  DndContext, closestCenter, PointerSensor, TouchSensor, KeyboardSensor,
  useSensor, useSensors, type DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Controller, useFormContext, type UseFieldArrayReturn } from 'react-hook-form'
import { GripVertical, ImageOff, Plus, SplitSquareHorizontal, Trash2 } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { VisibilityToggle } from '@/shared/ui/visibility-toggle'
import { ImageSelect } from '@/features/images/ui/image-select'
import { ImageQuickUploadDialog } from '@/features/images/ui/image-quick-upload-dialog'
import { getImageUrl, getImageDisplayName } from '@/features/images/lib/image-url'
import type { ImageApiItem } from '@/features/images/model/imageget.dto'
import { emptyPair, type WebWorkFormValues } from './web-work-form.schema'

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

interface SortablePairCardProps {
  sortableId: string
  index: number
  onRemove: () => void
  disabled?: boolean
}

function SortablePairCard({ sortableId, index, onRemove, disabled }: SortablePairCardProps) {
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

interface PairSlotProps {
  index: number
  side: 'before' | 'after'
  label: string
  error?: string
  disabled?: boolean
}

/** Un bloque del par ("Antes" o "Después"): foto en grande + selector del banco + subir nueva. */
function PairSlot({ index, side, label, error, disabled }: PairSlotProps) {
  const { watch, setValue, clearErrors } = useFormContext<WebWorkFormValues>()
  const [showUpload, setShowUpload] = useState(false)
  const idField = side === 'before' ? (`pairs.${index}.id_image_before` as const) : (`pairs.${index}.id_image_after` as const)
  const urlField = side === 'before' ? (`pairs.${index}.before_url` as const) : (`pairs.${index}.after_url` as const)
  const nameField = side === 'before' ? (`pairs.${index}.before_name` as const) : (`pairs.${index}.after_name` as const)

  const idImage = watch(idField)
  const url = watch(urlField)
  const name = watch(nameField)

  const setImage = (item: ImageApiItem) => {
    setValue(idField, item.id_image, { shouldDirty: true })
    setValue(urlField, getImageUrl(item.image_patch), { shouldDirty: true })
    setValue(nameField, getImageDisplayName(item), { shouldDirty: true })
    clearErrors(idField)
  }

  const clearImage = () => {
    setValue(idField, null, { shouldDirty: true })
    setValue(urlField, null, { shouldDirty: true })
    setValue(nameField, '', { shouldDirty: true })
  }

  return (
    <div className={cn('flex flex-col gap-2 rounded-md border p-2', error && 'border-destructive/60')}>
      <div className="relative aspect-[4/3] overflow-hidden rounded bg-muted/50">
        {idImage != null && url ? (
          <img src={url} alt={name || label} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-1 text-muted-foreground">
            <ImageOff className="size-5" />
            <span className="text-xs">{idImage != null ? `Imagen #${idImage}` : `Elige la foto «${label}»`}</span>
          </div>
        )}
        <span className="pointer-events-none absolute bottom-1 left-1 rounded bg-black/70 px-1.5 text-[11px] font-medium text-white">{label}</span>
      </div>
      <ImageSelect
        value={idImage}
        onValueChange={(id) => { if (id == null) clearImage() }}
        // Solo se usa la imagen resuelta (con url) para setear; el null inicial del montaje se ignora
        onSelectedChange={(item) => { if (item && item.id_image !== idImage) setImage(item) }}
        placeholder={`Foto «${label}»`}
        disabled={disabled}
      />
      <button
        type="button"
        onClick={() => setShowUpload(true)}
        disabled={disabled}
        className="flex w-fit items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        <Plus className="size-3.5" />Subir imagen nueva
      </button>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <ImageQuickUploadDialog open={showUpload} onOpenChange={setShowUpload} onUploaded={setImage} />
    </div>
  )
}
