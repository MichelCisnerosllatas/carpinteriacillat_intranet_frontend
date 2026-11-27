// src/features/sales/ui/pos/autocomplete-input.tsx
'use client'

import { useState, type ReactNode, type RefObject } from 'react'
import { Input } from '@/shared/ui/input'
import { cn } from '@/shared/lib/utils'

interface AutocompleteInputProps<T> {
  inputRef: RefObject<HTMLInputElement | null>
  query: string
  onQueryChange: (value: string) => void
  /** Resultados YA filtrados por quien lo usa (así cada campo decide cómo buscar). */
  items: T[]
  getKey: (item: T) => string | number
  renderItem: (item: T) => ReactNode
  onPick: (item: T) => void
  placeholder?: string
  emptyText?: string
  /** true = muestra la lista apenas el campo recibe foco (cliente); false = solo al escribir. */
  openOnFocus?: boolean
  disabled?: boolean
  invalid?: boolean
  id?: string
}

/**
 * Campo de texto con lista de sugerencias, manejable 100% con teclado:
 * ↑↓ mueve el resaltado, Enter elige, Esc cierra la lista. Con mouse: clic en una sugerencia.
 * Se hizo propio (en vez del Command de shadcn dentro de un Popover) porque aquí el foco NUNCA
 * debe salir del input: el cajero escribe, pulsa Enter y sigue escribiendo el siguiente.
 */
export function AutocompleteInput<T>({
  inputRef,
  query,
  onQueryChange,
  items,
  getKey,
  renderItem,
  onPick,
  placeholder,
  emptyText = 'Sin resultados.',
  openOnFocus = false,
  disabled,
  invalid,
  id,
}: AutocompleteInputProps<T>) {
  const [open, setOpen] = useState(false)
  const [rawHighlighted, setHighlighted] = useState(0)
  // Si la lista se achicó y el resaltado quedó fuera, se vuelve al primero (siempre válido).
  const highlighted = rawHighlighted < items.length ? rawHighlighted : 0

  const pick = (item: T) => {
    onPick(item)
    setOpen(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Ctrl+Enter es "Emitir venta" (atajo global) — no se interfiere.
    if (e.ctrlKey || e.metaKey) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setOpen(true)
      if (items.length > 0) setHighlighted((prev) => (prev + 1) % items.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (items.length > 0) setHighlighted((prev) => (prev - 1 + items.length) % items.length)
    } else if (e.key === 'Enter') {
      if (open && items[highlighted]) {
        e.preventDefault()
        pick(items[highlighted])
      }
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  const showList = open && !disabled && (openOnFocus || query.trim() !== '')

  return (
    <div className="relative w-full">
      <Input
        id={id}
        ref={inputRef}
        value={query}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
        aria-invalid={invalid || undefined}
        role="combobox"
        aria-expanded={showList}
        onChange={(e) => {
          onQueryChange(e.target.value)
          // Al escribir, el resaltado vuelve al primer resultado.
          setHighlighted(0)
          setOpen(true)
        }}
        onFocus={(e) => {
          e.target.select()
          if (openOnFocus) setOpen(true)
        }}
        // Se cierra al perder el foco; el clic en una sugerencia usa onMouseDown con
        // preventDefault para que el input no pierda el foco antes de elegir.
        onBlur={() => setOpen(false)}
        onKeyDown={handleKeyDown}
      />

      {showList && (
        <ul
          role="listbox"
          className="bg-popover text-popover-foreground absolute top-full right-0 left-0 z-50 mt-1 max-h-72 overflow-y-auto rounded-md border p-1 shadow-md"
        >
          {items.length === 0 ? (
            <li className="text-muted-foreground px-3 py-2 text-sm">{emptyText}</li>
          ) : (
            items.map((item, index) => (
              <li
                key={getKey(item)}
                role="option"
                aria-selected={index === highlighted}
                onMouseDown={(e) => {
                  e.preventDefault()
                  pick(item)
                }}
                onMouseEnter={() => setHighlighted(index)}
                className={cn(
                  'cursor-pointer rounded-sm px-3 py-2 text-sm',
                  index === highlighted && 'bg-accent text-accent-foreground'
                )}
              >
                {renderItem(item)}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  )
}
