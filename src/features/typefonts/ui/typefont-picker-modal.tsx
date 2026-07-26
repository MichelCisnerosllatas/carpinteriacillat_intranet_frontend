'use client'

import { useEffect, useMemo, useState } from 'react'
import { AlertCircle, Check, Loader2, RefreshCw, Search, Type as TypeIcon } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Badge } from '@/shared/ui/badge'
import { ScrollArea } from '@/shared/ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/shared/ui/dialog'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import { useGoogleFontsStore } from '../stores/useGoogleFontsStore'
import { fontFamilyStyle, loadGoogleFont } from '../lib/load-google-font'

interface TypeFontPickerModalProps {
  value: string
  onChange: (family: string) => void
  disabled?: boolean
  triggerPlaceholder?: string
  /** 'button' muestra un botón ancho con el nombre actual; 'icon' muestra solo un ícono de lupa (para ir junto a un input). */
  variant?: 'button' | 'icon'
}

const MAX_RESULTS = 80
const SAMPLE_TEXT = 'El veloz murciélago hindú comía feliz cardillo y kiwi.'

export function TypeFontPickerModal({ value, onChange, disabled, triggerPlaceholder = 'Elegir tipografía...', variant = 'button' }: TypeFontPickerModalProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [hovered, setHovered] = useState<string | null>(null)
  const { fonts, isLoading, isError, errorMessage, load } = useGoogleFontsStore()

  useEffect(() => { load() }, [])
  useEffect(() => { if (value) loadGoogleFont(value) }, [value])
  useEffect(() => { if (!open) setHovered(null) }, [open])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    const list = term ? fonts.filter((f) => f.family.toLowerCase().includes(term)) : fonts
    return list.slice(0, MAX_RESULTS)
  }, [fonts, search])

  useEffect(() => {
    if (open) filtered.slice(0, 30).forEach((f) => loadGoogleFont(f.family))
  }, [open, filtered])

  const previewFamily = hovered ?? value
  const previewFont = fonts.find((f) => f.family === previewFamily)

  return (
    <>
      {variant === 'icon' ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon"
              disabled={disabled}
              onClick={() => setOpen(true)}
              className="shrink-0"
            >
              <Search className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Explorar tipografías</TooltipContent>
        </Tooltip>
      ) : (
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          onClick={() => setOpen(true)}
          className="w-full justify-between font-normal"
        >
          <span className={cn('flex items-center gap-2 truncate', !value && 'text-muted-foreground')} style={fontFamilyStyle(value)}>
            <TypeIcon className="size-4 shrink-0 text-muted-foreground" />
            {value || triggerPlaceholder}
          </span>
        </Button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="flex max-h-[85vh] w-[calc(100%-2rem)] max-w-[calc(100%-2rem)] flex-col gap-4 p-0 sm:max-w-xl lg:max-w-3xl xl:max-w-4xl">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle>Elegir tipografía</DialogTitle>
            <DialogDescription>Explora las tipografías de Google Fonts. Pasa el puntero para ver la vista previa.</DialogDescription>
          </DialogHeader>

          <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-6 pb-6">
            <Input
              placeholder="Buscar tipografía..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />

            {isError ? (
              <div className="flex flex-col items-center gap-2 py-10">
                <AlertCircle className="size-6 text-destructive" />
                <p className="text-sm text-destructive">{errorMessage ?? 'Error al cargar tipografías'}</p>
                <Button size="sm" variant="outline" onClick={load}>
                  <RefreshCw className="mr-1.5 size-3.5" />Reintentar
                </Button>
              </div>
            ) : isLoading ? (
              <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />Cargando tipografías...
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                <ScrollArea className="h-64 min-w-0 rounded-md border sm:h-80 lg:h-96">
                  <div className="flex flex-col p-1">
                    {filtered.length === 0 && (
                      <p className="p-4 text-center text-sm text-muted-foreground">Sin resultados.</p>
                    )}
                    {filtered.map((font) => (
                      <button
                        key={font.family}
                        type="button"
                        onMouseEnter={() => setHovered(font.family)}
                        onFocus={() => setHovered(font.family)}
                        onClick={() => { onChange(font.family); setOpen(false) }}
                        className={cn(
                          'flex min-w-0 items-center gap-2 rounded-sm px-3 py-2 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground',
                          value === font.family && 'bg-accent/60'
                        )}
                      >
                        <Check className={cn('size-4 shrink-0', value === font.family ? 'opacity-100' : 'opacity-0')} />
                        <span className="min-w-0 truncate" style={fontFamilyStyle(font.family)}>{font.family}</span>
                      </button>
                    ))}
                  </div>
                </ScrollArea>

                <div className="flex h-64 min-w-0 flex-col gap-3 overflow-hidden rounded-md border bg-muted/30 p-4 sm:h-80 lg:h-96">
                  {previewFamily ? (
                    <>
                      <div className="flex min-w-0 items-center justify-between gap-2">
                        <span className="min-w-0 truncate text-xs font-medium text-muted-foreground">{previewFamily}</span>
                        {previewFont && <Badge variant="outline" className="shrink-0 text-[10px] capitalize">{previewFont.category}</Badge>}
                      </div>
                      <p className="min-w-0 truncate text-2xl leading-tight sm:text-3xl" style={fontFamilyStyle(previewFamily)}>Aa Bb Cc</p>
                      <p className="min-w-0 truncate text-xl font-bold leading-tight sm:text-2xl" style={fontFamilyStyle(previewFamily)}>{previewFamily}</p>
                      <p className="min-w-0 text-sm text-muted-foreground" style={fontFamilyStyle(previewFamily)}>{SAMPLE_TEXT}</p>
                      <p className="min-w-0 text-xs text-muted-foreground" style={fontFamilyStyle(previewFamily)}>0123456789</p>
                    </>
                  ) : (
                    <div className="flex flex-1 items-center justify-center text-center text-sm text-muted-foreground">
                      Pasa el puntero sobre una tipografía
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
