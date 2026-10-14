'use client'

// Vista agrupada (hero de Servicios y carrusel de categorías).
// Encabezado de un item (nombre, Visible/Oculto, contador de fotos, menú ⋮).
// Lo general de imágenes de sección vive fuera de esta carpeta (ver grouped/README.md).

import { useState } from 'react'
import * as AccordionPrimitive from '@radix-ui/react-accordion'
import { ChevronDown, FileText, MoreVertical, Trash2 } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Checkbox } from '@/shared/ui/checkbox'
import { Switch } from '@/shared/ui/switch'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { cn } from '@/shared/lib/utils'
import type { SectionItemApiItem } from '@/features/section-items/model/sectionitemget.dto'
import { getGroupItemName, type GroupedSectionConfig } from '../grouped-section.config'
import { GroupedItemTitleEditor } from './grouped-item-title-editor'

interface GroupedItemHeaderProps {
  /** Textos y reglas de la sección (ver grouped-section.config.ts). */
  config: GroupedSectionConfig
  item: SectionItemApiItem
  /** Posición del item (0, 1, 2...) para mostrar "01 ·", "02 ·"... */
  index: number
  /** Fotos visibles del item (para el contador y para saber si se puede mostrar). */
  visibleCount: number
  /** Total de fotos del item (visibles + ocultas). Si no viene, el contador solo muestra las visibles. */
  totalCount?: number
  /** Texto del contador en lugar de "N fotos" (ej. "Fotos automáticas (del mueble)"). */
  counterOverride?: string | null
  onRename: (title: string) => Promise<boolean>
  onToggleVisible: (visible: boolean) => Promise<void>
  /** Opciones del menú ⋮. Si no viene ninguna, no se muestra el menú. */
  onEditDetails?: () => void
  onDelete?: () => void
  /** Checkbox "todas las fotos de este item": true, false o 'indeterminate'. Si no viene, no se muestra. */
  selectAllState?: boolean | 'indeterminate'
  onSelectAll?: (checked: boolean) => void
}

/**
 * Encabezado de un item (va DENTRO de un AccordionItem con la clase `group/item`):
 * checkbox "todas las fotos" (si se pasa), número, nombre (editable si la sección lo permite),
 * Visible/Oculto, contador y, si se pasan, menú ⋮.
 *
 * Todo el encabezado abre/cierra el acordeón: el botón del acordeón (Trigger) se estira
 * detrás de todo el encabezado (absolute inset-0). Los controles que NO deben abrir/cerrar
 * (checkbox, lápiz/input del nombre, switch Visible/Oculto y menú ⋮) van ENCIMA con `relative z-10`,
 * así el clic les llega a ellos y no al Trigger. No hay botones dentro de botones.
 */
