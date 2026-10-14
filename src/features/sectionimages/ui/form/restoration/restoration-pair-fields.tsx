'use client'

// SOLO para «Restauración» (restoration_compare), al CREAR y al EDITAR (misma tarjeta).
// Tarjeta "Fotos del trabajo":
//   - arriba, UN select "Mueble" para los dos bloques (restoration-pair-furniture.tsx).
//     Al elegir un mueble (o al preseleccionarse el del trabajo) sus fotos marcadas Antes/Después
//     se colocan SOLAS en los bloques (reemplazando lo que hubiera).
//   - debajo, UNA fila con las fotos del mueble (restoration-furniture-photo-strip.tsx) para
//     arrastrar a un bloque o tocar y elegir "Poner en Antes / Después".
//   - debajo, los bloques "Antes" y "Después" lado a lado (restoration-photo-slot.tsx);
//     en celular uno debajo del otro. Son las zonas donde se sueltan las fotos.
// El arrastre (@dnd-kit) se arma en use-restoration-dnd.ts; el DndContext envuelve la fila y los bloques.
// Al guardar, el formulario crea 1 o 2 filas de sections_images (variant 'before' / 'after').
// Al EDITAR (pair.mode === 'edit'): los bloques vienen precargados con lo guardado, NO se auto-colocan
// las fotos marcadas y cada bloque tiene su switch "Mostrar en el sitio web" (save-restoration-pair.ts guarda).

import { useEffect, useRef } from 'react'
import { DndContext, DragOverlay, pointerWithin } from '@dnd-kit/core'
import { ImageIcon, ImageOff } from 'lucide-react'
import { Card, CardContent } from '@/shared/ui/card'
import type { FurnitureJoinApiItem } from '@/features/furnitures/model/furniture-api-item.dto'
import { useFurnitureJoinList, getFurnitureDisplayTitle, type RestorationPhotoVariant } from '../../../grouped'
import { FormGroupTitle } from '../form-group-title'
import { getFurniturePhotos, findVariantPhoto, type FurniturePhoto } from '../coverflow/furniture-photos'
import { RestorationPairFurniture } from './restoration-pair-furniture'
import { RestorationFurniturePhotoStrip } from './restoration-furniture-photo-strip'
import { RestorationPhotoSlot } from './restoration-photo-slot'
import { useRestorationDnd } from './use-restoration-dnd'
import type { RestorationPairState } from './use-restoration-pair'

interface RestorationPairFieldsProps {
  /** Estado del mueble y de los bloques (useRestorationPair). */
  pair: RestorationPairState
}

/** Mueble → lo que guarda el bloque (id + título para el pie de foto). */
const toPickedFurniture = (f: FurnitureJoinApiItem) => ({ id: f.id_furniture, title: getFurnitureDisplayTitle(f) })

