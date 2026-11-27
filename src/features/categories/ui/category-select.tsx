'use client'

import { useEffect, useState } from 'react'
import { Check, ChevronsUpDown, Loader2, AlertCircle, RefreshCw, X } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/shared/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import { useCategorySelectStore } from '../stores/useCategorySelectStore'

interface CategorySelectProps {
  value: number | null
  onValueChange: (value: number | null) => void
  placeholder?: string
  disabled?: boolean
  showAll?: boolean
  /** Muestra una X dentro del select para dejarlo vacío (campos opcionales). */
  clearable?: boolean
}

export function CategorySelect({
  value,
  onValueChange,
  placeholder = 'Seleccionar categoría',
  disabled = false,
  showAll = false,
  clearable = false,
}: CategorySelectProps) {
  const { options, isLoading, isError, load, setForceReload } = useCategorySelectStore()
  const [open, setOpen] = useState(false)

  useEffect(() => { void load() }, [])

  const selected = value != null ? options.find((o) => o.id_category === value) : null
  const label    = selected ? selected.category_name : placeholder

  if (isError) {
    return (
      <div className="grid grid-cols-2 h-9 w-full items-center rounded-md border border-destructive/40 bg-background px-3 text-sm">
        <span className="flex items-center gap-1.5 text-destructive text-xs">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          Error al cargar
        </span>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => { setForceReload(true); load() }}
            className="group flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5 transition-transform duration-300 group-hover:rotate-180" />
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled || isLoading}
          className="w-full justify-between font-normal"
        >
          {isLoading ? (
            <span className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Cargando...
            </span>
          ) : (
            <span className={cn('min-w-0 truncate', !selected && 'text-muted-foreground')}>
              {label}
            </span>
          )}
          <span className="ml-2 flex shrink-0 items-center gap-1">
            {clearable && selected && !disabled && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span
                    role="button"
                    aria-label="Quitar categoría"
                    onClick={(e) => { e.stopPropagation(); onValueChange(null) }}
                    className="rounded p-0.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <X className="size-3.5" />
                  </span>
                </TooltipTrigger>
                <TooltipContent>Quitar categoría</TooltipContent>
              </Tooltip>
            )}
            <ChevronsUpDown className="size-4 opacity-50" />
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar categoría..." />
          <CommandList>
            <CommandEmpty>Sin resultados.</CommandEmpty>
            <CommandGroup>
              {showAll && (
                <CommandItem
                  value="__all__"
                  onSelect={() => { onValueChange(null); setOpen(false) }}
                >
                  <Check className={cn('mr-2 size-4', value == null ? 'opacity-100' : 'opacity-0')} />
                  Todas las categorías
                </CommandItem>
              )}
              {options.map((o) => (
                <CommandItem
                  key={o.id_category}
                  value={o.category_name}
                  onSelect={() => { onValueChange(o.id_category); setOpen(false) }}
                >
                  <Check className={cn('mr-2 size-4', value === o.id_category ? 'opacity-100' : 'opacity-0')} />
                  {o.category_name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
