'use client'

// SOLO para «Restauración» (restoration_compare), al CREAR y al EDITAR.
// Un bloque de foto ("Antes" o "Después") dentro de la tarjeta "Fotos del trabajo":
//   1) la foto puesta, en grande, con su X para quitarla. Es también la ZONA PARA SOLTAR
//      (useDroppable): se le suelta una foto de la fila del mueble (restoration-furniture-photo-strip.tsx).
//      Vacía: borde punteado y "Suelta aquí la foto «Antes»". Al pasar por encima se resalta.
//      La foto puesta se puede arrastrar al OTRO bloque para intercambiarlas.
//   2) link "Usar del banco de imágenes" / "Volver a fotos del mueble". Sin mueble → siempre el banco.
//   3) pie de foto opcional
//   4) solo al EDITAR (si llegan `visible` y `onVisibleChange`): switch "Mostrar en el sitio web" de esta foto
// El estado vive en use-restoration-pair.ts y el arrastre en use-restoration-dnd.ts;
// este componente solo lo muestra y avisa cambios.

import { useState } from 'react'
import { useDraggable, useDroppable } from '@dnd-kit/core'
import { ImageOff, Images, Plus, Sofa, X } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Input } from '@/shared/ui/input'
import { Button } from '@/shared/ui/button'
import { Skeleton } from '@/shared/ui/skeleton'
import { VisibilityToggle } from '@/shared/ui/visibility-toggle'
import { ImageSelect } from '@/features/images/ui/image-select'
import { ImageQuickUploadDialog } from '@/features/images/ui/image-quick-upload-dialog'
import { getImageUrl, getImageDisplayName } from '@/features/images/lib/image-url'
import type { ImageApiItem } from '@/features/images/model/imageget.dto'
import { RESTORATION_PHOTO_VARIANTS, type RestorationPhotoVariant } from '../../../grouped'
import { restorationDropId, type RestorationDragData, type RestorationDropData } from './use-restoration-dnd'
import type { RestorationSlotPatch, RestorationSlotValue } from './use-restoration-pair'

interface RestorationPhotoSlotProps {
  variant: RestorationPhotoVariant
  value: RestorationSlotValue
  /** true = hay un mueble elegido arriba con fotos (se eligen arrastrando). false = se muestra el banco. */
  hasFurniture: boolean
  /**
   * true = hay un mueble elegido pero la lista de muebles todavía está cargando.
   * Se muestra un esqueleto en vez de la foto y del banco, para que el bloque no "salte"
   * cuando terminan de cargar y se colocan las fotos marcadas del mueble.
   */
  isLoadingFurniture?: boolean
  onChange: (patch: RestorationSlotPatch) => void
  onClear: () => void
  /** Solo al editar: ¿la foto se muestra en la web? Sin esta prop no se dibuja el switch. */
  visible?: boolean
  onVisibleChange?: (visible: boolean) => void
}

/** Texto de ayuda de cada bloque. */
const SLOT_HELP: Record<RestorationPhotoVariant, string> = {
  before: 'Cómo estaba el mueble antes de restaurarlo.',
  after: 'Cómo quedó el mueble después de restaurarlo.',
}

/** Estilo de los links pequeños ("Nuevo", "Usar del banco...", "Volver a..."). */
const SMALL_LINK = 'flex w-fit items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground'

