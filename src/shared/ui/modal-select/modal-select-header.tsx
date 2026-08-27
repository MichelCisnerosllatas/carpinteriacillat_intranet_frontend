'use client'

import { Plus, Search } from 'lucide-react'
import { DialogHeader, DialogTitle, DialogDescription } from '@/shared/ui/dialog'
import { Input } from '@/shared/ui/input'
import { Button } from '@/shared/ui/button'

/**
 * Header del <ModalSelect />: título + descripción (heredados del DialogHeader
 * estándar), un input de búsqueda debajo y, opcionalmente, un botón "Nuevo"
 * junto al buscador. El botón de cerrar (X) ya lo pone <DialogContent />
 * automáticamente, no se repite aquí.
 */
interface ModalSelectHeaderProps {
  title: string
  description?: string
  search: string
  onSearchChange: (value: string) => void
  searchPlaceholder?: string
  onSearchKeyDown?: (e: React.KeyboardEvent) => void
  onCreateNew?: () => void
  createLabel?: string
}

export function ModalSelectHeader({
  title,
  description,
  search,
  onSearchChange,
  searchPlaceholder = 'Buscar...',
  onSearchKeyDown,
  onCreateNew,
  createLabel,
}: ModalSelectHeaderProps) {
  return (
    <DialogHeader className="gap-3 p-6 pb-0">
      <div>
        <DialogTitle>{title}</DialogTitle>
        {description && <DialogDescription>{description}</DialogDescription>}
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={onSearchKeyDown}
            placeholder={searchPlaceholder}
            className="pl-9"
            autoFocus
          />
        </div>

        {onCreateNew && (
          <Button
            type="button"
            variant="outline"
            className="shrink-0 gap-1.5 pointer-coarse:px-3"
            onClick={onCreateNew}
          >
            <Plus className="size-4" />
            {createLabel ?? 'Nuevo'}
          </Button>
        )}
      </div>
    </DialogHeader>
  )
}
