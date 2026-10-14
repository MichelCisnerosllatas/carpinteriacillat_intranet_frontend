'use client'

// Carrusel «Muebles a medida» (category_coverflow) y «Restauración» (restoration_compare) al EDITAR.
// Origen de la imagen "Foto de un mueble": se elige un mueble y luego una de sus fotos
// (portada o galería). Al elegir, el formulario guarda:
//   id_image          = la imagen elegida
//   sectionimage_link = '/gallery/<id_furniture>'  (enlace con el mueble)
// Carrusel: solo se listan los muebles de la categoría de la tarjeta.
// Restauración (prop `restoration`): se listan los muebles CON fotos, primero los que tienen
// Antes/Después, y cada foto muestra su badge "Antes" / "Después".
// (Al CREAR en Restauración no se usa este picker: los bloques Antes/Después comparten un solo
// select de mueble, ver ../restoration/restoration-pair-furniture.tsx.)
// Grilla de fotos: ./furniture-photo-grid.tsx. Funciones de fotos: ./furniture-photos.ts.
// Ver features/sectionimages/grouped/README.md.

import { Loader2 } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { useFurnitureJoinList, getFurnitureDisplayTitle, hasBeforeAndAfterPhotos } from '../../../grouped'
import { getFurniturePhotos, getRestorationFurnitureOptions, type FurniturePhoto } from './furniture-photos'
import { FurnitureOptionLabel } from './furniture-option-label'
import { FurniturePhotoGrid } from './furniture-photo-grid'

/** Mueble elegido (lo recibe el formulario al elegir una foto). */
export type PickedFurniture = {
  id: number
  /** Título público o, si no tiene, el nombre del mueble. */
  title: string
}

/** Foto elegida (lo recibe el formulario al elegir una foto). */
export type PickedFurniturePhoto = {
  imageId: number
  url: string
  name: string
  /** 'before' / 'after' si la foto está marcada así en la galería del mueble. */
  variant: string | null
}

interface FurniturePhotoPickerProps {
  /** Carrusel: categoría de la tarjeta elegida (id sacado de su clave 'category-<id>'). null = sin filtro. */
  categoryId?: number | null
  /** Carrusel: nombre de la categoría (por si la clave no trae id: se compara por nombre). null = sin filtro. */
  categoryName?: string | null
  /** Mueble elegido (al editar viene del enlace '/gallery/<id>'; en Restauración, el del trabajo). */
  furnitureId: number | null
  onFurnitureChange: (idFurniture: number | null) => void
  /** Imagen elegida ahora (para marcarla en la grilla). */
  selectedImageId: number | null
  /** Se eligió una foto del mueble. */
  onPick: (photo: PickedFurniturePhoto, furniture: PickedFurniture) => void
  /** Texto de ayuda bajo el select (si no viene, se usa uno según la sección). */
  hint?: string
  /** Restauración: solo muebles con fotos (primero los de Antes/Después) y badges "Antes" / "Después". */
  restoration?: boolean
}

/** Compara nombres sin importar mayúsculas ni espacios de más. */
const sameName = (a?: string | null, b?: string | null) =>
  (a ?? '').trim().toLowerCase() === (b ?? '').trim().toLowerCase()

/** Foto de la grilla → lo que recibe el formulario. */
const toPicked = (p: FurniturePhoto): PickedFurniturePhoto => ({ imageId: p.imageId, url: p.url, name: p.name, variant: p.variant })

/** Select de mueble (filtrado según la sección) + grilla con sus fotos. */
export function FurniturePhotoPicker({
  categoryId = null, categoryName = null, furnitureId, onFurnitureChange, selectedImageId, onPick, hint,
  restoration = false,
}: FurniturePhotoPickerProps) {
  // Muebles con su categoría, portada y galería (endpoint "join"), una sola vez
  const { furnitures, isLoading, isError } = useFurnitureJoinList()

  // Carrusel: muebles de la categoría de la tarjeta (por id; si la clave no trae id, por nombre).
  // Sin categoría se listan todos. El mueble ya elegido siempre se mantiene en la lista.
  // Restauración: NUNCA se filtra por categoría (un trabajo no es una categoría): muebles con fotos.
  const hasCategory = !restoration && (categoryId != null || !!categoryName)
  const options = restoration
    ? getRestorationFurnitureOptions(furnitures, furnitureId)
    : furnitures.filter((f) => {
        if (f.id_furniture === furnitureId) return true
        if (!hasCategory) return true
        if (categoryId != null) return f.category?.id_category === categoryId
        return sameName(f.category?.category_name, categoryName)
      })

  const selected = furnitures.find((f) => f.id_furniture === furnitureId) ?? null
  const photos = selected ? getFurniturePhotos(selected) : []
  const picked: PickedFurniture | null = selected ? { id: selected.id_furniture, title: getFurnitureDisplayTitle(selected) } : null

  /**
   * Valor del select → id del mueble. Se ignoran valores vacíos o raros: el <select> oculto de Radix
   * (dentro de un <form>) puede avisar '' y Number('') = 0 dejaba el select en blanco y sin fotos.
   */
  const handleFurnitureChange = (value: string) => {
    const id = Number(value)
    if (!value || !Number.isInteger(id) || id <= 0) return
    onFurnitureChange(id)
  }

  if (isLoading) {
    return (
      <div className="flex h-9 items-center gap-2 rounded-md border px-3 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />Cargando muebles...
      </div>
    )
  }

  if (isError) {
    return <p className="text-xs text-destructive">No se pudieron cargar los muebles. Usa la pestaña «Imágenes».</p>
  }

  // Texto de ayuda bajo el select
  let helpText: string
  if (options.length === 0) {
    helpText = restoration ? 'Ningún mueble tiene fotos todavía.' : hasCategory ? 'Esta categoría todavía no tiene muebles.' : 'No hay muebles.'
  } else if (hint) {
    helpText = hint
  } else if (restoration) {
    helpText = 'Primero se listan los muebles con fotos Antes/Después.'
  } else {
    helpText = hasCategory ? 'Solo se listan los muebles de la categoría elegida.' : 'Elige primero la categoría para ver solo sus muebles.'
  }

  return (
    <div className="flex flex-col gap-3">
      {/* 1) Elegir el mueble */}
      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">Mueble</span>
        <Select
          key={`furniture-${selected?.id_furniture ?? 'none'}`}
          value={selected ? String(selected.id_furniture) : undefined}
          onValueChange={handleFurnitureChange}
        >
          <SelectTrigger className="w-full"><SelectValue placeholder="Elegir mueble" /></SelectTrigger>
          <SelectContent>
            {options.map((f) => (
              <SelectItem key={f.id_furniture} value={String(f.id_furniture)}>
                {/* Miniatura de su foto principal + nombre (+ marca Antes/Después en Restauración) */}
                <FurnitureOptionLabel
                  furniture={f}
                  suffix={restoration && hasBeforeAndAfterPhotos(f.gallery_images) ? ' · Antes/Después' : undefined}
                />
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">{helpText}</p>
        {/* El mueble guardado (o el del trabajo) no vino en la lista */}
        {furnitureId != null && !selected && (
          <p className="text-xs text-amber-600">No se encontró el mueble #{furnitureId}. Elige otro.</p>
        )}
      </div>

      {/* 2) Elegir una foto del mueble (portada + galería) */}
      {selected && picked && (
        <FurniturePhotoGrid
          photos={photos}
          selectedImageId={selectedImageId}
          onPick={(photo) => onPick(toPicked(photo), picked)}
          showVariantBadge={restoration}
        />
      )}
    </div>
  )
}
