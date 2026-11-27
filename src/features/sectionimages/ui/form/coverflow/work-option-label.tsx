// Contenido de UNA opción en el select de trabajos: miniatura de su foto principal + título
// (+ "· Oculto" si el trabajo no está publicado). Lo usa work-photo-picker.tsx.
// Como va DENTRO del <SelectItem>, Radix también lo muestra en el botón del select cuando
// el trabajo queda elegido (la miniatura se ve ahí también).

import { Hammer } from 'lucide-react'
import type { GroupedWebWork } from '../../../grouped'
import { getWorkPhotos } from './work-photos'

interface WorkOptionLabelProps {
  work: GroupedWebWork
}

export function WorkOptionLabel({ work }: WorkOptionLabelProps) {
  // Foto principal = la 1ª de getWorkPhotos (la portada; si no tiene, la 1ª de su galería)
  const mainPhoto = getWorkPhotos(work)[0]
  const isHidden = work.webwork_state !== 1

  return (
    <span className="flex min-w-0 items-center gap-2">
      <span className="flex size-7 shrink-0 items-center justify-center overflow-hidden rounded border bg-muted">
        {mainPhoto?.url ? (
          // <img> simple: es una miniatura chica dentro de un select (no hace falta next/image)
          // eslint-disable-next-line @next/next/no-img-element
          <img src={mainPhoto.url} alt="" className="size-full object-cover" loading="lazy" />
        ) : (
          <Hammer className="size-3.5 text-muted-foreground" aria-hidden />
        )}
      </span>
      <span className="truncate">
        {work.webwork_title}
        {isHidden && <span className="text-muted-foreground"> · Oculto</span>}
      </span>
    </span>
  )
}
