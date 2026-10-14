// Contenido de UNA opción en los selects de muebles: miniatura de su foto principal + nombre
// + texto extra opcional (ej. " · Antes/Después", " (ya está en Restauración)").
// Lo usan:
//   - furniture-photo-picker.tsx (pestaña «Muebles» del formulario de imagen)
//   - ../restoration/restoration-pair-furniture.tsx (select "Mueble" de Restauración al crear)
//   - section-items/ui/form/restoration/restoration-furniture-select.tsx (Mueble relacionado)
// Como va DENTRO del <SelectItem>, Radix también lo muestra en el botón del select cuando
// el mueble queda elegido (la miniatura se ve ahí también).

import { Sofa } from 'lucide-react'
import type { FurnitureJoinApiItem } from '@/features/furnitures/model/furniture-api-item.dto'
import { getFurnitureDisplayTitle } from '../../../grouped'
import { getFurniturePhotos } from './furniture-photos'

interface FurnitureOptionLabelProps {
  furniture: FurnitureJoinApiItem
  /** Texto pegado al nombre (ej. " · Antes/Después"). */
  suffix?: string
}

export function FurnitureOptionLabel({ furniture, suffix }: FurnitureOptionLabelProps) {
  // Foto principal = la 1ª de getFurniturePhotos (la portada; si no tiene, la 1ª de su galería)
  const mainPhoto = getFurniturePhotos(furniture)[0]
  const title = getFurnitureDisplayTitle(furniture)

  return (
    <span className="flex min-w-0 items-center gap-2">
      <span className="flex size-7 shrink-0 items-center justify-center overflow-hidden rounded border bg-muted">
        {mainPhoto?.url ? (
          // <img> simple: es una miniatura chica dentro de un select (no hace falta next/image)
          // eslint-disable-next-line @next/next/no-img-element
          <img src={mainPhoto.url} alt="" className="size-full object-cover" loading="lazy" />
        ) : (
          <Sofa className="size-3.5 text-muted-foreground" aria-hidden />
        )}
      </span>
      <span className="truncate">{title}{suffix}</span>
    </span>
  )
}
