'use client'

import { useEffect, useState } from 'react'
import { Check, ChevronsUpDown, Loader2, AlertCircle, RefreshCw } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/shared/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover'
import { useSectionItemSelectStore } from '../stores/useSectionItemSelectStore'
import type { SectionItemApiItem } from '../model/sectionitemget.dto'

/** Etiqueta a mostrar para un ítem: título > label > key > "Item #id" como último recurso. */
const itemLabel = (o: SectionItemApiItem) =>
  o.sectionitem_title || o.sectionitem_label || o.sectionitem_key || `Item #${o.id_section_item}`

interface SectionItemSelectProps {
  value: number | null
  onValueChange: (value: number | null) => void
  placeholder?: string
  disabled?: boolean
  showAll?: boolean
  /** Cuando viene, la carga de opciones se filtra a los ítems de esta sección. */
  idSection?: number
}

export function SectionItemSelect({
  value,
  onValueChange,
  placeholder = 'Seleccionar item',
  disabled = false,
  showAll = false,
  idSection,
}: SectionItemSelectProps) {
  const { options, isLoading, isError, load, setForceReload } = useSectionItemSelectStore()
  const [open, setOpen] = useState(false)

  useEffect(() => { void load(idSection) }, [idSection])

  const selected = value != null ? options.find((o) => o.id_section_item === value) : null

  if (isLoading) {
    return (
      <Button variant="outline" disabled className="w-full justify-start font-normal">
        <Loader2 className="mr-2 size-4 animate-spin" />
        Cargando items...
      </Button>
    )
  }

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
            onClick={() => { setForceReload(true); load(idSection) }}
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
          disabled={disabled}
          className="w-full justify-between font-normal"
        >
          <span className="truncate">
            {selected ? itemLabel(selected) : <span className="text-muted-foreground">{placeholder}</span>}
          </span>
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar item..." />
          <CommandList>
            <CommandEmpty>Sin resultados.</CommandEmpty>
            <CommandGroup>
              {showAll && (
                <CommandItem
                  value="__all__"
                  onSelect={() => { onValueChange(null); setOpen(false) }}
                >
                  <Check className={cn('mr-2 size-4', value == null ? 'opacity-100' : 'opacity-0')} />
                  Todos los items
                </CommandItem>
              )}
              {options.map((o) => (
                <CommandItem
                  key={o.id_section_item}
                  value={itemLabel(o)}
                  onSelect={() => { onValueChange(o.id_section_item); setOpen(false) }}
                >
                  <Check className={cn('mr-2 size-4', value === o.id_section_item ? 'opacity-100' : 'opacity-0')} />
                  {itemLabel(o)}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