/** Bloque de una foto (Antes o Después). */
export function RestorationPhotoSlot({
  variant, value, hasFurniture, onChange, onClear, isLoadingFurniture = false, visible, onVisibleChange,
}: RestorationPhotoSlotProps) {
  const [showUpload, setShowUpload] = useState(false)
  const label = RESTORATION_PHOTO_VARIANTS.find((v) => v.value === variant)?.label ?? variant

  // Zona para soltar: todo el bloque de la foto en grande
  const dropData: RestorationDropData = { variant }
  const { setNodeRef: setDropRef, isOver } = useDroppable({ id: restorationDropId(variant), data: dropData })

  // Sin mueble (o mueble sin fotos) → siempre el banco
  const showBank = !hasFurniture || value.source === 'bank'
  const hasPhoto = value.idImage != null

  /** Banco de imágenes: ImageSelect avisa la imagen completa (para la foto en grande). */
  const handleBankSelected = (item: ImageApiItem | null) => {
    onChange(item
      ? { imageUrl: getImageUrl(item.image_patch), imageName: getImageDisplayName(item) }
      : { imageUrl: null, imageName: '' })
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border p-3">
      <div>
        <p className="text-sm font-semibold">{label}</p>
        <p className="text-xs text-muted-foreground">{SLOT_HELP[variant]}</p>
      </div>

      {/* 1) Foto puesta en grande = zona para soltar */}
      {isLoadingFurniture ? (
        <Skeleton className="aspect-[4/3] w-full" aria-busy="true" aria-label="Cargando fotos del mueble" />
      ) : (
        <div
          ref={setDropRef}
          className={cn(
            'relative aspect-[4/3] w-full overflow-hidden rounded-md border bg-muted/40 transition-colors',
            !hasPhoto && 'border-2 border-dashed',
            // Resaltado mientras se arrastra una foto por encima
            isOver && 'border-primary bg-primary/10 ring-2 ring-primary ring-offset-1',
          )}
        >
          {hasPhoto ? (
            <SlotPhoto variant={variant} value={value} label={label} />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-1 p-2 text-center text-muted-foreground">
              <ImageOff className="size-6" />
              <span className="text-xs">
                {hasFurniture ? `Suelta aquí la foto «${label}»` : 'Elige una foto del banco'}
              </span>
            </div>
          )}
          <span className="pointer-events-none absolute bottom-1.5 left-1.5 rounded bg-black/70 px-1.5 text-[11px] font-medium text-white">{label}</span>
          {hasPhoto && (
            // z-10: encima de la foto arrastrable, así el clic en la X no empieza un arrastre
            <Button
              type="button"
              size="icon"
              variant="secondary"
              className="absolute right-1.5 top-1.5 z-10 size-7"
              onClick={onClear}
              title="Quitar foto"
              aria-label={`Quitar foto «${label}»`}
            >
              <X className="size-4" />
            </Button>
          )}
        </div>
      )}

      {/* 2) Banco de imágenes (sin mueble, o si se pidió) o el link para pasar al banco */}
      {isLoadingFurniture ? null : showBank ? (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Banco de imágenes</span>
            <button type="button" onClick={() => setShowUpload(true)} className={SMALL_LINK}>
              <Plus className="size-3.5" />Nuevo
            </button>
          </div>
          <ImageSelect
            value={value.idImage}
            // Foto del banco: ya no está enlazada a un mueble
            onValueChange={(id) => onChange({ idImage: id, link: '' })}
            onSelectedChange={handleBankSelected}
            placeholder="Seleccionar imagen"
          />
          {hasFurniture && (
            <button type="button" onClick={() => onChange({ source: 'furniture' })} className={SMALL_LINK}>
              <Sofa className="size-3.5" />Volver a fotos del mueble
            </button>
          )}
        </div>
      ) : (
        <button type="button" onClick={() => onChange({ source: 'bank' })} className={SMALL_LINK}>
          <Images className="size-3.5" />Usar del banco de imágenes
        </button>
      )}

      {/* 3) Pie de foto (opcional) */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor={`caption-${variant}`} className="text-sm font-medium">Pie de foto</label>
        <Input
          id={`caption-${variant}`}
          placeholder="Opcional. Ej: Cómoda antigua de tornillo"
          maxLength={255}
          value={value.caption}
          onChange={(e) => onChange({ caption: e.target.value })}
        />
        <p className="text-xs text-muted-foreground">Se muestra al ver la foto en grande.</p>
      </div>

      {/* 4) Solo al editar y con foto: visible / oculta en la web (cada bloque es una fila distinta) */}
      {visible !== undefined && onVisibleChange && hasPhoto && (
        <div className="flex items-center justify-between gap-3 rounded-md border p-2.5">
          <span className="text-sm">Mostrar en el sitio web</span>
          <VisibilityToggle checked={visible} onCheckedChange={onVisibleChange} />
        </div>
      )}

      {/* Subir una imagen nueva al banco y usarla en este bloque */}
      <ImageQuickUploadDialog
        open={showUpload}
        onOpenChange={setShowUpload}
        onUploaded={(item) => onChange({
          idImage: item.id_image,
          imageUrl: getImageUrl(item.image_patch),
          imageName: getImageDisplayName(item),
          link: '',
        })}
      />
    </div>
  )
}

interface SlotPhotoProps {
  variant: RestorationPhotoVariant
  value: RestorationSlotValue
  label: string
}

/** Foto puesta en el bloque. Se puede arrastrar al otro bloque para intercambiarlas. */
function SlotPhoto({ variant, value, label }: SlotPhotoProps) {
  const dragData: RestorationDragData = {
    kind: 'slot',
    variant,
    url: value.imageUrl ?? '',
    name: value.imageName || label,
  }
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: `slot-photo-${variant}`, data: dragData })

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      // Sin tabIndex: con teclado no se intercambia (se usa el menú de la fila de fotos)
      tabIndex={-1}
      title="Arrastra al otro bloque para intercambiar"
      className={cn(
        // touch-manipulation: deslizar rápido hace scroll; mantener presionado ~¼ s arrastra
        'absolute inset-0 cursor-grab touch-manipulation select-none [-webkit-touch-callout:none] active:cursor-grabbing',
        isDragging && 'opacity-40',
      )}
    >
      {value.imageUrl ? (
        <img src={value.imageUrl} alt={value.imageName || label} draggable={false} className="pointer-events-none h-full w-full object-cover" />
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-1 text-muted-foreground">
          <ImageOff className="size-6" />
          <span className="text-xs">Imagen #{value.idImage}</span>
        </div>
      )}
    </div>
  )
}
