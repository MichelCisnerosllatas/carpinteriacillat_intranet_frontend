'use client'

import { CheckCircle2, Loader2, Repeat, Trash2, XCircle, X } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Separator } from '@/shared/ui/separator'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { cn } from '@/shared/lib/utils'

export interface DataTableBulkStatusAction {
  value: string
  label: string
}

interface DataTableBulkActionsProps {
  selectedCount: number
  onActivate?: () => Promise<void> | void
  onDeactivate?: () => Promise<void> | void
  onDelete?: () => Promise<void> | void
  onClear: () => void
  isLoading?: boolean
  className?: string
  /** Estados válidos a los que se puede pasar TODA la selección actual (ya intersectados entre
   * las filas elegidas) — pensado para entidades con más de dos estados, donde Activar/Desactivar
   * no alcanza (ver `ProformasTable`). Si viene vacío no se muestra el botón. */
  statusActions?: DataTableBulkStatusAction[]
  onChangeStatus?: (value: string) => Promise<void> | void
}

export function DataTableBulkActions({
  selectedCount,
  onActivate,
  onDeactivate,
  onDelete,
  onClear,
  isLoading = false,
  className,
  statusActions,
  onChangeStatus,
}: DataTableBulkActionsProps) {
  if (selectedCount === 0) return null

  const showStatusMenu = Boolean(onChangeStatus && statusActions && statusActions.length > 0)

  return (
    <div
      className={cn(
        'fixed bottom-4 left-1/2 z-50 -translate-x-1/2 sm:bottom-6',
        // Fondo invertido a propósito: si usáramos bg-background, la barra
        // quedaría del mismo color que el fondo de la página (negro sobre
        // negro en modo oscuro) y se volvería invisible. Con el fondo
        // invertido siempre contrasta contra la página, sea cual sea el tema.
        //
        // max-w + overflow-x-auto: con todas las acciones + textos + el tamaño
        // más grande de pointer-coarse, el contenido puede superar el ancho de
        // la pantalla en mobile. En vez de recortarse invisible fuera del
        // viewport, se hace scrolleable horizontalmente dentro de la propia
        // barra (y los textos se ocultan desde sm: para que ni haga falta).
        'flex max-w-[calc(100vw-2rem)] items-center gap-1 overflow-x-auto no-scrollbar rounded-xl border border-foreground/10 bg-foreground px-3 py-2 text-background shadow-xl shadow-black/30 dark:shadow-black/60 sm:gap-2 sm:px-4 sm:py-2.5',
        'animate-in fade-in slide-in-from-bottom-4 duration-200',
        className
      )}
    >
      {isLoading ? (
        <Loader2 className="size-4 shrink-0 animate-spin text-background/60" />
      ) : (
        <span className="shrink-0 whitespace-nowrap text-sm font-medium">
          {selectedCount}
          <span className="hidden sm:inline"> {selectedCount === 1 ? 'seleccionado' : 'seleccionados'}</span>
        </span>
      )}

      <Separator orientation="vertical" className="h-5 shrink-0 bg-background/20" />

      {showStatusMenu && (
        <>
          <Tooltip>
            <TooltipTrigger asChild>
              {/* El `span` intermedio evita que el `data-state` del tooltip pise el del propio
                  DropdownMenuTrigger — mismo patrón que en `ProformasRowActions`. */}
              <span className="inline-flex">
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={isLoading}
                      className="h-7 gap-1.5 px-2 pointer-coarse:h-9 pointer-coarse:px-3"
                    >
                      <Repeat className="size-3.5" />
                      <span className="hidden sm:inline">Cambiar estado</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="center">
                    {statusActions!.map((opt) => (
                      <DropdownMenuItem
                        key={opt.value}
                        onClick={() => void onChangeStatus!(opt.value)}
                      >
                        {opt.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </span>
            </TooltipTrigger>
            <TooltipContent className="sm:hidden">Cambiar estado</TooltipContent>
          </Tooltip>
          <Separator orientation="vertical" className="h-5 shrink-0 bg-background/20" />
        </>
      )}

      {onActivate && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              disabled={isLoading}
              onClick={() => void onActivate()}
              className="h-7 gap-1.5 px-2 text-teal-400 hover:bg-teal-950 hover:text-teal-300 dark:text-teal-700 dark:hover:bg-teal-50 dark:hover:text-teal-800 pointer-coarse:h-9 pointer-coarse:px-3"
            >
              <CheckCircle2 className="size-3.5" />
              <span className="hidden sm:inline">Activar</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent className="sm:hidden">Activar</TooltipContent>
        </Tooltip>
      )}

      {onDeactivate && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              disabled={isLoading}
              onClick={() => void onDeactivate()}
              className="h-7 gap-1.5 px-2 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200 dark:text-neutral-600 dark:hover:bg-neutral-100 dark:hover:text-neutral-800 pointer-coarse:h-9 pointer-coarse:px-3"
            >
              <XCircle className="size-3.5" />
              <span className="hidden sm:inline">Desactivar</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent className="sm:hidden">Desactivar</TooltipContent>
        </Tooltip>
      )}

      {onDelete && (
        <>
          <Separator orientation="vertical" className="h-5 shrink-0 bg-background/20" />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                disabled={isLoading}
                onClick={() => void onDelete()}
                className="h-7 gap-1.5 px-2 text-red-400 hover:bg-red-950 hover:text-red-300 dark:text-red-600 dark:hover:bg-red-50 dark:hover:text-red-700 pointer-coarse:h-9 pointer-coarse:px-3"
              >
                <Trash2 className="size-3.5" />
                <span className="hidden sm:inline">Eliminar</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent className="sm:hidden">Eliminar</TooltipContent>
          </Tooltip>
        </>
      )}

      <Separator orientation="vertical" className="h-5 shrink-0 bg-background/20" />

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            disabled={isLoading}
            onClick={onClear}
            className="size-7 shrink-0 pointer-coarse:size-9"
          >
            <X className="size-3.5" />
            <span className="sr-only">Limpiar selección</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Limpiar selección</TooltipContent>
      </Tooltip>
    </div>
  )
}
