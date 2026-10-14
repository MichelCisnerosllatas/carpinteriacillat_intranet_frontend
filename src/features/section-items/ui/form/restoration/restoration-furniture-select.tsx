'use client'

// SOLO para «Restauración» de Servicios (restoration_compare, "02").
// Campo "Mueble relacionado (opcional)" de un trabajo. Lo usan:
//   - el formulario de item (./restoration-item-fields.tsx)
//   - el diálogo "+ Nuevo" del formulario de imagen (sectionimages/ui/form/new-section-item/)
// Un trabajo NO tiene que ser un mueble: si se elige uno, su clave es 'furniture-<id>' (botón
// «Ver la restauración completa» en la web + fotos Antes/Después automáticas); si no, la clave queda vacía.
// Ver features/sectionimages/grouped/README.md → "Restauración".

import { Loader2 } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import type { FurnitureJoinApiItem } from '@/features/furnitures/model/furniture-api-item.dto'
import { hasBeforeAndAfterPhotos } from '@/features/sectionimages/grouped'
import { FurnitureOptionLabel } from '@/features/sectionimages/ui/form/coverflow/furniture-option-label'

/** Valor del select para "Sin mueble" (Radix no acepta un valor vacío en un SelectItem). */
const NO_FURNITURE = 'none'

/** Texto de ayuda del campo (el mismo en el formulario y en el diálogo). */
export const RESTORATION_FURNITURE_HELP =
  'Sirve para el botón «Ver la restauración completa» y para usar sus fotos Antes/Después.'

interface RestorationFurnitureSelectProps {
  /** Muebles con su galería (useFurnitureJoinList). */
  furnitures: FurnitureJoinApiItem[]
  isLoading: boolean
  isError: boolean
  /** Muebles que ya usa otro trabajo de la sección (salen deshabilitados). */
  usedIds: number[]
  /** Mueble elegido (null = sin mueble). */
  value: number | null
  /** Se eligió un mueble (o "Sin mueble" → null). `furniture` es null si no está en la lista. */
  onChange: (idFurniture: number | null, furniture: FurnitureJoinApiItem | null) => void
}

export function RestorationFurnitureSelect({
  furnitures, isLoading, isError, usedIds, value, onChange,
}: RestorationFurnitureSelectProps) {
  // Cualquier mueble activo (el ya elegido se mantiene aunque esté inactivo)
  const options = furnitures.filter((f) => f.furniture_state === 1 || f.id_furniture === value)
  // Mueble guardado que no vino en la lista (ej. borrado): se muestra igual para no perderlo
  const isMissing = value != null && !options.some((f) => f.id_furniture === value)

  const handleChange = (v: string) => {
    if (v === NO_FURNITURE) { onChange(null, null); return }
    const id = Number(v)
    if (!Number.isInteger(id) || id <= 0) return
    onChange(id, furnitures.find((f) => f.id_furniture === id) ?? null)
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium">Mueble relacionado <span className="font-normal text-muted-foreground">(opcional)</span></span>
      {isLoading ? (
        <div className="flex h-9 items-center gap-2 rounded-md border px-3 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />Cargando muebles...
        </div>
      ) : isError ? (
        <p className="text-xs text-destructive">No se pudieron cargar los muebles.</p>
      ) : (
        <Select value={value != null ? String(value) : NO_FURNITURE} onValueChange={handleChange}>
          <SelectTrigger className="w-full"><SelectValue placeholder="Sin mueble" /></SelectTrigger>
          <SelectContent>
            <SelectItem value={NO_FURNITURE}>Sin mueble</SelectItem>
            {isMissing && <SelectItem value={String(value)}>Mueble #{value}</SelectItem>}
            {options.map((f) => {
              // Ya lo usa otro trabajo de esta sección (no se puede repetir)
              const isUsed = usedIds.includes(f.id_furniture)
              // Marca para saber cuáles tienen fotos Antes/Después en su galería
              const hasBeforeAfter = hasBeforeAndAfterPhotos(f.gallery_images)
              return (
                <SelectItem key={f.id_furniture} value={String(f.id_furniture)} disabled={isUsed}>
                  {/* Miniatura de su foto principal + nombre + marcas */}
                  <FurnitureOptionLabel
                    furniture={f}
                    suffix={`${hasBeforeAfter ? ' · Antes/Después' : ''}${isUsed ? ' (ya está en Restauración)' : ''}`}
                  />
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      )}
      <p className="text-xs text-muted-foreground">{RESTORATION_FURNITURE_HELP}</p>
    </div>
  )
}
