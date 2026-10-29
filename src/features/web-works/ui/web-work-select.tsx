'use client'

import { useEffect, useState } from 'react'
import { AlertCircle, Check, ChevronsUpDown, Loader2, RefreshCw } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/shared/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover'
import { useWebWorkSelectStore } from '../stores/useWebWorkSelectStore'

interface WebWorkSelectProps {
  value?: number | null
  onValueChange: (value: number | null) => void
  placeholder?: string
  disabled?: boolean
  /** Agrega la opción "Ninguno" (value null) al inicio. */
  allowNone?: boolean
  /** Solo trabajos visibles en la web (webwork_state = 1). */
  onlyVisible?: boolean
}

export function WebWorkSelect({
  value,
  onValueChange,
  placeholder = 'Seleccionar trabajo...',
  disabled,
  allowNone = false,
  onlyVisible = false,
}: WebWorkSelectProps) {
  const [open, setOpen] = useState(false)
  const { options, isLoading, isError, load, setForceReload } = useWebWorkSelectStore()

  useEffect(() => { void load() }, [])

  const list     = onlyVisible ? options.filter((o) => o.webwork_state === 1) : options
  const selected = value != null ? options.find((o) => o.id_web_work === value) : null
  const label    = selected ? selected.webwork_title : value === null && allowNone ? 'Ninguno' : placeholder

  if (isError) return (
    <div className="grid grid-cols-2 h-9 w-full items-center rounded-md border border-destructive/40 bg-background px-3 text-sm">
      <span className="flex items-center gap-1.5 text-destructive text-xs">
        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
        Error al cargar
      </span>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => { setForceReload(true); void load() }}
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
            <span className={cn('min-w-0 truncate', !selected && 'text-muted-foreground')}>{label}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar trabajo..." />
          <CommandList>
            <CommandEmpty>Sin resultados.</CommandEmpty>
            <CommandGroup>
              {allowNone && (
                <CommandItem value="__none__" onSelect={() => { onValueChange(null); setOpen(false) }}>
                  <Check className={cn('mr-2 h-4 w-4', value === null ? 'opacity-100' : 'opacity-0')} />
                  Ninguno
                </CommandItem>
              )}
              {list.map((opt) => (
                <CommandItem
                  key={opt.id_web_work}
                  value={`${opt.webwork_title} ${opt.id_web_work}`}
                  onSelect={() => { onValueChange(opt.id_web_work); setOpen(false) }}
                >
                  <Check className={cn('mr-2 h-4 w-4', value === opt.id_web_work ? 'opacity-100' : 'opacity-0')} />
                  <span className="min-w-0 flex-1 truncate">{opt.webwork_title}</span>
                  {opt.type && <span className="ml-2 shrink-0 text-xs text-muted-foreground">{opt.type.typework_name}</span>}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
