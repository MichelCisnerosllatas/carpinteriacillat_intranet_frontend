'use client'

import { useEffect, useState } from 'react'
import { Check, ChevronsUpDown, Loader2, AlertCircle, ImageOff } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/shared/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover'
import { useImageSelectStore } from '../stores/useImageSelectStore'

interface ImageSelectProps {
  value: number | null
  onValueChange: (value: number | null) => void
  placeholder?: string
  disabled?: boolean
  showAll?: boolean
}

export function ImageSelect({
  value,
  onValueChange,
  placeholder = 'Seleccionar imagen',
  disabled = false,
  showAll = false,
}: ImageSelectProps) {
  const { options, isLoading, isError, load } = useImageSelectStore()
  const [open, setOpen] = useState(false)

  useEffect(() => { void load() }, [])

  const selected = value != null ? options.find((o) => o.id_image === value) : null

  if (isLoading) {
    return (
      <Button variant="outline" disabled className="w-full justify-start font-normal">
        <Loader2 className="mr-2 size-4 animate-spin" />
        Cargando imágenes...
      </Button>
    )
  }

  if (isError) {
    return (
      <Button variant="outline" disabled className="w-full justify-start font-normal text-destructive">
        <AlertCircle className="mr-2 size-4" />
        Error al cargar imágenes
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
          <span className="flex items-center gap-2 truncate">
            {selected ? (
              <>
                <img
                  src={selected.imageUrl}
                  alt={selected.displayName}
                  className="size-5 rounded object-cover shrink-0"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                />
                <span className="truncate">{selected.displayName}</span>
              </>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </span>
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar imagen..." />
          <CommandList>
            <CommandEmpty>Sin resultados.</CommandEmpty>
            <CommandGroup>
              {showAll && (
                <CommandItem
                  value="__none__"
                  onSelect={() => { onValueChange(null); setOpen(false) }}
                >
                  <Check className={cn('mr-2 size-4', value == null ? 'opacity-100' : 'opacity-0')} />
                  <ImageOff className="mr-2 size-4 text-muted-foreground" />
                  Sin imagen
                </CommandItem>
              )}
              {options.map((o) => (
                <CommandItem
                  key={o.id_image}
                  value={o.displayName}
                  onSelect={() => { onValueChange(o.id_image); setOpen(false) }}
                >
                  <Check className={cn('mr-2 size-4', value === o.id_image ? 'opacity-100' : 'opacity-0')} />
                  <img
                    src={o.imageUrl}
                    alt={o.displayName}
                    className="mr-2 size-6 rounded object-cover shrink-0"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                  />
                  <span className="truncate">{o.displayName}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
