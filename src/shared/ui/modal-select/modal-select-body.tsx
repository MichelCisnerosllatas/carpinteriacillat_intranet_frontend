'use client'

import { AlertCircle, Loader2, RefreshCw } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { ScrollArea } from '@/shared/ui/scroll-area'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import type { ModalSelectColumn } from './modal-select.types'

/**
 * Body del <ModalSelect />: única parte que scrollea (verticalmente).
 * El header y el footer quedan fijos porque viven fuera de este ScrollArea.
 */
interface ModalSelectBodyProps<T> {
  items: T[]
  isLoading?: boolean
  isError?: boolean
  errorMessage?: string
  onRetry?: () => void
  getId: (item: T) => string | number
  columns: ModalSelectColumn<T>[]
  emptyMessage: string
  emptyAction?: React.ReactNode
  selectLabel: string
  highlightedIndex: number
  onHighlight: (index: number) => void
  onSelect: (item: T) => void
}

export function ModalSelectBody<T>({
  items,
  isLoading,
  isError,
  errorMessage,
  onRetry,
  getId,
  columns,
  emptyMessage,
  emptyAction,
  selectLabel,
  highlightedIndex,
  onHighlight,
  onSelect,
}: ModalSelectBodyProps<T>) {
  if (isError) {
    return (
      <div className="flex h-full min-h-64 flex-col items-center justify-center gap-2 px-6 py-10">
        <AlertCircle className="text-destructive size-6" />
        <p className="text-destructive text-sm">{errorMessage ?? 'Error al cargar los datos'}</p>
        {onRetry && (
          <Button size="sm" variant="outline" onClick={onRetry}>
            <RefreshCw className="mr-1.5 size-3.5" />
            Reintentar
          </Button>
        )}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="text-muted-foreground flex h-full min-h-64 flex-col items-center justify-center gap-3 px-6 py-10">
        <Loader2 className="size-7 animate-spin" />
        <span className="text-sm">Cargando...</span>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="text-muted-foreground flex h-full min-h-64 flex-col items-center justify-center gap-3 px-6 py-10 text-center text-sm">
        {emptyMessage}
        {emptyAction}
      </div>
    )
  }

  return (
    <ScrollArea className="h-full border-t">
      {/* Mobile (< sm): tarjetas apiladas — una tabla ancha es difícil de leer y de scrollear
       * horizontalmente con el dedo en pantallas chicas. Sin botón "{selectLabel}" al pie: la
       * tarjeta entera ya es el control de selección (onClick abajo) — el usuario ya sabe que
       * tocarla la selecciona, así que el botón sería redundante y solo resta espacio. */}
      <div className="flex flex-col gap-2 p-2 sm:hidden">
        {items.map((item, index) => (
          <div
            key={getId(item)}
            onClick={() => onSelect(item)}
            className={cn(
              'flex cursor-pointer flex-col gap-2 rounded-lg border p-3',
              index === highlightedIndex && 'border-accent-foreground/30 bg-accent'
            )}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              {columns.map((col) => (
                <div key={col.header} className="min-w-0">
                  {col.cell(item)}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop (>= sm): tabla clásica */}
      <div className="hidden sm:block">
        <Table>
          <TableHeader className="bg-background sticky top-0 z-10">
            <TableRow>
              {columns.map((col) => (
                <TableHead key={col.header} className={col.className}>
                  {col.header}
                </TableHead>
              ))}
              <TableHead className="w-1 text-right">Acción</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item, index) => (
              <TableRow
                key={getId(item)}
                data-selected={index === highlightedIndex}
                onMouseEnter={() => onHighlight(index)}
                onClick={() => onSelect(item)}
                className={cn('cursor-pointer', index === highlightedIndex && 'bg-accent')}
              >
                {columns.map((col) => (
                  <TableCell key={col.header} className={col.className}>
                    {col.cell(item)}
                  </TableCell>
                ))}
                <TableCell className="text-right">
                  <Button
                    type="button"
                    size="sm"
                    variant={index === highlightedIndex ? 'default' : 'outline'}
                    onClick={(e) => {
                      e.stopPropagation()
                      onSelect(item)
                    }}
                  >
                    {selectLabel}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </ScrollArea>
  )
}
