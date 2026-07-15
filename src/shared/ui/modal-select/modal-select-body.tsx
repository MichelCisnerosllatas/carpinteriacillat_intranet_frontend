'use client'

import { AlertCircle, Loader2, RefreshCw } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { ScrollArea } from '@/shared/ui/scroll-area'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table'
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
  selectLabel,
  highlightedIndex,
  onHighlight,
  onSelect,
}: ModalSelectBodyProps<T>) {
  if (isError) {
    return (
      <div className="flex flex-col items-center gap-2 px-6 py-10">
        <AlertCircle className="size-6 text-destructive" />
        <p className="text-sm text-destructive">{errorMessage ?? 'Error al cargar los datos'}</p>
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
      <div className="flex items-center justify-center gap-2 px-6 py-10 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Cargando...
      </div>
    )
  }

  return (
    <ScrollArea className="h-80 border-t">
      <Table>
        <TableHeader className="sticky top-0 z-10 bg-background">
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
          {items.length === 0 && (
            <TableRow>
              <TableCell colSpan={columns.length + 1} className="h-24 text-center text-sm text-muted-foreground">
                {emptyMessage}
              </TableCell>
            </TableRow>
          )}
          {items.map((item, index) => (
            <TableRow
              key={getId(item)}
              data-selected={index === highlightedIndex}
              onMouseEnter={() => onHighlight(index)}
              onClick={() => onSelect(item)}
              className={cn(
                'cursor-pointer',
                index === highlightedIndex && 'bg-accent'
              )}
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
    </ScrollArea>
  )
}
