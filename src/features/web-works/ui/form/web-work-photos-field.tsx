'use client'

// Lista de fotos de galería del trabajo: agregar del banco, arrastrar para ordenar,
// pie de foto, visible/oculta, usar como portada y quitar.
// El arreglo vive en el formulario padre (useFieldArray de `images`); este componente solo lo
// muestra y lo modifica con los métodos que recibe. El orden del arreglo = orden en la web.

import {
  DndContext, closestCenter, PointerSensor, TouchSensor, KeyboardSensor,
  useSensor, useSensors, type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable'
import { type UseFieldArrayReturn } from 'react-hook-form'
import { ImageOff } from 'lucide-react'
import { toastInfo } from '@/shared/lib/toast'
import { getImageUrl, getImageDisplayName } from '@/features/images/lib/image-url'
import type { ImageApiItem } from '@/features/images/model/imageget.dto'
import { BankImagePicker } from './bank-image-picker'
import type { WebWorkFormValues } from './web-work-form.schema'
import { SortablePhotoCard } from './sortable-photo-card'

type PhotosArray = UseFieldArrayReturn<WebWorkFormValues, 'images', 'key'>

interface WebWorkPhotosFieldProps {
  photos: PhotosArray
  /** id_image de la portada actual (para marcar la foto que lo es). */
  coverId: number | null
  onUseAsCover: (photo: { id_image: number }) => void
  disabled?: boolean
}

export function WebWorkPhotosField({ photos, coverId, onUseAsCover, disabled }: WebWorkPhotosFieldProps) {
  const { fields, append, move, remove } = photos

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const handlePick = (item: ImageApiItem) => {
    if (fields.some((f) => f.id_image === item.id_image)) {
      toastInfo('Ya está en la lista', 'Esa foto ya es parte de la galería del trabajo.')
      return
    }
    append({
      id_web_work_image: null,
      id_image: item.id_image,
      url: getImageUrl(item.image_patch),
      name: getImageDisplayName(item),
      webworkimage_caption: '',
      visible: true,
    })
  }

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return
    const from = fields.findIndex((f) => f.key === active.id)
    const to = fields.findIndex((f) => f.key === over.id)
    if (from >= 0 && to >= 0) move(from, to)
  }

  return (
    <div className="flex flex-col gap-3">
      <BankImagePicker onPick={handlePick} disabled={disabled} />

      {fields.length === 0 ? (
        <div className="flex min-h-[90px] flex-col items-center justify-center gap-1 rounded-md border border-dashed text-center text-xs text-muted-foreground">
          <ImageOff className="size-5" />
          Todavía no hay fotos. Agrégalas desde el banco de imágenes.
        </div>
      ) : (
        <>
          <p className="text-xs text-muted-foreground">Arrastra las fotos para cambiar el orden en que se muestran.</p>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={fields.map((f) => f.key)} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3">
                {fields.map((field, index) => (
                  <SortablePhotoCard
                    key={field.key}
                    sortableId={field.key}
                    index={index}
                    isCover={coverId != null && coverId === field.id_image}
                    onUseAsCover={() => onUseAsCover({ id_image: field.id_image })}
                    onRemove={() => remove(index)}
                    disabled={disabled}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </>
      )}
    </div>
  )
}
