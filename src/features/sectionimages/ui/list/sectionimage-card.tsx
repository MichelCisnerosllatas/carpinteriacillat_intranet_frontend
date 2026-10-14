'use client'

import type { CSSProperties, ReactNode } from 'react'
import Link from 'next/link'
import { ImageIcon, MoreVertical, Eye, Pencil, CheckCircle2, XCircle, Trash2, CheckSquare, Square, Layers } from 'lucide-react'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { cn } from '@/shared/lib/utils'
import { getVisibilityStateOption } from '@/shared/config/entity-states'
import { getSectionImageFixLabel } from '../../data/data'
import type { SectionImage } from '../../data/schema'
import type { ImageRole } from '../../lib/image-roles'
import { SectionImageRoleBadge } from './sectionimage-role-badge'

export interface SectionImageCardProps {
  item: SectionImage
  /** Rol de la foto en la web (solo se pinta Principal ★ / Oculta). */
  role?: ImageRole | null
  /** Texto del item asignado, ej. "01 · Muebles a medida". Si no viene, se usa el título del item. */
  itemHeading?: string | null
  /** Asa para arrastrar la foto (la pone `SortableSectionImageCard`). Si no viene, no se muestra. */
  dragHandle?: ReactNode
  /** Oculta el badge de sección — se usa embebido en el tab "Imágenes" del detalle de una sección específica, donde ya es obvio a cuál pertenece. */
  hideSectionBadge?: boolean
  /** `web_settings.images_delete` — oculta la opción "Eliminar" del menú. Default `true` (comportamiento de siempre). */
  canDelete?: boolean
  isSelected: boolean
  onToggleSelect: (item: SectionImage) => void
  onOpenLightbox: (item: SectionImage) => void
  onView: (item: SectionImage) => void
  onEdit: (item: SectionImage) => void
  onToggleState: (item: SectionImage) => void
  onDelete: (item: SectionImage) => void
}

export function SectionImageCard({
  item,
  role,
  itemHeading,
  dragHandle,
  hideSectionBadge = false,
  canDelete = true,
  isSelected,
  onToggleSelect,
  onOpenLightbox,
  onView,
  onEdit,
  onToggleState,
  onDelete,
}: SectionImageCardProps) {
  const stateOpt = getVisibilityStateOption(item.stateValue)
  const isActive = item.stateValue === 1

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-lg border bg-card transition-all hover:shadow-md',
        isSelected && 'border-primary ring-2 ring-primary'
      )}
    >
      {/* Thumbnail — aspect-video (no aspect-square) a propósito: estas imágenes suelen ser
          banners/anchas de sección, y en ese formato se nota mejor la diferencia entre los
          distintos `object-fit` (cover recorta, contain deja franjas, etc.). */}
      <div className="relative aspect-video w-full overflow-hidden bg-muted/40">
        {item.imageUrl ? (
          <button
            type="button"
            className="h-full w-full cursor-zoom-in"
            onClick={() => onOpenLightbox(item)}
          >
            <img
              src={item.imageUrl}
              alt={item.imageName}
              draggable={false}
              className="h-full w-full transition-transform duration-200 group-hover:scale-105"
              style={{ objectFit: (item.objectFit as CSSProperties['objectFit']) ?? 'cover' }}
            />
          </button>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-1.5 text-muted-foreground">
            <ImageIcon className="size-7" />
            <span className="text-[11px]">Sin imagen</span>
          </div>
        )}

        {/* Checkbox de selección — visible en hover (mouse) o siempre en touch, igual que `ImageCard`. */}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onToggleSelect(item) }}
          className={cn(
            'absolute left-1.5 top-1.5 z-10 flex items-center justify-center rounded-full p-1 transition-opacity',
            'pointer-coarse:bg-black/40 pointer-coarse:p-2.5 pointer-coarse:opacity-100',
            isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          )}
        >
          {isSelected
            ? <CheckSquare className="size-5 text-primary drop-shadow" />
            : <Square className="size-5 text-white drop-shadow" />}
        </button>

        {/* Chip de object-fit — refleja en el listado cómo quedó configurado `sectionimage_fix`. */}
        <div className="pointer-events-none absolute bottom-1.5 left-1.5 z-10">
          <Badge variant="secondary" className="bg-black/60 text-[10px] font-normal text-white backdrop-blur-sm">
            {getSectionImageFixLabel(item.objectFit)}
          </Badge>
        </div>

        {/* Rol de la foto en la web (Principal ★ / Oculta) */}
        <div className="pointer-events-none absolute bottom-1.5 right-1.5 z-10">
          <SectionImageRoleBadge role={role} className="shadow-sm" />
        </div>

        {/* Menú de acciones */}
        <div
          className="absolute right-1.5 top-1.5 z-10 opacity-0 transition-opacity group-hover:opacity-100 pointer-coarse:opacity-100"
          onClick={(e) => e.stopPropagation()}
        >
          <DropdownMenu modal={false}>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-flex">
                  <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="secondary" className="size-7 bg-black/50 text-white hover:bg-black/70 pointer-coarse:size-9">
                      <MoreVertical className="size-4" />
                      <span className="sr-only">Más acciones</span>
                    </Button>
                  </DropdownMenuTrigger>
                </span>
              </TooltipTrigger>
              <TooltipContent>Más acciones</TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={() => onView(item)}>
                <Eye className="mr-2 size-4" />Ver detalle
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(item)}>
                <Pencil className="mr-2 size-4" />Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onToggleState(item)}>
                {isActive
                  ? <><XCircle className="mr-2 size-4" />Desactivar</>
                  : <><CheckCircle2 className="mr-2 size-4" />Activar</>}
              </DropdownMenuItem>
              {canDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onDelete(item)} className="text-red-500!">
                    <Trash2 className="mr-2 size-4" />Eliminar
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-col gap-1 p-2">
        <Link href={`/section-images/${item.id}`} className="truncate text-xs font-medium text-primary hover:underline">
          {item.imageName}
        </Link>
        <div className="flex flex-wrap items-center gap-1">
          {!hideSectionBadge && (
            <Badge variant="secondary" className="px-1 py-0 text-[10px] font-normal">{item.sectionName}</Badge>
          )}
          <Badge variant="outline" className={cn('px-1 py-0 text-[10px]', stateOpt.badge)}>{stateOpt.label}</Badge>
        </div>
        {/* Item al que pertenece la foto */}
        {item.idSectionItem != null && (
          <span className="flex items-center gap-1 truncate text-[10px] text-muted-foreground">
            <Layers className="size-3 shrink-0" />
            <span className="truncate">{itemHeading || item.sectionItemTitle || `Item #${item.idSectionItem}`}</span>
          </span>
        )}
        <div className="flex items-center justify-between gap-1">
          <span className="text-[10px] text-muted-foreground">{item.createdAtFormatted ?? item.createdAt}</span>
          {/* Asa para arrastrar y ordenar la foto dentro de su grupo */}
          {dragHandle}
        </div>
      </div>
    </div>
  )
}
