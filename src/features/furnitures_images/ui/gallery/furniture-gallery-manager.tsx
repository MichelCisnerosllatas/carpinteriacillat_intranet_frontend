'use client'

import { useEffect, useState } from 'react'
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
  rectSortingStrategy,
  arrayMove,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import Lightbox from 'yet-another-react-lightbox'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails'
import 'yet-another-react-lightbox/styles.css'
import 'yet-another-react-lightbox/plugins/thumbnails.css'
import { GripVertical, Images, ImagePlus, Upload } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import { cn } from '@/shared/lib/utils'
import { FurnitureGalleryItem } from './furniture-gallery-item'
import { FurnitureGalleryAddPicker, type PickedImage } from './furniture-gallery-add-picker'
import { FurnitureGalleryUpload } from './furniture-gallery-upload'
import { FurnitureGalleryWebFields } from './furniture-gallery-web-fields'
import { FurnitureGalleryBadges } from './furniture-gallery-badges'
import type { FurnitureImageVariant } from '../../data/data'

export type GalleryEntry = {
  localKey: string
  furnitureImageId?: number
  imageId: number
  imageUrl: string | null
  imageName: string | null
  // Datos web de la foto (galería del sitio): pie de foto y antes/después.
  caption: string
  variant: FurnitureImageVariant | null
}

export type PendingGalleryItem  = { imageId: number; order: number; caption: string; variant: FurnitureImageVariant | null }
export type ReorderedGalleryItem = { furnitureImageId: number; order: number }
/** Foto ya guardada a la que se le cambió el pie de foto o la variante. */
export type WebChangedGalleryItem = { furnitureImageId: number; caption: string; variant: FurnitureImageVariant | null }

interface FurnitureGalleryManagerProps {
  initialGallery?: GalleryEntry[]
  onPendingItemsChange:   (items: PendingGalleryItem[])   => void
  onRemovedIdsChange:     (furnitureImageIds: number[])   => void
  onReorderedItemsChange: (items: ReorderedGalleryItem[]) => void
  onWebChangedItemsChange?: (items: WebChangedGalleryItem[]) => void
  /** Avisa qué imagen quedó en la posición 1: esa es la portada del mueble (`id_image`). `null` = galería vacía. */
  onCoverChange?: (imageId: number | null) => void
  disabled?: boolean
}

let keyCounter = 0
const nextKey = () => `k-${++keyCounter}`

// ── Sortable wrapper ────────────────────────────────────────────────
function SortableItem({
  entry,
  position,
  isCover,
  disabled,
  onRemove,
  onClick,
  onMoveBack,
  onMoveForward,
  onWebChange,
}: {
  entry: GalleryEntry
  position: number
  isCover: boolean
  disabled: boolean
  onRemove: () => void
  onClick: () => void
  onMoveBack?: () => void
  onMoveForward?: () => void
  onWebChange: (patch: Partial<Pick<GalleryEntry, 'caption' | 'variant'>>) => void
}) {
  const {
    attributes, listeners, setNodeRef,
    transform, transition, isDragging,
  } = useSortable({ id: entry.localKey, disabled })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn('group/item relative', isDragging && 'z-50 opacity-75')}
    >
      {/* Drag handle — en touch siempre visible y con más área de toque (antes 20px,
          oculto detrás de :hover: en touch no había forma de verlo ni de acertarlo) */}
      {!disabled && (
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              {...attributes}
              {...listeners}
              className="absolute left-1 top-1 z-10 flex size-5 cursor-grab touch-none items-center justify-center rounded bg-black/40 text-white opacity-0 backdrop-blur-sm transition-opacity duration-150 group-hover/item:opacity-100 active:cursor-grabbing pointer-coarse:size-8 pointer-coarse:opacity-100"
            >
              <GripVertical className="size-3 pointer-coarse:size-4" />
            </div>
          </TooltipTrigger>
          <TooltipContent>Mantén presionado para reordenar</TooltipContent>
        </Tooltip>
      )}
      <FurnitureGalleryItem
        imageUrl={entry.imageUrl}
        imageName={entry.imageName}
        isPending={!entry.furnitureImageId}
        disabled={disabled}
        isDragging={isDragging}
        onRemove={onRemove}
        onClick={onClick}
        onMoveBack={onMoveBack}
        onMoveForward={onMoveForward}
      />
      {/* Número de la foto, Antes/Después y si es la portada */}
      <div className="mt-1.5">
        <FurnitureGalleryBadges position={position} variant={entry.variant} isCover={isCover} />
      </div>
      {/* Pie de foto y Normal/Antes/Después — van fuera del handle de arrastre, así se puede escribir sin mover la foto */}
      <div className="mt-1.5">
        <FurnitureGalleryWebFields
          caption={entry.caption}
          variant={entry.variant}
          disabled={disabled}
          onCaptionChange={(caption) => onWebChange({ caption })}
          onVariantChange={(variant) => onWebChange({ variant })}
        />
      </div>
    </div>
  )
}

