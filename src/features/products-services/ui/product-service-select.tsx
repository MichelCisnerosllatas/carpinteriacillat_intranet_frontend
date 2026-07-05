'use client'

import { useEffect, useState } from 'react'
import { AlertCircle, Check, ChevronsUpDown, Loader2, Package, RefreshCw } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/shared/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/ui/popover'
import { useProductServiceSelectStore } from '../stores/useProductServiceSelectStore'

interface ProductServiceSelectProps {
  value?: number | null
  onValueChange: (value: number | null) => void
  placeholder?: string
  disabled?: boolean
  showAll?: boolean
}

// Selector liviano de productos/servicios — usado por proformas para armar líneas de detalle.
export function ProductServiceSelect({
  value,
  onValueChange,
  placeholder = 'Seleccionar producto o servicio...',
  disabled,
  showAll = false,
}: ProductServiceSelectProps) {
  const [open, setOpen] = useState(false)
  const { options, isLoading, isError, load } = useProductServiceSelectStore()

  useEffect(() => { load() }, [])

  const selected = value != null ? options.find((o) => o.id === value) : null
  const label    = selected ? selected.name : value === null && showAll ? 'Todos' : placeholder

  if (isError) return (
    <div className="grid grid-cols-2 h-9 w-full items-center rounded-md border border-destructive/40 bg-background px-3 text-sm">
      <span className="flex items-center gap-1.5 text-destructive text-xs">
        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
        Error al cargar
      </span>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={load}
          className="group flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5 transition-transform duration-300 group-hover:rotate-180" />
          Reintentar
        </button>
      </div>
    </div>
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
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
            <span className={cn('flex items-center gap-2 truncate', !selected && value !== null && 'text-muted-foreground')}>
              {selected && <Package className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />}
              <span className="truncate">{label}</span>
            </span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar producto o servicio..." />
          <CommandList>
            <CommandEmpty>Sin resultados.</CommandEmpty>
            <CommandGroup>
              {showAll && (
                <CommandItem
                  value="__all__"
                  onSelect={() => { onValueChange(null); setOpen(false) }}
                >
                  <Check className={cn('mr-2 h-4 w-4', value === null ? 'opacity-100' : 'opacity-0')} />
                  Todos
                </CommandItem>
              )}
              {options.map((opt) => (
                <CommandItem
                  key={opt.id}
                  value={opt.name}
                  onSelect={() => { onValueChange(opt.id); setOpen(false) }}
                >
                  <Check className={cn('mr-2 h-4 w-4', value === opt.id ? 'opacity-100' : 'opacity-0')} />
                  <span className="flex-1 truncate">{opt.name}</span>
                  <span className="ml-2 shrink-0 text-xs text-muted-foreground">
                    S/ {Number(opt.default_price).toFixed(2)}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
