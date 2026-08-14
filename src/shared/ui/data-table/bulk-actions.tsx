'use client'

import { CheckCircle2, Loader2, Trash2, XCircle, X } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Separator } from '@/shared/ui/separator'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import { cn } from '@/shared/lib/utils'

interface DataTableBulkActionsProps {
  selectedCount: number
  onActivate?: () => Promise<void> | void
  onDeactivate?: () => Promise<void> | void
  onDelete?: () => Promise<void> | void
  onClear: () => void
  isLoading?: boolean
  className?: string
}

export function DataTableBulkActions({
  selectedCount,
  onActivate,
  onDeactivate,
  onDelete,
  onClear,
  isLoading = false,
  className,
}: DataTableBulkActionsProps) {
  if (selectedCount === 0) return null

  return (
    <div
      className={cn(
        'fixed bottom-6 left-1/2 z-50 -translate-x-1/2',
        // Fondo invertido a propósito: si usáramos bg-background, la barra
        // quedaría del mismo color que el fondo de la página (negro sobre
        // negro en modo oscuro) y se volvería invisible. Con el fondo
        // invertido siempre contrasta contra la página, sea cual sea el tema.
        'flex items-center gap-2 rounded-xl border border-foreground/10 bg-foreground px-4 py-2.5 text-background shadow-xl shadow-black/30 dark:shadow-black/60',
        'animate-in fade-in slide-in-from-bottom-4 duration-200',
        className
      )}
    >
      {isLoading ? (
        <Loader2 className="size-4 animate-spin text-background/60" />
      ) : (
        <span className="text-sm font-medium">
          {selectedCount} {selectedCount === 1 ? 'seleccionado' : 'seleccionados'}
        </span>
      )}

      <Separator orientation="vertical" className="h-5 bg-background/20" />

      {onActivate && (
        <Button
          variant="ghost"
          size="sm"
          disabled={isLoading}
          onClick={() => void onActivate()}
          className="h-7 gap-1.5 text-teal-400 hover:bg-teal-950 hover:text-teal-300 dark:text-teal-700 dark:hover:bg-teal-50 dark:hover:text-teal-800"
        >
          <CheckCircle2 className="size-3.5" />
          Activar
        </Button>
      )}

      {onDeactivate && (
        <Button
          variant="ghost"
          size="sm"
          disabled={isLoading}
          onClick={() => void onDeactivate()}
          className="h-7 gap-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200 dark:text-neutral-600 dark:hover:bg-neutral-100 dark:hover:text-neutral-800"
        >
          <XCircle className="size-3.5" />
          Desactivar
        </Button>
      )}

      {onDelete && (
        <>
          <Separator orientation="vertical" className="h-5 bg-background/20" />
          <Button
            variant="ghost"
            size="sm"
            disabled={isLoading}
            onClick={() => void onDelete()}
            className="h-7 gap-1.5 text-red-400 hover:bg-red-950 hover:text-red-300 dark:text-red-600 dark:hover:bg-red-50 dark:hover:text-red-700"
          >
            <Trash2 className="size-3.5" />
            Eliminar
          </Button>
        </>
      )}

      <Separator orientation="vertical" className="h-5 bg-background/20" />

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            disabled={isLoading}
            onClick={onClear}
            className="size-7"
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
