'use client'

// SOLO carrusel «Muebles a medida» y «Restauración» (config.autoPhotos).
// Bloque "Fotos automáticas" dentro de un item (pestaña Imágenes y Reordenar):
//   - Hay automáticas → fila de tarjetas "Automática" + ayuda + "Personalizar fotos" + "Ver mueble/trabajos →".
//   - No hay automáticas ni propias → "Este trabajo/categoría aún no tiene fotos." + "Ver mueble/trabajos →".
//   - Tiene propias y no hacen falta automáticas → no pinta nada.
//   - Restauración, trabajo SIN mueble (no hay automáticas): si le falta foto Antes o Después propia
//     visible → aviso ámbar "Falta foto «Antes»: no se mostrará en la web." (prop missingWarning).
// Ver grouped/README.md → "Fotos automáticas".

import Link from 'next/link'
import { Copy, Loader2 } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { getPhotoVariantLabel, type GroupedSectionConfig } from '../../grouped-section.config'
import { isPublishedWork, type AutoPhoto, type AutoPhotosMode, type AutoPhotosResult } from '../../lib/auto-photos'
import { AUTO_PHOTOS_TEXTS, RESTORATION_UNPUBLISHED_TEXT, getAutoPhotosLink } from '../../lib/auto-photos-texts'
import { GroupedPhotoRow } from '../grouped-photo-row'
import { GroupedAutoPhotoCard } from './grouped-auto-photo-card'

interface GroupedAutoPhotosProps {
  config: GroupedSectionConfig
  mode: AutoPhotosMode
  /** Fotos automáticas del item (ver useAutoPhotos). */
  result: AutoPhotosResult
  /** true mientras se cargan los muebles. */
  isLoading: boolean
  /** true si no se pudieron cargar los muebles. */
  isError?: boolean
  /** true si el item tiene alguna foto propia (visible u oculta). */
  hasOwnPhotos: boolean
  /** Tocar una foto automática: abrirla en grande. */
  onOpenPhoto: (photos: AutoPhoto[], index: number) => void
  /** "Personalizar fotos". Si no viene, no se muestra el botón. */
  onPersonalize?: () => void
  /** Restauración, trabajo sin mueble: aviso de foto faltante (null = sin aviso). */
  missingWarning?: string | null
}

export function GroupedAutoPhotos({
  config, mode, result, isLoading, isError = false, hasOwnPhotos, onOpenPhoto, onPersonalize, missingWarning = null,
}: GroupedAutoPhotosProps) {
  const texts = AUTO_PHOTOS_TEXTS[mode]
  // Sin mueble no hay id → no hay botón "Ver mueble →"
  const link = getAutoPhotosLink(mode, result.idFurniture)
  const { photos } = result

  // Botón "Ver mueble →" / "Ver trabajos →" (si hay a dónde ir)
  const linkButton = link && (
    <Button asChild size="sm" variant="ghost" className="h-8 px-2">
      <Link href={link}>{texts.linkLabel}</Link>
    </Button>
  )

  // Restauración, trabajo sin mueble: no hay automáticas; solo se avisa lo que falta
  if (missingWarning) {
    return (
      <div className="flex flex-col gap-1">
        {!hasOwnPhotos && <p className="text-xs text-muted-foreground">{texts.emptyText}</p>}
        <p className="text-xs text-amber-600 dark:text-amber-400">{missingWarning}</p>
      </div>
    )
  }

  if (isLoading) {
    if (hasOwnPhotos) return null
    return (
      <p className="flex items-center gap-2 text-xs text-muted-foreground">
        <Loader2 className="size-3.5 animate-spin" />Buscando fotos automáticas...
      </p>
    )
  }

  if (isError) {
    if (hasOwnPhotos) return null
    return <p className="text-xs text-destructive">No se pudieron cargar las fotos automáticas (muebles).</p>
  }

  // Sin automáticas
  if (photos.length === 0) {
    if (hasOwnPhotos) return null
    // Restauración: el mueble existe pero no está publicado → la web no lo usa
    const unpublished = mode === 'restoration' && result.furniture != null && !isPublishedWork(result.furniture)
    return (
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <p className="text-xs text-muted-foreground">{unpublished ? RESTORATION_UNPUBLISHED_TEXT : texts.emptyText}</p>
        {linkButton}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <GroupedPhotoRow count={photos.length}>
        {photos.map((photo, index) => (
          <GroupedAutoPhotoCard
            key={photo.key}
            photo={photo}
            onOpen={() => onOpenPhoto(photos, index)}
            variantLabel={getPhotoVariantLabel(config, photo)}
          />
        ))}
      </GroupedPhotoRow>

      <p className="text-xs text-muted-foreground">{texts.helpText}</p>

      <div className="flex flex-wrap items-center gap-2">
        {onPersonalize && (
          <Button type="button" size="sm" variant="outline" className="h-8" onClick={onPersonalize}>
            <Copy className="mr-1.5 size-3.5" />Personalizar fotos
          </Button>
        )}
        {linkButton}
      </div>
    </div>
  )
}
