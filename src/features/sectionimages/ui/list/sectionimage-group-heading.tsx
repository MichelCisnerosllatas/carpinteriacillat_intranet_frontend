'use client'

import type { ReactNode } from 'react'
import { Layers } from 'lucide-react'
import { Badge } from '@/shared/ui/badge'
import { cn } from '@/shared/lib/utils'
import type { ImageItemGroup } from '../../lib/group-section-images'

interface SectionImageGroupHeadingProps {
  group: ImageItemGroup
  /** Texto antes del título, ej. "Servicios › Hero ›" (opcional). */
  prefix?: string
  /** Botón u otro contenido a la derecha (opcional). */
  action?: ReactNode
}

/**
 * Encabezado de un grupo de fotos: "01 · Título del item" + cantidad de fotos + ayuda.
 * Se usa en la vista agrupada y en la pantalla "Reordenar".
 */
export function SectionImageGroupHeading({ group, prefix, action }: SectionImageGroupHeadingProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2">
      <div className="flex flex-col gap-0.5">
        <h4 className="flex flex-wrap items-center gap-1.5 text-sm font-medium">
          <Layers className="size-4 text-muted-foreground" />
          {prefix && <span className="text-muted-foreground">{prefix}</span>}
          <span className={cn(group.idSectionItem == null && 'italic text-muted-foreground')}>{group.heading}</span>
          <Badge variant="secondary" className="px-1.5 py-0 text-[10px] font-normal">
            {group.images.length} foto{group.images.length !== 1 ? 's' : ''}
          </Badge>
        </h4>
        <p className="text-xs text-muted-foreground">
          {group.idSectionItem != null
            ? 'La 1ª foto visible es la principal.'
            : 'Estas fotos no pertenecen a ningún item. Edítalas para asignarles uno.'}
        </p>
      </div>
      {action}
    </div>
  )
}
