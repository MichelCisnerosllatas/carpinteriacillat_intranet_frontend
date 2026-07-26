'use client'

import { useEffect, useRef, useState } from 'react'
import { Check, ChevronsUpDown, Loader2, AlertCircle, Search, ChevronLeft, ChevronRight, X, RefreshCw, Sofa } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import { furnituresService } from '../services/furnitures.service'
import type { FurnitureJoinApiItem } from '../model/furniture-api-item.dto'

const PER_PAGE = 15

interface FurnitureSelectProps {
  value:         number | null
  onValueChange: (value: number | null) => void
  placeholder?:  string
  disabled?:     boolean
}

export function FurnitureSelect({
  value,
  onValueChange,
  placeholder = 'Seleccionar mueble',
  disabled    = false,
}: FurnitureSelectProps) {
  const [open,     setOpen]     = useState(false)
  const [search,   setSearch]   = useState('')
  const [page,     setPage]     = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [total,    setTotal]    = useState(0)
  const [items,    setItems]    = useState<FurnitureJoinApiItem[]>([])
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState(false)
  const [selected, setSelected] = useState<FurnitureJoinApiItem | null>(null)
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchPage = async (p: number, q: string) => {
    setLoading(true)
    setError(false)
    try {
      const res = await furnituresService.getList({
        page:     p,
        per_page: PER_PAGE,
        ...(q.trim() ? { search: q.trim() } : {}),
      })
      if (res.success) {
        setItems(res.data)
        setPage(res.meta?.current_page ?? p)
        setLastPage(res.meta?.last_page ?? 1)
        setTotal(res.meta?.total ?? res.data.length)
      } else {
        setError(true)
      }
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (value == null) { setSelected(null); return }
    const found = items.find((i) => i.id_furniture === value)
    if (found) { setSelected(found); return }
    furnituresService.getById(value).then((res) => {
      if (res.success && res.data) setSelected(res.data)
    }).catch(() => {})
  }, [value])

  useEffect(() => {
    if (open) fetchPage(1, '')
  }, [open])

  const handleSearch = (q: string) => {
    setSearch(q)
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => fetchPage(1, q), 400)
  }

  const handleSelect = (item: FurnitureJoinApiItem) => {
    onValueChange(item.id_furniture)
    setSelected(item)
    setOpen(false)
    setSearch('')
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onValueChange(null)
    setSelected(null)
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
            {selected ? (
              <>
                <Sofa className="size-4 shrink-0 text-muted-foreground" />
                <span className="truncate text-sm">{selected.furniture_name}</span>
              </>
            ) : (
              <span className="text-sm text-muted-foreground">{placeholder}</span>
            )}
          </span>
          <span className="ml-2 flex shrink-0 items-center gap-1">
            {selected && (
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
                <TooltipContent>Quitar mueble seleccionado</TooltipContent>
              </Tooltip>
            )}
            <ChevronsUpDown className="size-4 opacity-50" />
          </span>
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[340px] p-0" align="start" sideOffset={4}>
        {/* Search */}
        <div className="flex items-center gap-2 border-b px-3 py-2">
          <Search className="size-3.5 shrink-0 text-muted-foreground" />
          <input
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            placeholder="Buscar mueble..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            autoFocus
          />
          {search && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button type="button" onClick={() => { setSearch(''); fetchPage(1, '') }} className="text-muted-foreground hover:text-foreground">
                  <X className="size-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Limpiar búsqueda</TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* List */}
        <div className="min-h-[140px] max-h-[260px] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center gap-2 py-10">
              <AlertCircle className="size-5 text-destructive" />
              <p className="text-xs text-destructive">Error al cargar</p>
              <button type="button" onClick={() => fetchPage(1, search)} className="group flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                <RefreshCw className="size-3.5 transition-transform duration-300 group-hover:rotate-180" />
                Reintentar
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-10 text-muted-foreground">
              <Sofa className="size-5" />
              <p className="text-xs">Sin resultados</p>
            </div>
          ) : (
            <div className="p-1">
              {items.map((item) => {
                const isSelected = value === item.id_furniture
                return (
                  <button
                    key={item.id_furniture}
                    type="button"
                    onClick={() => handleSelect(item)}
                    className={cn(
                      'flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted',
                      isSelected && 'bg-muted font-medium',
                    )}
                  >
                    <Sofa className="size-4 shrink-0 text-muted-foreground" />
                    <span className="flex-1 truncate text-left">{item.furniture_name}</span>
                    {isSelected && <Check className="size-4 shrink-0 text-primary" />}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Pagination */}
        {!loading && !error && (lastPage > 1 || total > 0) && (
          <div className="flex items-center justify-between border-t px-3 py-2">
            <span className="text-[11px] text-muted-foreground">{total} mueble{total !== 1 ? 's' : ''}</span>
            {lastPage > 1 && (
              <div className="flex items-center gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button type="button" variant="ghost" size="icon" className="size-6" disabled={page <= 1 || loading} onClick={() => fetchPage(page - 1, search)}>
                      <ChevronLeft className="size-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Página anterior</TooltipContent>
                </Tooltip>
                <span className="min-w-[52px] text-center text-[11px] text-muted-foreground">{page} / {lastPage}</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button type="button" variant="ghost" size="icon" className="size-6" disabled={page >= lastPage || loading} onClick={() => fetchPage(page + 1, search)}>
                      <ChevronRight className="size-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Página siguiente</TooltipContent>
                </Tooltip>
              </div>
            )}
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
