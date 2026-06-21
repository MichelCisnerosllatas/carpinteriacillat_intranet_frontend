'use client'

import { useEffect, useState } from 'react'
import { AlertCircle, Check, ChevronsUpDown, Loader2, RefreshCw } from 'lucide-react'
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
import { useTypeWoodSelectStore } from '../stores/useTypeWoodSelectStore'

interface TypeWoodSelectProps {
  value?: number | null
  onValueChange: (value: number | null) => void
  placeholder?: string
  disabled?: boolean
  showAll?: boolean
}

export function TypeWoodSelect({
  value,
  onValueChange,
  placeholder = 'Seleccionar madera...',
  disabled,
  showAll = false,
}: TypeWoodSelectProps) {
  const [open, setOpen] = useState(false)
  const { options, isLoading, isError, load } = useTypeWoodSelectStore()

  useEffect(() => { load() }, [])

  const selected = value != null ? options.find((o) => o.id_typewood === value) : null
  const label    = selected ? selected.typewood_name : value === null && showAll ? 'Todos' : placeholder

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
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Reintentar
        </button>
      </div>
    </div>
  )

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
            <span className={cn(!selected && value !== null && 'text-muted-foreground')}>
              {label}
            </span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar madera..." />
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
                  key={opt.id_typewood}
                  value={opt.typewood_name}
                  onSelect={() => { onValueChange(opt.id_typewood); setOpen(false) }}
                >
                  <Check className={cn('mr-2 h-4 w-4', value === opt.id_typewood ? 'opacity-100' : 'opacity-0')} />
                  {opt.typewood_name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