/** Tarjeta con el mueble compartido, la fila de fotos y los bloques "Antes" y "Después". */
export function RestorationPairFields({ pair }: RestorationPairFieldsProps) {
  // Muebles con su portada y galería (endpoint "join"), una sola vez para toda la tarjeta
  const { furnitures, isLoading, isError } = useFurnitureJoinList()

  // Mueble elegido arriba y sus fotos
  const selected = furnitures.find((f) => f.id_furniture === pair.furnitureId) ?? null
  const furniturePhotos = selected ? getFurniturePhotos(selected) : []
  // ¿Se eligen las fotos arrastrando desde el mueble? (si no, los bloques muestran el banco)
  const hasFurniture = furniturePhotos.length > 0
  // Hay un mueble elegido (ej. el del trabajo) pero la lista aún carga → esqueletos, no el banco
  const isLoadingFurniture = isLoading && pair.furnitureId != null
  const isEdit = pair.mode === 'edit'

  /** Coloca las fotos marcadas Antes/Después del mueble en los bloques (vacío si no tiene). */
  const placeMarkedPhotos = (furniture: FurnitureJoinApiItem) => {
    pair.placeFurniturePhotos(
      { before: findVariantPhoto(furniture, 'before'), after: findVariantPhoto(furniture, 'after') },
      toPickedFurniture(furniture),
    )
  }

  // AUTO-COLOCAR: cada vez que cambia el mueble elegido (o termina de cargar el del trabajo)
  // se ponen sus fotos marcadas. El ref guarda el último mueble ya colocado, para no repetirlo
  // en cada render (ni pisar lo que el usuario cambie después a mano).
  const lastPlacedId = useRef<number | null>(null)
  useEffect(() => {
    // Al EDITAR no se auto-colocan (ni al cargar ni al cambiar de mueble): los bloques ya traen
    // las fotos guardadas y no se deben pisar. Solo se ponen con el link "Volver a las fotos marcadas".
    if (isEdit) return
    const id = selected?.id_furniture ?? null
    if (id === lastPlacedId.current) return
    lastPlacedId.current = id
    if (selected) placeMarkedPhotos(selected)
    // Solo debe correr cuando cambia el mueble elegido
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected])

  /** Pone una foto del mueble en un bloque (al soltarla o desde el menú "Poner en..."). */
  const placePhoto = (variant: RestorationPhotoVariant, photo: FurniturePhoto) => {
    if (selected) pair.pickFurniturePhoto(variant, photo, toPickedFurniture(selected))
  }

  // Arrastrar y soltar: sensores + qué hacer al soltar
  const dnd = useRestorationDnd({ onDropPhoto: placePhoto, onSwap: pair.swapSlots })

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 pt-6">
        <FormGroupTitle
          icon={ImageIcon}
          title="Fotos del trabajo"
          description="Elige el mueble y luego la foto «Antes» y la «Después». Al menos una."
        />

        {/* UN solo mueble para los dos bloques */}
        <RestorationPairFurniture
          furnitures={furnitures}
          isLoading={isLoading}
          isError={isError}
          furnitureId={pair.furnitureId}
          onFurnitureChange={pair.setFurnitureId}
          onPlaceMarked={placeMarkedPhotos}
          autoPlace={!isEdit}
        />

        {/* pointerWithin: la foto cae en el bloque que está bajo el dedo / mouse */}
        <DndContext
          sensors={dnd.sensors}
          collisionDetection={pointerWithin}
          onDragStart={dnd.handleDragStart}
          onDragEnd={dnd.handleDragEnd}
          onDragCancel={dnd.handleDragCancel}
        >
          {/* Fila con las fotos del mueble (una sola vez) */}
          {(isLoadingFurniture || selected) && (
            <RestorationFurniturePhotoStrip
              photos={furniturePhotos}
              isLoading={isLoadingFurniture}
              beforeImageId={pair.before.idImage}
              afterImageId={pair.after.idImage}
              onPlace={placePhoto}
            />
          )}

          {/* Bloques Antes / Después: columnas fluidas (lado a lado si hay espacio; en celular, uno debajo del otro) */}
          <div className="grid items-start gap-3 grid-cols-[repeat(auto-fit,minmax(min(100%,240px),1fr))]">
            {(['before', 'after'] as const).map((variant) => (
              <RestorationPhotoSlot
                key={variant}
                variant={variant}
                value={variant === 'before' ? pair.before : pair.after}
                hasFurniture={hasFurniture}
                isLoadingFurniture={isLoadingFurniture}
                onChange={(patch) => pair.patchSlot(variant, patch)}
                onClear={() => pair.clearSlot(variant)}
                // Solo al editar: switch "Mostrar en el sitio web" de esta foto
                visible={isEdit ? pair.slotStates[variant] === 1 : undefined}
                onVisibleChange={isEdit ? (v) => pair.setSlotState(variant, v ? 1 : 0) : undefined}
              />
            ))}
          </div>

          {/* Miniatura que sigue al dedo / mouse mientras se arrastra.
              dropAnimation null: al soltar desaparece (no "vuelve" a la fila). */}
          <DragOverlay dropAnimation={null}>
            {dnd.preview && (
              <div className="aspect-[4/3] w-28 overflow-hidden rounded-md border-2 border-primary bg-muted shadow-lg">
                {dnd.preview.url
                  ? <img src={dnd.preview.url} alt={dnd.preview.name} draggable={false} className="h-full w-full object-cover" />
                  : <ImageOff className="m-auto mt-6 size-5 text-muted-foreground" />}
              </div>
            )}
          </DragOverlay>
        </DndContext>

        {pair.error && <p className="text-xs font-medium text-destructive">{pair.error}</p>}
      </CardContent>
    </Card>
  )
}
