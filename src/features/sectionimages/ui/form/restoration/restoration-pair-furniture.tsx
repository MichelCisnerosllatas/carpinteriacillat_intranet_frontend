'use client'

// SOLO para «Restauración» (restoration_compare), al CREAR y al EDITAR.
// Select "Mueble" de arriba de la tarjeta "Fotos del trabajo": UN solo mueble para los dos bloques
// (Antes y Después). Debajo se muestra la fila con las fotos de este mueble para arrastrar.
// Al elegir un mueble, sus fotos marcadas "Antes"/"Después" se colocan SOLAS en los bloques
// (lo hace restoration-pair-fields.tsx). Si después se cambian, el link "Volver a las fotos marcadas"
// las vuelve a poner. Al EDITAR no se colocan solas (autoPlace = false): solo con ese link.

import { Loader2, RotateCcw } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import type { FurnitureJoinApiItem } from '@/features/furnitures/model/furniture-api-item.dto'
import { hasBeforeAndAfterPhotos } from '../../../grouped'
import { findVariantPhoto, getRestorationFurnitureOptions } from '../coverflow/furniture-photos'
import { FurnitureOptionLabel } from '../coverflow/furniture-option-label'

/** Valor de la opción "Sin mueble" (Radix no permite value=''). */
const NO_FURNITURE = 'none'

interface RestorationPairFurnitureProps {
  /** Lista de muebles (useFurnitureJoinList, la pide el componente padre una sola vez). */
  furnitures: FurnitureJoinApiItem[]
  isLoading: boolean
  isError: boolean
  /** Mueble elegido (null = sin mueble). */
  furnitureId: number | null
  onFurnitureChange: (idFurniture: number | null) => void
  /** "Volver a las fotos marcadas": recibe el mueble elegido (el padre vuelve a colocar sus fotos). */
  onPlaceMarked: (furniture: FurnitureJoinApiItem) => void
  /** true (crear) = las fotos marcadas se colocan solas al elegir el mueble; false (editar) = no. Solo cambia la ayuda. */
  autoPlace?: boolean
}

/** Select "Mueble" compartido + link "Volver a las fotos marcadas". */
export function RestorationPairFurniture({
  furnitures, isLoading, isError, furnitureId, onFurnitureChange, onPlaceMarked, autoPlace = true,
}: RestorationPairFurnitureProps) {
  if (isLoading) {
    return (
      <div className="flex h-9 items-center gap-2 rounded-md border px-3 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />Cargando muebles...
      </div>
    )
  }

  if (isError) {
    return <p className="text-xs text-destructive">No se pudieron cargar los muebles. Elige las fotos del banco de imágenes.</p>
  }

  // Muebles con fotos, primero los que tienen Antes/Después (el elegido siempre se mantiene)
  const options = getRestorationFurnitureOptions(furnitures, furnitureId)
  const selected = furnitures.find((f) => f.id_furniture === furnitureId) ?? null
  // ¿El mueble elegido tiene alguna foto marcada Antes o Después? (para mostrar el link)
  const hasMarked = selected != null && (findVariantPhoto(selected, 'before') != null || findVariantPhoto(selected, 'after') != null)

  /**
   * Valor del select → id del mueble. "Sin mueble" → null. Se ignoran valores vacíos o raros:
   * el <select> oculto de Radix (dentro de un <form>) puede avisar ''.
   */
  const handleChange = (value: string) => {
    if (value === NO_FURNITURE) {
      onFurnitureChange(null)
      return
    }
    const id = Number(value)
    if (!value || !Number.isInteger(id) || id <= 0) return
    onFurnitureChange(id)
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium">Mueble</span>
      <Select
        key={`pair-furniture-${selected?.id_furniture ?? NO_FURNITURE}`}
        value={selected ? String(selected.id_furniture) : NO_FURNITURE}
        onValueChange={handleChange}
      >
        <SelectTrigger className="w-full"><SelectValue placeholder="Elegir mueble" /></SelectTrigger>
        <SelectContent>
          <SelectItem value={NO_FURNITURE}>Sin mueble (usar el banco de imágenes)</SelectItem>
          {options.map((f) => (
            <SelectItem key={f.id_furniture} value={String(f.id_furniture)}>
              {/* Miniatura de su foto principal + nombre (+ marca Antes/Después) */}
              <FurnitureOptionLabel
                furniture={f}
                suffix={hasBeforeAndAfterPhotos(f.gallery_images) ? ' · Antes/Después' : undefined}
              />
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground">
        {options.length === 0
          ? 'Ningún mueble tiene fotos todavía.'
          : autoPlace
            ? 'Se preselecciona el mueble del trabajo. Al elegir un mueble, sus fotos marcadas Antes/Después se colocan solas.'
            : 'Cambiar de mueble no cambia las fotos guardadas: arrastra las que quieras o usa «Volver a las fotos marcadas».'}
      </p>
      {/* Vuelve a poner las fotos marcadas del mueble (si se cambiaron a mano) */}
      {selected && hasMarked && (
        <button
          type="button"
          onClick={() => onPlaceMarked(selected)}
          className="flex w-fit items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <RotateCcw className="size-3.5" />Volver a las fotos marcadas
        </button>
      )}
      {/* El mueble del trabajo no vino en la lista */}
      {furnitureId != null && !selected && (
        <p className="text-xs text-amber-600">No se encontró el mueble #{furnitureId}. Elige otro.</p>
      )}
    </div>
  )
}
