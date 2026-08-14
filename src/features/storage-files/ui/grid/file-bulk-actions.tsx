'use client'

import { Loader2, MoveRight, Trash2, X } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'

interface FileBulkActionsProps {
  count:       number
  isActing:    boolean
  onMove:      () => void
  onDelete:    () => void
  onClear:     () => void
}

export function FileBulkActions({ count, isActing, onMove, onDelete, onClear }: FileBulkActionsProps) {
  if (count === 0) return null

  return (
    <div className={cn(
      'fixed bottom-6 left-1/2 -translate-x-1/2 z-50',
      // Fondo invertido: bg-card/bg-background quedan casi idénticos al fondo
      // de la página en modo oscuro y la barra se vuelve invisible. Con el
      // fondo invertido siempre contrasta contra la página en ambos temas.
      'flex items-center gap-2 rounded-2xl border border-foreground/10 bg-foreground text-background shadow-xl shadow-black/30 dark:shadow-black/60 px-4 py-2.5',
      'animate-in slide-in-from-bottom-4 duration-200',
    )}>
      <span className="text-sm font-medium mr-2">
        {count} archivo{count !== 1 ? 's' : ''} seleccionado{count !== 1 ? 's' : ''}
      </span>

      <Button
        variant="outline"
        size="sm"
        onClick={onMove}
        disabled={isActing}
        className="gap-1.5 h-8 text-foreground"
      >
        {isActing ? <Loader2 className="size-3.5 animate-spin" /> : <MoveRight className="size-3.5" />}
        Mover
      </Button>

      <Button
        variant="destructive"
        size="sm"
        onClick={onDelete}
        disabled={isActing}
        className="gap-1.5 h-8"
      >
        {isActing ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
        Eliminar
      </Button>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClear}
            disabled={isActing}
            className="size-8 rounded-lg"
          >
            <X className="size-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Deseleccionar todo</TooltipContent>
      </Tooltip>
    </div>
  )
}
