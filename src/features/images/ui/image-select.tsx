'use client'

import { useEffect, useRef, useState } from 'react'
import { Check, ChevronsUpDown, Loader2, AlertCircle, ImageOff, Search, ChevronLeft, ChevronRight, X, RefreshCw } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover'
import { imagesService } from '../services/images.service'
import { getImageUrl, getImageDisplayName } from '../lib/image-url'
import type { ImageApiItem } from '../model/imageget.dto'

const PER_PAGE = 20

interface ImageSelectProps {
  value:         number | null
  onValueChange: (value: number | null) => void
  placeholder?:  string
  disabled?:     boolean
  showAll?:      boolean
}

export function ImageSelect({
  value,
  onValueChange,
  placeholder = 'Seleccionar imagen',
  disabled    = false,
  showAll     = false,
}: ImageSelectProps) {
  const [open,      setOpen]      = useState(false)
  const [search,    setSearch]    = useState('')
  const [page,      setPage]      = useState(1)
  const [lastPage,  setLastPage]  = useState(1)
  const [total,     setTotal]     = useState(0)
  const [items,     setItems]     = useState<ImageApiItem[]>([])
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState(false)
  const [selected,  setSelected]  = useState<ImageApiItem | null>(null)
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Fetch a page of images
  const fetchPage = async (p: number, q: string) => {
    setLoading(true)
    setError(false)
    try {
      const res = await imagesService.getList({
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

  // Fetch selected item details when value changes externally
  useEffect(() => {
    if (value == null) { setSelected(null); return }
    // Check if already in current items list
    const found = items.find((i) => i.id_image === value)
    if (found) { setSelected(found); return }
    // Fetch by id
    imagesService.getById(value).then((res) => {
      if (res.success && res.data) setSelected(res.data)
    }).catch(() => {})
  }, [value])

  // Load images when popover opens
  useEffect(() => {
    if (open) fetchPage(1, '')
  }, [open])

  // Debounced search
  const handleSearch = (q: string) => {
    setSearch(q)
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => fetchPage(1, q), 400)
  }

  const handleSelect = (item: ImageApiItem | null) => {
    onValueChange(item?.id_image ?? null)
    setSelected(item)
    setOpen(false)
    setSearch('')
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onValueChange(null)
    setSelected(null)
  }

  const selectedUrl  = selected ? getImageUrl(selected.image_patch) : null
  const selectedName = selected ? getImageDisplayName(selected) : null

  return (
    <Popover open={open} onOpenChange={(v) => { setOpen(v); if (!v) setSearch('') }}>
      {/* ── Trigger ── */}
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-full h-auto min-h-[40px] justify-between font-normal py-1.5 px-3"
        >
          <span className="flex items-center gap-2 min-w-0 flex-1">
            {selected ? (
              <>
                <span className="size-7 rounded overflow-hidden border shrink-0 bg-muted">
                  <img
                    src={selectedUrl!}
                    alt={selectedName!}
                    className="h-full w-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                  />
                </span>
                <span className="truncate text-sm">{selectedName}</span>
              </>
            ) : (
              <span className="text-muted-foreground text-sm">{placeholder}</span>
            )}
          </span>
          <span className="flex items-center gap-1 shrink-0 ml-2">
            {selected && (
              <span
                role="button"
                onClick={handleClear}
                className="rounded p-0.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <X className="size-3.5" />
              </span>
            )}
            <ChevronsUpDown className="size-4 opacity-50" />
          </span>
        </Button>
      </PopoverTrigger>

      {/* ── Dropdown panel ── */}
      <PopoverContent
        className="p-0 w-[380px]"
        align="start"
        sideOffset={4}
      >
        {/* Search */}
        <div className="flex items-center gap-2 border-b px-3 py-2">
          <Search className="size-3.5 shrink-0 text-muted-foreground" />
          <input
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            placeholder="Buscar imagen..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            autoFocus
          />
          {search && (
            <button
              type="button"
              onClick={() => { setSearch(''); fetchPage(1, '') }}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="min-h-[180px]">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center gap-2 py-10 text-muted-foreground">
              <AlertCircle className="size-5 text-destructive" />
              <p className="text-xs text-destructive">Error al cargar imágenes</p>
              <button
                type="button"
                onClick={() => fetchPage(1, search)}
                className="group flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mt-1"
              >
                <RefreshCw className="size-3.5 transition-transform duration-300 group-hover:rotate-180" />
                Reintentar
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-10 text-muted-foreground">
              <ImageOff className="size-5" />
              <p className="text-xs">Sin resultados</p>
            </div>
          ) : (
            <div className="p-2 grid grid-cols-4 gap-1.5 max-h-[260px] overflow-y-auto">
              {/* Opción Sin imagen */}
              {showAll && page === 1 && (
                <button
                  type="button"
                  onClick={() => handleSelect(null)}
                  className={cn(
                    'aspect-square rounded-lg border-2 flex flex-col items-center justify-center gap-1 text-muted-foreground transition-all hover:border-primary hover:text-primary text-[9px]',
                    value == null ? 'border-primary bg-primary/5 text-primary' : 'border-border',
                  )}
                >
                  {value == null && <Check className="size-3" />}
                  <ImageOff className="size-4" />
                  <span>Sin imagen</span>
                </button>
              )}

              {items.map((item) => {
                const imgUrl  = getImageUrl(item.image_patch)
                const imgName = getImageDisplayName(item)
                const isSelected = value === item.id_image
                return (
                  <button
                    key={item.id_image}
                    type="button"
                    onClick={() => handleSelect(item)}
                    className={cn(
                      'group relative aspect-square rounded-lg overflow-hidden border-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                      isSelected
                        ? 'border-primary ring-1 ring-primary/40'
                        : 'border-transparent hover:border-primary/40',
                    )}
                  >
                    <img
                      src={imgUrl}
                      alt={imgName}
                      className="h-full w-full object-cover transition-transform duration-150 group-hover:scale-105"
                      onError={(e) => {
                        const el = e.target as HTMLImageElement
                        el.style.display = 'none'
                      }}
                    />
                    {/* Checkmark overlay */}
                    {isSelected && (
                      <div className="absolute inset-0 flex items-center justify-center bg-primary/25">
                        <span className="flex items-center justify-center rounded-full bg-primary size-5 shadow">
                          <Check className="size-3 text-primary-foreground" />
                        </span>
                      </div>
                    )}
                    {/* Nombre al hover */}
                    <div className="pointer-events-none absolute bottom-0 left-0 right-0 translate-y-full bg-black/80 px-1 py-0.5 text-[8px] text-white transition-transform duration-150 group-hover:translate-y-0 truncate rounded-b-lg">
                      {imgName}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Paginación */}
        {!loading && !error && (lastPage > 1 || total > 0) && (
          <div className="flex items-center justify-between border-t px-3 py-2">
            <span className="text-[11px] text-muted-foreground">
              {total} imagen{total !== 1 ? 'es' : ''}
            </span>
            {lastPage > 1 && (
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-6"
                  disabled={page <= 1 || loading}
                  onClick={() => fetchPage(page - 1, search)}
                >
                  <ChevronLeft className="size-3.5" />
                </Button>
                <span className="text-[11px] text-muted-foreground min-w-[52px] text-center">
                  {page} / {lastPage}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-6"
                  disabled={page >= lastPage || loading}
                  onClick={() => fetchPage(page + 1, search)}
                >
                  <ChevronRight className="size-3.5" />
                </Button>
              </div>
            )}
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
