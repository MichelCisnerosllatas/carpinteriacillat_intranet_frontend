'use client'

// Vista agrupada (hero de Servicios y carrusel de categorías).
// Tarjeta de una foto de un item (foto, checkbox, rol Principal/Oculta y menú de acciones).
// Lo general de imágenes de sección vive fuera de esta carpeta (ver grouped/README.md).

import type { ReactNode } from 'react'
import { CheckCircle2, Eye, ImageIcon, MoreVertical, Pencil, Trash2, XCircle } from 'lucide-react'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Checkbox } from '@/shared/ui/checkbox'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { cn } from '@/shared/lib/utils'
import type { SectionImage } from '../../data/schema'
import type { ImageRole } from '../../lib/image-roles'
import { SectionImageRoleBadge } from '../../ui/list/sectionimage-role-badge'

/** Acciones del menú de cada foto (las decide el contenedor). */
export type GroupedPhotoActions = {
  onView: (image: SectionImage) => void
  /** Opcional: si no viene, el menú no muestra "Editar" (ej. Restauración edita las fotos de a par). */
  onEdit?: (image: SectionImage) => void
  onToggleState: (image: SectionImage) => void
  onDelete: (image: SectionImage) => void
}

interface GroupedPhotoCardProps {
  image: SectionImage
  role?: ImageRole | null
  /** Tocar la foto: abrirla en grande. */
  onOpen: (image: SectionImage) => void
  /** Menú ⋮ de la foto. Si no viene, no se muestra (ej. en "Reordenar"). */
  actions?: GroupedPhotoActions
  canDelete?: boolean
  /** Asa para arrastrar (la pone la tarjeta arrastrable de "Reordenar"). */
  dragHandle?: ReactNode
  /** Si la foto está marcada (selección masiva). */
  selected?: boolean
  /** true si hay alguna foto marcada: entonces todos los checkbox se ven siempre. */
  selectionActive?: boolean
  /** Marcar / desmarcar la foto. Si no viene, no se muestra el checkbox (ej. en "Reordenar"). */
  onSelectChange?: (checked: boolean) => void
  /** Badge de variante abajo a la izquierda (ej. Restauración: "Antes" / "Después"). Ver getPhotoVariantLabel. */
  variantLabel?: string | null
}

/**
 * Tarjeta limpia de una foto de la vista agrupada: la foto, su rol y el menú.
 * Todas las tarjetas tienen el mismo tamaño (aspect 4/3).
 */
export function GroupedPhotoCard({
  image, role, onOpen, actions, canDelete = true, dragHandle, selected = false, selectionActive = false, onSelectChange,
  variantLabel,
}: GroupedPhotoCardProps) {
  const isActive = image.stateValue === 1

  return (
    <div className="group relative aspect-[4/3] w-full overflow-hidden rounded-lg border bg-muted/40">
      {/* Foto: al tocarla se abre en grande (las ocultas se ven más tenues) */}
      {image.imageUrl ? (
        <button type="button" className="h-full w-full cursor-zoom-in" onClick={() => onOpen(image)}>
          <img
            src={image.imageUrl}
            alt={image.imageName}
            draggable={false}
            className={cn('h-full w-full object-cover', !isActive && 'opacity-50 grayscale')}
          />
        </button>
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-1 text-muted-foreground">
          <ImageIcon className="size-6" />
          <span className="text-[11px]">Sin imagen</span>
        </div>
      )}

      {/* Borde de color si la foto está marcada (encima de la foto, no bloquea los clics) */}
      {selected && <div className="pointer-events-none absolute inset-0 rounded-lg ring-2 ring-inset ring-primary" />}

      {/* Arriba a la izquierda: checkbox (si se pasa onSelectChange) + rol (Principal ★ / Oculta) */}
      <div className="pointer-events-none absolute left-1.5 top-1.5 flex items-center gap-1">
        {onSelectChange && (
          // Va FUERA del botón de la foto: tocar el checkbox no abre el visor.
          // Celular (pantalla chica o táctil): siempre visible. Desktop: al pasar el mouse o si ya hay selección.
          <label
            className={cn(
              'pointer-events-auto flex size-7 cursor-pointer items-center justify-center rounded-md bg-black/50 transition-opacity pointer-coarse:size-9',
              selected || selectionActive
                ? 'opacity-100'
                : 'opacity-0 group-hover:opacity-100 focus-within:opacity-100 max-sm:opacity-100 pointer-coarse:opacity-100',
            )}
          >
            <Checkbox
              checked={selected}
              onCheckedChange={(checked) => onSelectChange(checked === true)}
              aria-label={`Seleccionar foto ${image.imageName}`}
              className="border-white bg-white/20 pointer-coarse:size-5"
            />
          </label>
        )}
        <SectionImageRoleBadge role={role} className="shadow-sm" />
      </div>

      {/* Menú de acciones */}
      {actions && (
        <div className="absolute right-1.5 top-1.5">
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="secondary" className="size-7 bg-black/50 text-white hover:bg-black/70 pointer-coarse:size-9">
                <MoreVertical className="size-4" />
                <span className="sr-only">Acciones de la foto</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={() => actions.onView(image)}>
                <Eye className="mr-2 size-4" />Ver detalle
              </DropdownMenuItem>
              {actions.onEdit && (
                <DropdownMenuItem onClick={() => actions.onEdit?.(image)}>
                  <Pencil className="mr-2 size-4" />Editar
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => actions.onToggleState(image)}>
                {isActive
                  ? <><XCircle className="mr-2 size-4" />Ocultar</>
                  : <><CheckCircle2 className="mr-2 size-4" />Mostrar</>}
              </DropdownMenuItem>
              {canDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => actions.onDelete(image)} className="text-red-500!">
                    <Trash2 className="mr-2 size-4" />Eliminar
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Abajo a la izquierda: variante de la foto (ej. "Antes" / "Después" en Restauración) */}
      {variantLabel && (
        <Badge className="pointer-events-none absolute bottom-1.5 left-1.5 border-transparent bg-black/70 px-1.5 py-0 text-[10px] font-medium text-white shadow-sm">
          {variantLabel}
        </Badge>
      )}

      {/* Asa para arrastrar (solo en "Reordenar") */}
      {dragHandle && <div className="absolute bottom-1.5 right-1.5">{dragHandle}</div>}
    </div>
  )
}