// ── Main component ──────────────────────────────────────────────────
export function FurnitureGalleryManager({
  initialGallery = [],
  onPendingItemsChange,
  onRemovedIdsChange,
  onReorderedItemsChange,
  onWebChangedItemsChange,
  onCoverChange,
  disabled = false,
}: FurnitureGalleryManagerProps) {
  const [items, setItems]               = useState<GalleryEntry[]>(() =>
    initialGallery.map((i) => ({ ...i, localKey: nextKey() }))
  )
  // Pie de foto/variante con que llegó cada foto guardada: sirve para saber cuáles cambió el usuario
  // y así hacer PATCH solo de esas (y no de todas) al guardar.
  const [initialWeb] = useState(() => {
    const map = new Map<number, Pick<GalleryEntry, 'caption' | 'variant'>>()
    initialGallery.forEach((i) => {
      if (i.furnitureImageId) map.set(i.furnitureImageId, { caption: i.caption, variant: i.variant })
    })
    return map
  })
  const [removedFiIds, setRemovedFiIds] = useState<number[]>([])
  const [pickerOpen, setPickerOpen]     = useState(false)
  const [uploadOpen, setUploadOpen]     = useState(false)
  const [lightboxIdx, setLightboxIdx]   = useState(-1)

  // MouseSensor solo para mouse (distancia chica: el mouse no tiembla). Antes era PointerSensor,
  // pero ese también toma el dedo y bloqueaba el scroll en celular. TouchSensor aparte para
  // touch: hay que mantener presionado ~¼ s; si el dedo se desliza antes, es scroll normal.
  // KeyboardSensor agrega reordenar con flechas para quien no puede arrastrar.
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  // Notify parent whenever items change
  useEffect(() => {
    const pending: PendingGalleryItem[] = items
      .filter((i) => !i.furnitureImageId)
      .map((i) => ({ imageId: i.imageId, order: items.indexOf(i) + 1, caption: i.caption, variant: i.variant }))
    onPendingItemsChange(pending)

    const reordered: ReorderedGalleryItem[] = items
      .filter((i) => !!i.furnitureImageId)
      .map((i) => ({ furnitureImageId: i.furnitureImageId!, order: items.indexOf(i) + 1 }))
    onReorderedItemsChange(reordered)

    // Fotos ya guardadas cuyo pie de foto o variante es distinto al original
    const webChanged: WebChangedGalleryItem[] = items
      .filter((i) => {
        if (!i.furnitureImageId) return false
        const original = initialWeb.get(i.furnitureImageId)
        return !original || original.caption !== i.caption || original.variant !== i.variant
      })
      .map((i) => ({ furnitureImageId: i.furnitureImageId!, caption: i.caption, variant: i.variant }))
    onWebChangedItemsChange?.(webChanged)

    // La Foto 1 es la portada: para cambiarla se arrastra otra foto al primer lugar
    onCoverChange?.(items[0]?.imageId ?? null)
  }, [items])

  useEffect(() => {
    onRemovedIdsChange(removedFiIds)
  }, [removedFiIds])

  const existingImageIds = items.map((i) => i.imageId)

  const handlePickerConfirm = (picked: PickedImage[]) => {
    const newEntries: GalleryEntry[] = picked.map((p) => ({
      localKey: nextKey(), imageId: p.imageId, imageUrl: p.imageUrl, imageName: p.imageName,
      caption: '', variant: null,
    }))
    setItems((prev) => [...prev, ...newEntries])
  }

  const handleUploadDone = (images: PickedImage[]) => {
    const newEntries: GalleryEntry[] = images.map((p) => ({
      localKey: nextKey(), imageId: p.imageId, imageUrl: p.imageUrl, imageName: p.imageName,
      caption: '', variant: null,
    }))
    setItems((prev) => [...prev, ...newEntries])
  }

  // Cambia el pie de foto o la variante de una foto (nueva o ya guardada)
  const updateWebField = (localKey: string, patch: Partial<Pick<GalleryEntry, 'caption' | 'variant'>>) => {
    setItems((prev) => prev.map((i) => (i.localKey === localKey ? { ...i, ...patch } : i)))
  }

  const handleRemove = (entry: GalleryEntry) => {
    setItems((prev) => prev.filter((i) => i.localKey !== entry.localKey))
    if (entry.furnitureImageId) {
      setRemovedFiIds((prev) => [...prev, entry.furnitureImageId!])
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    setItems((prev) => {
      const oldIdx = prev.findIndex((i) => i.localKey === active.id)
      const newIdx = prev.findIndex((i) => i.localKey === over.id)
      return arrayMove(prev, oldIdx, newIdx)
    })
  }

  // Alternativa al arrastre que siempre funciona (mouse, touch o teclado) — el drag con
  // dnd-kit puede fallar en touch por gesto/handle, esto no depende de ninguno de los dos.
  const moveItem = (localKey: string, direction: -1 | 1) => {
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.localKey === localKey)
      const newIdx = idx + direction
      if (idx < 0 || newIdx < 0 || newIdx >= prev.length) return prev
      return arrayMove(prev, idx, newIdx)
    })
  }

  const lightboxSlides = items
    .filter((i) => i.imageUrl)
    .map((i) => ({ src: i.imageUrl!, alt: i.imageName ?? '' }))

  const getLbIdx = (localKey: string) =>
    items.filter((i) => i.imageUrl).findIndex((i) => i.localKey === localKey)

  const pendingCount = items.filter((i) => !i.furnitureImageId).length

  return (
    <div className="flex flex-col gap-3">
      {items.length === 0 ? (
        <div className="flex min-h-[120px] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed text-muted-foreground">
          <Images className="size-7 opacity-40" />
          <p className="text-xs">Sin imágenes de galería</p>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map((i) => i.localKey)} strategy={rectSortingStrategy}>
            {/* Columnas automáticas: entran tantas como quepan (mín. 12rem c/u, porque cada foto lleva debajo su pie de foto y variante); a más ancho, más columnas */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-[repeat(auto-fill,minmax(12rem,1fr))]">
              {items.map((entry, idx) => (
                <SortableItem
                  key={entry.localKey}
                  entry={entry}
                  position={idx + 1}
                  isCover={idx === 0}
                  disabled={disabled}
                  onRemove={() => handleRemove(entry)}
                  onClick={() => {
                    const lbIdx = getLbIdx(entry.localKey)
                    if (lbIdx >= 0) setLightboxIdx(lbIdx)
                  }}
                  onMoveBack={!disabled && idx > 0 ? () => moveItem(entry.localKey, -1) : undefined}
                  onMoveForward={!disabled && idx < items.length - 1 ? () => moveItem(entry.localKey, 1) : undefined}
                  onWebChange={(patch) => updateWebField(entry.localKey, patch)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="outline" size="sm" disabled={disabled} onClick={() => setPickerOpen(true)}>
          <ImagePlus className="mr-1.5 size-4" />
          Seleccionar imagen
        </Button>
        <Button type="button" variant="ghost" size="sm" disabled={disabled} onClick={() => setUploadOpen(true)}>
          <Upload className="mr-1.5 size-4" />
          Subir nueva
        </Button>
        {items.length > 0 && (
          <span className="ml-auto text-xs text-muted-foreground">
            {items.length} imagen{items.length !== 1 ? 'es' : ''}
            {pendingCount > 0 && (
              <span className="ml-1 text-primary">
                · {pendingCount} nueva{pendingCount !== 1 ? 's' : ''}
              </span>
            )}
          </span>
        )}
      </div>

      <FurnitureGalleryAddPicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        existingImageIds={existingImageIds}
        onConfirm={handlePickerConfirm}
      />

      <FurnitureGalleryUpload
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        onUploaded={handleUploadDone}
      />

      <Lightbox
        open={lightboxIdx >= 0}
        close={() => setLightboxIdx(-1)}
        index={lightboxIdx}
        slides={lightboxSlides}
        plugins={[Zoom, Thumbnails]}
        controller={{ closeOnBackdropClick: true }}
        zoom={{ maxZoomPixelRatio: 4 }}
        thumbnails={{ position: 'bottom', width: 72, height: 48, gap: 8, border: 0, borderRadius: 6 }}
        styles={{ root: { '--yarl__color_backdrop': 'rgba(0,0,0,0.94)', zIndex: 9999 } }}
      />
    </div>
  )
}
