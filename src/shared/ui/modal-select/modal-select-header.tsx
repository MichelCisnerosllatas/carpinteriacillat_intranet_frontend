'use client'

import { Search } from 'lucide-react'
import { DialogHeader, DialogTitle, DialogDescription } from '@/shared/ui/dialog'
import { Input } from '@/shared/ui/input'

/**
 * Header del <ModalSelect />: título + descripción (heredados del DialogHeader
 * estándar) y un input de búsqueda debajo. El botón de cerrar (X) ya lo pone
 * <DialogContent /> automáticamente, no se repite aquí.
 */
interface ModalSelectHeaderProps {
  title: string
  description?: string
  search: string
  onSearchChange: (value: string) => void
  searchPlaceholder?: string
  onSearchKeyDown?: (e: React.KeyboardEvent) => void
}

export function ModalSelectHeader({
  title,
  description,
  search,
  onSearchChange,
  searchPlaceholder = 'Buscar...',
  onSearchKeyDown,
}: ModalSelectHeaderProps) {
  return (
    <DialogHeader className="gap-3 p-6 pb-0">
      <div>
        <DialogTitle>{title}</DialogTitle>
        {description && <DialogDescription>{description}</DialogDescription>}
      </div>

      <div className="relative">
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
    </DialogHeader>
  )
}
