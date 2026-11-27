'use client'

// SOLO carrusel «Muebles a medida» (config.autoPhotos).
// Bloque "Fotos automáticas (de sus trabajos)" dentro de una tarjeta (pestaña Imágenes y Reordenar):
//   - Hay automáticas → fila de tarjetas "De un trabajo" + ayuda + "Personalizar fotos" + "Ver trabajos →".
//   - No hay automáticas ni propias → "Esta categoría aún no tiene fotos..." + "Ver trabajos →".
//   - Tiene propias y no hacen falta automáticas → no pinta nada.
// Ver grouped/README.md → "Fotos automáticas".

import Link from 'next/link'
import { Copy, Loader2 } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import type { AutoPhoto } from '../../lib/auto-photos'
import { AUTO_PHOTOS_LINK, AUTO_PHOTOS_TEXTS } from '../../lib/auto-photos-texts'
import { GroupedPhotoRow } from '../grouped-photo-row'
import { GroupedAutoPhotoCard } from './grouped-auto-photo-card'

interface GroupedAutoPhotosProps {
  /** Fotos automáticas de la tarjeta (ver useAutoPhotos). */
  photos: AutoPhoto[]
  /** true mientras se cargan los trabajos. */
  isLoading: boolean
  /** true si no se pudieron cargar los trabajos. */
  isError?: boolean
  /** true si la tarjeta tiene alguna foto propia (visible u oculta). */
  hasOwnPhotos: boolean
  /** Tocar una foto automática: abrirla en grande. */
  onOpenPhoto: (photos: AutoPhoto[], index: number) => void
  /** "Personalizar fotos". Si no viene, no se muestra el botón. */
  onPersonalize?: () => void
}

export function GroupedAutoPhotos({
  photos, isLoading, isError = false, hasOwnPhotos, onOpenPhoto, onPersonalize,
}: GroupedAutoPhotosProps) {
  const texts = AUTO_PHOTOS_TEXTS

  // Botón "Ver trabajos →" (lista de trabajos de la Galería)
  const linkButton = (
    <Button asChild size="sm" variant="ghost" className="h-8 px-2">
      <Link href={AUTO_PHOTOS_LINK}>{texts.linkLabel}</Link>
    </Button>
  )

  if (isLoading) {
    if (hasOwnPhotos) return null
    return (
      <p className="flex items-center gap-2 text-xs text-muted-foreground">
        <Loader2 className="size-3.5 animate-spin" />Cargando fotos de sus trabajos...
      </p>
    )
  }

  if (isError) {
    if (hasOwnPhotos) return null
    return <p className="text-xs text-destructive">{texts.errorText}</p>
  }

  // Sin automáticas
  if (photos.length === 0) {
    if (hasOwnPhotos) return null
    return (
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <p className="text-xs text-muted-foreground">{texts.emptyText}</p>
        {linkButton}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-medium text-muted-foreground">{texts.title}</p>
      <GroupedPhotoRow count={photos.length}>
        {photos.map((photo, index) => (
          <GroupedAutoPhotoCard
            key={photo.key}
            photo={photo}
            onOpen={() => onOpenPhoto(photos, index)}
            originLabel={texts.badgeLabel}
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
