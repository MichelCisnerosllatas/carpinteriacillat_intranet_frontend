'use client'

import { Eye, MoreHorizontal, Pencil, CheckCircle2, XCircle, Trash2, Sofa } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Checkbox } from '@/shared/ui/checkbox'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { getStateOption } from '@/shared/config/entity-states'
import type { Furniture } from '../../data/schema'

interface FurnitureCardProps {
  item: Furniture
  isSelected: boolean
  onToggleSelect: () => void
  onView: () => void
  onEdit: () => void
  onToggleState: () => void
  onDelete: () => void
}

export function FurnitureCard({
  item,
  isSelected,
  onToggleSelect,
  onView,
  onEdit,
  onToggleState,
  onDelete,
}: FurnitureCardProps) {
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
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full flex-col items-center justify-center gap-2">
            <Sofa className="size-10 text-muted-foreground/30" />
            <span className="text-[11px] text-muted-foreground/50">Sin imagen</span>
          </div>
        )}

        {/* Status badge */}
        <div className="absolute right-2 top-2">
          <Badge
            variant="outline"
            className={cn('bg-background/85 text-xs backdrop-blur-sm', stateOpt.badge)}
          >
            {stateOpt.label}
          </Badge>
        </div>

        {/* Checkbox */}
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
        <div>
          <h3 className="line-clamp-1 text-sm font-semibold leading-tight">{item.name}</h3>
          {item.description && (
            <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{item.description}</p>
          )}
        </div>

        <div className="flex flex-wrap gap-1">
          <Badge variant="secondary" className="text-[10px] font-normal">{item.categoryName}</Badge>
          <Badge variant="outline"   className="text-[10px] font-normal">{item.typecolorName}</Badge>
          <Badge variant="outline"   className="text-[10px] font-normal">{item.typewoodName}</Badge>
        </div>

        {(item.largo != null || item.ancho != null) && (
          <p className="text-[11px] text-muted-foreground/70">
            {[
              item.largo != null && `${item.largo} cm largo`,
              item.ancho != null && `${item.ancho} cm ancho`,
            ].filter(Boolean).join(' × ')}
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t px-3 py-2">
        <Button size="sm" variant="ghost" className="h-7 gap-1.5 px-2 text-xs" onClick={onView}>
          <Eye className="size-3.5" /> Ver detalle
        </Button>
        <div className="flex items-center gap-0.5">
          <Button size="icon" variant="ghost" className="size-7" onClick={onEdit} title="Editar">
            <Pencil className="size-3.5" />
          </Button>
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost" className="size-7">
                <MoreHorizontal className="size-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={onToggleState}>
                {isActive
                  ? <><XCircle className="mr-2 size-4 text-orange-500" />Desactivar</>
                  : <><CheckCircle2 className="mr-2 size-4 text-teal-500" />Activar</>
                }
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
