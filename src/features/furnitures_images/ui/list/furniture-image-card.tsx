'use client'

import { Eye, MoreHorizontal, CheckCircle2, XCircle, Trash2, ImageOff, Sofa, Pencil } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Checkbox } from '@/shared/ui/checkbox'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { cn } from '@/shared/lib/utils'
import { getStateOption } from '@/shared/config/entity-states'
import type { FurnitureImage } from '../../data/schema'

interface FurnitureImageCardProps {
  item: FurnitureImage
  isSelected: boolean
  onToggleSelect: () => void
  onView: () => void
  onEdit: () => void
  onToggleState: () => void
  onDelete: () => void
  onOpenLightbox: () => void
}

export function FurnitureImageCard({
  item,
  isSelected,
  onToggleSelect,
  onView,
  onEdit,
  onToggleState,
  onDelete,
  onOpenLightbox,
}: FurnitureImageCardProps) {
  const stateOpt = getStateOption(item.stateValue)
  const isActive = item.stateValue === 1

  return (
    <div
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-all duration-200 hover:shadow-md',
        isSelected && 'ring-2 ring-primary',
      )}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        {item.imageUrl ? (
          <button
            type="button"
            onClick={onOpenLightbox}
            className="h-full w-full cursor-zoom-in"
          >
            <img
              src={item.imageUrl}
              alt={item.imageName ?? ''}
              className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </button>
        ) : (
          <div className="flex size-full flex-col items-center justify-center gap-2">
            <ImageOff className="size-10 text-muted-foreground/30" />
            <span className="text-[11px] text-muted-foreground/50">Sin imagen</span>
          </div>
        )}

        <div className="absolute right-2 top-2">
          <Badge
            variant="outline"
            className={cn('bg-background/85 text-xs backdrop-blur-sm', stateOpt.badge)}
          >
            {stateOpt.label}
          </Badge>
        </div>

        <div className="absolute left-2 top-2">
          <Checkbox
            checked={isSelected}
            onCheckedChange={onToggleSelect}
            className="border-background/80 bg-background/85 backdrop-blur-sm"
            aria-label="Seleccionar"
          />
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-2 p-3">
        <div className="flex items-center gap-1.5">
          <Sofa className="size-3.5 shrink-0 text-muted-foreground" />
          <p className="line-clamp-1 text-sm font-medium">{item.furnitureName}</p>
        </div>
        {item.order != null && (
          <p className="text-[11px] text-muted-foreground">
            Orden en galería: <span className="font-semibold tabular-nums">{item.order}</span>
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t px-3 py-2">
        <Button size="sm" variant="ghost" className="h-7 gap-1.5 px-2 text-xs" onClick={onView}>
          <Eye className="size-3.5" /> Detalle
        </Button>
        <div className="flex items-center gap-0.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="ghost" className="size-7" onClick={onEdit}>
                <Pencil className="size-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Editar</TooltipContent>
          </Tooltip>
          <DropdownMenu modal={false}>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-flex">
                  <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="ghost" className="size-7">
                      <MoreHorizontal className="size-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                </span>
              </TooltipTrigger>
              <TooltipContent>Más acciones</TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={onToggleState}>
                {isActive
                  ? <><XCircle className="mr-2 size-4 text-orange-500" />Desactivar</>
                  : <><CheckCircle2 className="mr-2 size-4 text-teal-500" />Activar</>}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDelete} className="text-red-500!">
                <Trash2 className="mr-2 size-4" />Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}
