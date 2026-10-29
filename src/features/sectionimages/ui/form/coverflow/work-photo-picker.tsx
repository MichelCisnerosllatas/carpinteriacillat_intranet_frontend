'use client'

// Carrusel «Muebles a medida» (category_coverflow).
// Origen de la imagen "Foto de un trabajo": se elige un trabajo de la Galería y luego una de sus
// fotos (portada o galería). Al elegir, el formulario guarda:
//   id_image          = la imagen elegida
//   sectionimage_link = '/gallery/<id_web_work>'  (enlace con el trabajo)
// Solo se listan los trabajos de la categoría de la tarjeta (por id de su clave 'category-<id>';
// si la clave no trae id, por nombre sin tildes).
// Grilla de fotos: ./work-photo-grid.tsx. Funciones de fotos: ./work-photos.ts.
// Ver features/sectionimages/grouped/README.md.

import { Loader2 } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { buildCategoryItemKey, findWorksOfCategory, useWebWorkList } from '../../../grouped'
import { getWorkPhotos, type WorkPhoto } from './work-photos'
import { WorkOptionLabel } from './work-option-label'
import { WorkPhotoGrid } from './work-photo-grid'

/** Trabajo elegido (lo recibe el formulario al elegir una foto). */
export type PickedWork = {
  id: number
  title: string
}

/** Foto elegida (lo recibe el formulario al elegir una foto). */
export type PickedWorkPhoto = {
  imageId: number
  url: string
  name: string
}

interface WorkPhotoPickerProps {
  /** Categoría de la tarjeta elegida (id sacado de su clave 'category-<id>'). null = sin filtro por id. */
  categoryId?: number | null
  /** Nombre de la categoría (por si la clave no trae id: se compara por nombre). null = sin filtro. */
  categoryName?: string | null
  /** Trabajo elegido (al editar viene del enlace '/gallery/<id>'). */
  workId: number | null
  onWorkChange: (idWebWork: number | null) => void
  /** Imagen elegida ahora (para marcarla en la grilla). */
  selectedImageId: number | null
  /** Se eligió una foto del trabajo. */
  onPick: (photo: PickedWorkPhoto, work: PickedWork) => void
}

/** Foto de la grilla → lo que recibe el formulario. */
const toPicked = (p: WorkPhoto): PickedWorkPhoto => ({ imageId: p.imageId, url: p.url, name: p.name })

/** Select de trabajo (de la categoría de la tarjeta) + grilla con sus fotos. */
export function WorkPhotoPicker({
  categoryId = null, categoryName = null, workId, onWorkChange, selectedImageId, onPick,
}: WorkPhotoPickerProps) {
  // Trabajos con su categoría, portada y fotos (include=media), una sola vez. Publicados y ocultos.
  const { works, isLoading, isError } = useWebWorkList()

  // Trabajos de la categoría de la tarjeta. Sin categoría se listan todos.
  // El trabajo ya elegido siempre se mantiene en la lista.
  const hasCategory = categoryId != null || !!categoryName
  const ofCategory = hasCategory
    ? findWorksOfCategory({ sectionitem_key: categoryId != null ? buildCategoryItemKey(categoryId) : null, sectionitem_title: categoryName }, works)
    : works
  const options = works.filter((w) => w.id_web_work === workId || ofCategory.includes(w))

  const selected = works.find((w) => w.id_web_work === workId) ?? null
  const photos = selected ? getWorkPhotos(selected) : []
  const picked: PickedWork | null = selected ? { id: selected.id_web_work, title: selected.webwork_title } : null

  /**
   * Valor del select → id del trabajo. Se ignoran valores vacíos o raros: el <select> oculto de Radix
   * (dentro de un <form>) puede avisar '' y Number('') = 0 dejaba el select en blanco y sin fotos.
   */
  const handleWorkChange = (value: string) => {
    const id = Number(value)
    if (!value || !Number.isInteger(id) || id <= 0) return
    onWorkChange(id)
  }

  if (isLoading) {
    return (
      <div className="flex h-9 items-center gap-2 rounded-md border px-3 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />Cargando trabajos...
      </div>
    )
  }

  if (isError) {
    return <p className="text-xs text-destructive">No se pudieron cargar los trabajos. Usa la pestaña «Imágenes».</p>
  }

  // Texto de ayuda bajo el select
  let helpText: string
  if (options.length === 0) {
    helpText = hasCategory ? 'Esta categoría todavía no tiene trabajos en la Galería.' : 'No hay trabajos en la Galería.'
  } else {
    helpText = hasCategory ? 'Solo se listan los trabajos de la categoría elegida.' : 'Elige primero la categoría para ver solo sus trabajos.'
  }

  return (
    <div className="flex flex-col gap-3">
      {/* 1) Elegir el trabajo */}
      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">Trabajo</span>
        <Select
          key={`work-${selected?.id_web_work ?? 'none'}`}
          value={selected ? String(selected.id_web_work) : undefined}
          onValueChange={handleWorkChange}
        >
          <SelectTrigger className="w-full"><SelectValue placeholder="Elegir trabajo" /></SelectTrigger>
          <SelectContent>
            {options.map((w) => (
              <SelectItem key={w.id_web_work} value={String(w.id_web_work)}>
                {/* Miniatura de su foto principal + título */}
                <WorkOptionLabel work={w} />
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">{helpText}</p>
        {/* El trabajo guardado no vino en la lista */}
        {workId != null && !selected && (
          <p className="text-xs text-amber-600">No se encontró el trabajo #{workId}. Elige otro.</p>
        )}
      </div>

      {/* 2) Elegir una foto del trabajo (portada + galería) */}
      {selected && picked && (
        <WorkPhotoGrid
          photos={photos}
          selectedImageId={selectedImageId}
          onPick={(photo) => onPick(toPicked(photo), picked)}
        />
      )}
    </div>
  )
}
