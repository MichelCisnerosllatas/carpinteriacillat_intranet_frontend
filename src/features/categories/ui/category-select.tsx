'use client'

import { useEffect, useState } from 'react'
import { Check, ChevronsUpDown, Loader2, AlertCircle } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/shared/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover'
import { useCategorySelectStore } from '../stores/useCategorySelectStore'

interface CategorySelectProps {
  value: number | null
  onValueChange: (value: number | null) => void
  placeholder?: string
  disabled?: boolean
  showAll?: boolean
}

export function CategorySelect({
  value,
  onValueChange,
  placeholder = 'Seleccionar categoría',
  disabled = false,
  showAll = false,
}: CategorySelectProps) {
  const { options, isLoading, isError, load } = useCategorySelectStore()
  const [open, setOpen] = useState(false)

  useEffect(() => { void load() }, [])

  const selected = value != null ? options.find((o) => o.id_category === value) : null

  if (isLoading) {
    return (
      <Button variant="outline" disabled className="w-full justify-start font-normal">
        <Loader2 className="mr-2 size-4 animate-spin" />
        Cargando categorías...
      </Button>
    )
  }

  if (isError) {
    return (
      <Button variant="outline" disabled className="w-full justify-start font-normal text-destructive">
        <AlertCircle className="mr-2 size-4" />
        Error al cargar categorías
      </Button>
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
            {selected ? selected.category_name : <span className="text-muted-foreground">{placeholder}</span>}
          </span>
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
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