export function GroupedItemHeader({
  config, item, index, visibleCount, totalCount, counterOverride, onRename, onToggleVisible, onEditDetails, onDelete, selectAllState, onSelectAll,
}: GroupedItemHeaderProps) {
  const [isToggling, setIsToggling] = useState(false)

  const name = getGroupItemName(config, item)
  const number = String(index + 1).padStart(2, '0')
  const isVisible = item.sectionitem_state === 1
  const hasMenu = !!onEditDetails || !!onDelete

  // Regla SOLO del hero de Servicios: un servicio sin fotos visibles no puede mostrarse (se vería vacío).
  // Si está oculto y no tiene fotos visibles, el switch no se puede encender.
  // (En el carrusel de categorías no aplica: sin fotos propias la web usa las de los trabajos.)
  const usesPhotoRule = config.hideItemWithoutVisiblePhotos
  const cannotShow = usesPhotoRule && !isVisible && visibleCount === 0

  // Contador: "5 fotos · 2 visibles" si se conoce el total; si no, solo las visibles.
  // Si viene counterOverride (fotos automáticas), se muestra ese texto.
  const photoCounter = totalCount != null && totalCount !== visibleCount
    ? `${totalCount} foto${totalCount !== 1 ? 's' : ''} · ${visibleCount} visible${visibleCount !== 1 ? 's' : ''}`
    : `${visibleCount} foto${visibleCount !== 1 ? 's' : ''}`
  const counterText = counterOverride || photoCounter

  const handleToggle = async (checked: boolean) => {
    setIsToggling(true)
    await onToggleVisible(checked)
    setIsToggling(false)
  }

  // Nombre: en negrita (más tenue si está oculto)
  const nameText = <span className={cn('truncate py-1.5 text-sm font-semibold', !isVisible && 'text-muted-foreground')}>{name}</span>

  return (
    // relative: el Trigger de abajo se estira sobre todo este bloque. En celular se acomoda en 2 líneas.
    <div className="relative flex flex-wrap items-center gap-x-3 gap-y-1 px-3 py-2">
      {/* Botón del acordeón (Enter/Espacio también abren/cierran): ocupa todo el encabezado */}
      <AccordionPrimitive.Header className="absolute inset-0 m-0">
        <AccordionPrimitive.Trigger
          aria-label={`Mostrar u ocultar las fotos de ${name}`}
          className="h-full w-full cursor-pointer rounded-lg outline-none transition-colors hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
        />
      </AccordionPrimitive.Header>

      <div className="flex min-w-0 flex-1 basis-full items-center gap-1 sm:basis-0">
        {/* Seleccionar todas las fotos del item (encima del Trigger: no abre/cierra) */}
        {onSelectAll && (
          <label className="relative z-10 mr-1 flex size-7 shrink-0 cursor-pointer items-center justify-center pointer-coarse:size-9">
            <Checkbox
              checked={selectAllState ?? false}
              onCheckedChange={(checked) => onSelectAll(checked === true)}
              aria-label={`Seleccionar todas las fotos de ${name}`}
              className="pointer-coarse:size-5"
            />
          </label>
        )}
        <span className="shrink-0 text-sm font-semibold tabular-nums text-muted-foreground">{number} ·</span>
        {/* Nombre: con lápiz (editable en línea) solo si la sección lo permite (config.canRenameInline) */}
        {config.canRenameInline ? (
          <GroupedItemTitleEditor title={item.sectionitem_title ?? ''} ofTheItem={config.ofTheItem} onSave={onRename}>
            {nameText}
          </GroupedItemTitleEditor>
        ) : nameText}
        {/* Flecha: solo indica el estado (gira si el item está abierto) */}
        <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]/item:rotate-180" />
      </div>

      <div className="flex w-full flex-wrap items-center justify-between gap-x-3 gap-y-1 sm:w-auto sm:justify-end">
        {/* Visible / Oculto en la web (encima del Trigger: no abre/cierra) */}
        <label
          className={cn('relative z-10 flex items-center gap-2 text-xs', cannotShow ? 'cursor-not-allowed' : 'cursor-pointer')}
          title={cannotShow ? `Muestra al menos una foto para poder mostrar ${config.thisItem}.` : undefined}
        >
          <Switch
            checked={isVisible}
            disabled={isToggling || cannotShow}
            onCheckedChange={(checked) => void handleToggle(checked)}
          />
          <span className={cn('w-12', isVisible ? 'text-foreground' : 'text-muted-foreground')}>{isVisible ? 'Visible' : config.hiddenLabel}</span>
        </label>

        {/* Contador de fotos (sin tope: la web muestra todas las visibles). En ámbar si 0 visibles solo con la regla del hero */}
        <span className={cn('text-xs tabular-nums', usesPhotoRule && visibleCount === 0 ? 'text-amber-600' : 'text-muted-foreground')}>
          {counterText}
        </span>

        {/* Menú del item (encima del Trigger: no abre/cierra) */}
        {hasMenu && (
          <div className="relative z-10">
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost" className="size-8 pointer-coarse:size-9">
                  <MoreVertical className="size-4" />
                  <span className="sr-only">Acciones {config.ofTheItem}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {onEditDetails && (
                  <DropdownMenuItem onClick={onEditDetails}>
                    <FileText className="mr-2 size-4" />{config.editItemLabel}
                  </DropdownMenuItem>
                )}
                {onEditDetails && onDelete && <DropdownMenuSeparator />}
                {onDelete && (
                  <DropdownMenuItem onClick={onDelete} className="text-red-500!">
                    <Trash2 className="mr-2 size-4" />{config.deleteItemLabel}
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </div>
  )
}
