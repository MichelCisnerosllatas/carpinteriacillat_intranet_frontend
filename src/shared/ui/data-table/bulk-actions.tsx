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
        'flex items-center gap-2 rounded-xl border bg-background px-4 py-2.5 shadow-lg shadow-black/10',
        'animate-in fade-in slide-in-from-bottom-4 duration-200',
        className
      )}
    >
      {isLoading ? (
        <Loader2 className="size-4 animate-spin text-muted-foreground" />
      ) : (
        <span className="text-sm font-medium text-foreground">
          {selectedCount} {selectedCount === 1 ? 'seleccionado' : 'seleccionados'}
        </span>
      )}

      <Separator orientation="vertical" className="h-5" />

      {onActivate && (
        <Button
          variant="ghost"
          size="sm"
          disabled={isLoading}
          onClick={() => void onActivate()}
          className="h-7 gap-1.5 text-teal-700 hover:bg-teal-50 hover:text-teal-800 dark:text-teal-400 dark:hover:bg-teal-950"
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
          className="h-7 gap-1.5 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800"
        >
          <XCircle className="size-3.5" />
          Desactivar
        </Button>
      )}

      {onDelete && (
        <>
          <Separator orientation="vertical" className="h-5" />
          <Button
            variant="ghost"
            size="sm"
            disabled={isLoading}
            onClick={() => void onDelete()}
            className="h-7 gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="size-3.5" />
            Eliminar
          </Button>
        </>
      )}

      <Separator orientation="vertical" className="h-5" />

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
