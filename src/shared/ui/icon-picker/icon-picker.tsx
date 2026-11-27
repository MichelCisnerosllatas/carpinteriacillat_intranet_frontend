'use client'

import { useMemo, useState } from 'react'
import { Check, ChevronsUpDown, Search, X } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import { FaIcon } from './fa-icon'
import {
  FA_ICONS, FA_STYLE_LABELS, buildFaIconValue, parseFaIconValue,
  type FaIconEntry, type FaStyle,
} from './fontawesome-icons'

const FAMILY_OPTIONS: Array<{ value: FaStyle | 'all'; label: string }> = [
  { value: 'all', label: 'Todos' },
  { value: 'solid', label: FA_STYLE_LABELS.solid },
  { value: 'regular', label: FA_STYLE_LABELS.regular },
  { value: 'brands', label: FA_STYLE_LABELS.brands },
]

/** Cuántos resultados se pintan a la vez — son ~1900 iconos en total, sin virtualizar la
 * grilla completa sería pesado; con esto + búsqueda alcanza para encontrar cualquiera rápido. */
const MAX_RESULTS = 60

interface IconPickerProps {
  /** Valor a guardar en BD, ej. "fa-solid fa-phone" — mismo formato que espera el sitio público. */
  value: string | null
  onValueChange: (value: string | null) => void
  placeholder?: string
  disabled?: boolean
}

/**
 * Selector visual de iconos de Font Awesome Free — reemplaza el campo de texto libre donde el
 * usuario tenía que adivinar/recordar un nombre de icono. Solo ofrece iconos que de verdad
 * existen en el paquete instalado (`fontawesome-icons.ts`, generado desde node_modules), y
 * muestra el icono real + su nombre tanto en la grilla como ya elegido en el trigger.
 */
export function IconPicker({ value, onValueChange, placeholder = 'Seleccionar icono', disabled = false }: IconPickerProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [family, setFamily] = useState<FaStyle | 'all'>('all')

  const parsed = parseFaIconValue(value)

  const results = useMemo(() => {
    const q = search.trim().toLowerCase()
    const matches = (icon: FaIconEntry) => {
      if (family !== 'all' && !icon.svgs[family]) return false
      if (!q) return true
      if (icon.name.includes(q) || icon.label.toLowerCase().includes(q)) return true
      return icon.terms.some((t) => t.toLowerCase().includes(q))
    }
    const filtered: FaIconEntry[] = []
    for (const icon of FA_ICONS) {
      if (matches(icon)) filtered.push(icon)
      if (filtered.length >= MAX_RESULTS) break
    }
    return filtered
  }, [search, family])

  const handleSelect = (icon: FaIconEntry) => {
    const style = family !== 'all' ? family : icon.styles[0]
    onValueChange(buildFaIconValue(style, icon.name))
    setOpen(false)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onValueChange(null)
  }

  return (
    <Popover open={open} onOpenChange={(v) => { setOpen(v); if (!v) setSearch('') }}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-full h-auto min-h-[40px] justify-between font-normal py-1.5 px-3 data-[state=open]:border-primary data-[state=open]:ring-2 data-[state=open]:ring-primary/30"
        >
          <span className="flex items-center gap-2 min-w-0 flex-1">
            {parsed ? (
              <>
                <span className="flex size-6 shrink-0 items-center justify-center rounded border bg-muted">
                  <FaIcon value={value} className="size-3.5" />
                </span>
                <span className="truncate text-sm">
                  {getFaLabel(parsed.name)} <span className="text-muted-foreground">({FA_STYLE_LABELS[parsed.style]})</span>
                </span>
              </>
            ) : (
              <span className="text-muted-foreground text-sm">{placeholder}</span>
            )}
          </span>
          <span className="flex items-center gap-1 shrink-0 ml-2">
            {parsed && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span
                    role="button"
                    onClick={handleClear}
                    className="rounded p-0.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    <X className="size-3.5" />
                  </span>
                </TooltipTrigger>
                <TooltipContent>Quitar icono</TooltipContent>
              </Tooltip>
            )}
            <ChevronsUpDown className={cn('size-4 opacity-50 transition-transform duration-150', open && 'rotate-180 opacity-100')} />
          </span>
        </Button>
      </PopoverTrigger>

      <PopoverContent className="p-0 w-[380px]" align="start" sideOffset={4}>
        {/* Buscador */}
        <div className="flex items-center gap-2 border-b px-3 py-2">
          <Search className="size-3.5 shrink-0 text-muted-foreground" />
          <input
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            placeholder="Buscar icono... (ej. teléfono, flecha, facebook)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
          {search && (
            <button type="button" onClick={() => setSearch('')} className="text-muted-foreground hover:text-foreground">
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* Filtro de familia */}
        <div className="flex items-center gap-1 border-b px-2 py-1.5">
          {FAMILY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setFamily(opt.value)}
              className={cn(
                'rounded-md px-2 py-1 text-xs font-medium transition-colors',
                family === opt.value ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Grilla de resultados */}
        <div className="min-h-[180px] max-h-[280px] overflow-y-auto p-2">
          {results.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center gap-1.5 text-muted-foreground">
              <Search className="size-5" />
              <p className="text-xs">Sin resultados para &quot;{search}&quot;</p>
            </div>
          ) : (
            <div className="grid grid-cols-5 gap-1.5">
              {results.map((icon) => {
                const style = family !== 'all' ? family : icon.styles[0]
                const isSelected = parsed?.name === icon.name && parsed.style === style
                return (
                  <Tooltip key={`${icon.name}-${style}`}>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => handleSelect(icon)}
                        className={cn(
                          'flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border-2 p-1 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                          isSelected ? 'border-primary bg-primary/10' : 'border-transparent hover:border-primary/40 hover:bg-muted'
                        )}
                      >
                        <FaIcon value={buildFaIconValue(style, icon.name)} className="size-4" />
                        {isSelected && <Check className="absolute right-1 top-1 size-2.5 text-primary" />}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>{icon.label}</TooltipContent>
                  </Tooltip>
                )
              })}
            </div>
          )}
        </div>

        {results.length >= MAX_RESULTS && (
          <div className="border-t px-3 py-1.5 text-center text-[11px] text-muted-foreground">
            Mostrando los primeros {MAX_RESULTS} — seguí escribiendo para afinar la búsqueda.
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

function getFaLabel(name: string): string {
  return FA_ICONS.find((i) => i.name === name)?.label ?? name
}
