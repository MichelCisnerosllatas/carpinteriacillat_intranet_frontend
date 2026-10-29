'use client'

import { useEffect, useMemo, useState } from 'react'
import { Check, ChevronsUpDown, Loader2, AlertCircle, Search, X, RefreshCw, Sofa } from 'lucide-react'
import apiClient from '@/shared/api/apiClient'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'

/**
 * Tipo mínimo de un trabajo de la galería web (`/v1/intranet/web-work`). Es local a propósito:
 * testimonios solo necesita id + título + tipo para elegir a qué trabajo pertenece la reseña,
 * sin depender del feature `web-works`.
 */
type TestimonyWebWorkOption = {
  id_web_work: number
  webwork_title: string
  webwork_state: number
  type?: { typework_key: string; typework_name: string } | null
}

type WebWorkListResponse = {
  success: boolean
  message: string
  data: TestimonyWebWorkOption[]
}

// Caché del módulo: la lista de trabajos se pide una sola vez por sesión de página
// (el form y el filtro de la tabla la comparten).
let cachedOptions: TestimonyWebWorkOption[] | null = null

interface WebWorkSelectProps {
  value:         number | null
  onValueChange: (value: number | null) => void
  placeholder?:  string
  disabled?:     boolean
  /** Texto de respaldo para el valor elegido mientras carga la lista (p. ej. el título que ya trae el testimonio). */
  selectedLabel?: string | null
}

export function WebWorkSelect({
  value,
  onValueChange,
  placeholder   = 'Seleccionar trabajo',
  disabled      = false,
  selectedLabel = null,
}: WebWorkSelectProps) {
  const [open,    setOpen]    = useState(false)
  const [search,  setSearch]  = useState('')
  const [items,   setItems]   = useState<TestimonyWebWorkOption[]>(cachedOptions ?? [])
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(false)

  const fetchAll = async (force = false) => {
    if (!force && cachedOptions) { setItems(cachedOptions); return }
    setLoading(true)
    setError(false)
    try {
      const { data } = await apiClient.get<WebWorkListResponse>('/v1/intranet/web-work', { params: { per_page: 100 } })
      if (data.success) {
        cachedOptions = data.data
        setItems(data.data)
      } else {
        setError(true)
      }
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  // Se carga al montar si ya hay un valor (para mostrar su título) o al abrir el popover.
  // Se difiere un tick (setTimeout) para no hacer setState de forma síncrona dentro del efecto.
  useEffect(() => {
    if (!open && value == null) return
    const t = window.setTimeout(() => void fetchAll(), 0)
    return () => window.clearTimeout(t)
  }, [open, value])

  const selected = useMemo(() => items.find((i) => i.id_web_work === value) ?? null, [items, value])
  const selectedText = selected?.webwork_title ?? (value != null ? (selectedLabel ?? `Trabajo #${value}`) : null)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return items
    return items.filter((i) => i.webwork_title.toLowerCase().includes(q))
  }, [items, search])

  const handleSelect = (item: TestimonyWebWorkOption) => {
    onValueChange(item.id_web_work)
    setOpen(false)
    setSearch('')
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
          className="h-10 w-full justify-between font-normal"
        >
          <span className="flex min-w-0 flex-1 items-center gap-2">
            {selectedText ? (
              <>
                <Sofa className="size-4 shrink-0 text-muted-foreground" />
                <span className="truncate text-sm">{selectedText}</span>
              </>
            ) : (
              <span className="text-sm text-muted-foreground">{placeholder}</span>
            )}
          </span>
          <span className="ml-2 flex shrink-0 items-center gap-1">
            {value != null && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span
                    role="button"
                    onClick={handleClear}
                    className="rounded p-0.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <X className="size-3.5" />
                  </span>
                </TooltipTrigger>
                <TooltipContent>Quitar trabajo seleccionado</TooltipContent>
              </Tooltip>
            )}
            <ChevronsUpDown className="size-4 opacity-50" />
          </span>
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[340px] p-0" align="start" sideOffset={4}>
        {/* Búsqueda local (la lista completa ya está cargada) */}
        <div className="flex items-center gap-2 border-b px-3 py-2">
          <Search className="size-3.5 shrink-0 text-muted-foreground" />
          <input
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            placeholder="Buscar trabajo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
          {search && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button type="button" onClick={() => setSearch('')} className="text-muted-foreground hover:text-foreground">
                  <X className="size-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Limpiar búsqueda</TooltipContent>
            </Tooltip>
          )}
        </div>

        <div className="min-h-[140px] max-h-[260px] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center gap-2 py-10">
              <AlertCircle className="size-5 text-destructive" />
              <p className="text-xs text-destructive">Error al cargar</p>
              <button type="button" onClick={() => void fetchAll(true)} className="group flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                <RefreshCw className="size-3.5 transition-transform duration-300 group-hover:rotate-180" />
                Reintentar
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-10 text-muted-foreground">
              <Sofa className="size-5" />
              <p className="text-xs">Sin resultados</p>
            </div>
          ) : (
            <div className="p-1">
              {filtered.map((item) => {
                const isSelected = value === item.id_web_work
                return (
                  <button
                    key={item.id_web_work}
                    type="button"
                    onClick={() => handleSelect(item)}
                    className={cn(
                      'flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted',
                      isSelected && 'bg-muted font-medium',
                    )}
                  >
                    <Sofa className="size-4 shrink-0 text-muted-foreground" />
                    <span className="flex min-w-0 flex-1 flex-col text-left">
                      <span className="truncate">{item.webwork_title}</span>
                      {(item.type || item.webwork_state !== 1) && (
                        <span className="truncate text-[11px] text-muted-foreground">
                          {[item.type?.typework_name, item.webwork_state !== 1 ? 'Oculto en la web' : null].filter(Boolean).join(' · ')}
                        </span>
                      )}
                    </span>
                    {isSelected && <Check className="size-4 shrink-0 text-primary" />}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {!loading && !error && items.length > 0 && (
          <div className="border-t px-3 py-2">
            <span className="text-[11px] text-muted-foreground">{filtered.length} trabajo{filtered.length !== 1 ? 's' : ''}</span>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
