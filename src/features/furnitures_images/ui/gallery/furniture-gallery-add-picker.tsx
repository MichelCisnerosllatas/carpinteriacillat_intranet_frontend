'use client'

import { useEffect, useRef, useState } from 'react'
import {
  AlertCircle, Check, ChevronLeft, ChevronRight,
  ImageOff, Loader2, RefreshCw, Search, X,
} from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/dialog'
import { cn } from '@/shared/lib/utils'
import { imagesService } from '@/features/images/services/images.service'
import { getImageUrl, getImageDisplayName } from '@/features/images/lib/image-url'
import type { ImageApiItem } from '@/features/images/model/imageget.dto'

const PER_PAGE = 20

export type PickedImage = {
  imageId: number
  imageUrl: string
  imageName: string
}

interface FurnitureGalleryAddPickerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  existingImageIds: number[]
  onConfirm: (picked: PickedImage[]) => void
}

export function FurnitureGalleryAddPicker({
  open,
  onOpenChange,
  existingImageIds,
  onConfirm,
}: FurnitureGalleryAddPickerProps) {
  const [search, setSearch]       = useState('')
  const [page, setPage]           = useState(1)
  const [lastPage, setLastPage]   = useState(1)
  const [total, setTotal]         = useState(0)
  const [items, setItems]         = useState<ImageApiItem[]>([])
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState(false)
  const [localSel, setLocalSel]   = useState<Map<number, PickedImage>>(new Map())
  const searchTimer               = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchPage = async (p: number, q: string) => {
    setLoading(true)
    setError(false)
    try {
      const res = await imagesService.getList({
        page: p,
        per_page: PER_PAGE,
        ...((q.trim() ? { search: q.trim() } : {}) as object),
      } as Parameters<typeof imagesService.getList>[0])
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

  // Fetch when dialog opens (controlled dialog — onOpenChange(true) never fires externally)
  useEffect(() => {
    if (open) {
      setLocalSel(new Map())
      setSearch('')
      void fetchPage(1, '')
    }
  }, [open])

  const handleOpenChange = (v: boolean) => {
    onOpenChange(v)
  }

  const handleSearch = (q: string) => {
    setSearch(q)
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => fetchPage(1, q), 400)
  }

  const toggleItem = (item: ImageApiItem) => {
    const id = item.id_image
    setLocalSel((prev) => {
      const next = new Map(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.set(id, {
          imageId: id,
          imageUrl: getImageUrl(item.image_patch),
          imageName: getImageDisplayName(item),
        })
      }
      return next
    })
  }

  const handleConfirm = () => {
    onConfirm(Array.from(localSel.values()))
    onOpenChange(false)
  }

  const newCount = localSel.size

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl gap-3">
        <DialogHeader>
          <DialogTitle>Seleccionar imágenes para galería</DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-2 rounded-lg border px-3 py-2">
          <Search className="size-3.5 shrink-0 text-muted-foreground" />
          <input
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            placeholder="Buscar imagen..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
          />
          {search && (
            <button
              type="button"
              onClick={() => { setSearch(''); void fetchPage(1, '') }}
            >
              <X className="size-3.5 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>

        <div className="min-h-[280px]">
          {loading ? (
            <div className="flex h-[280px] items-center justify-center">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="flex h-[280px] flex-col items-center justify-center gap-2 text-muted-foreground">
              <AlertCircle className="size-5 text-destructive" />
              <p className="text-xs text-destructive">Error al cargar imágenes</p>
              <button
                type="button"
                onClick={() => fetchPage(1, search)}
                className="group mt-1 flex items-center gap-1 text-xs hover:text-foreground transition-colors"
              >
                <RefreshCw className="size-3.5 transition-transform duration-300 group-hover:rotate-180" />
                Reintentar
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className="flex h-[280px] flex-col items-center justify-center gap-2 text-muted-foreground">
              <ImageOff className="size-5" />
              <p className="text-xs">Sin resultados</p>
            </div>
          ) : (
            <div className="grid max-h-[280px] grid-cols-5 gap-2 overflow-y-auto pr-0.5 sm:grid-cols-6">
              {items.map((item) => {
                const imgUrl    = getImageUrl(item.image_patch)
                const imgName   = getImageDisplayName(item)
                const isExisting = existingImageIds.includes(item.id_image)
                const isNewSel  = localSel.has(item.id_image)
                const isChecked = isExisting || isNewSel
                return (
                  <button
                    key={item.id_image}
                    type="button"
                    onClick={() => !isExisting && toggleItem(item)}
                    disabled={isExisting}
                    className={cn(
                      'group relative aspect-square overflow-hidden rounded-xl border-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                      isExisting
                        ? 'cursor-not-allowed border-primary/30 opacity-50'
                        : isNewSel
                          ? 'border-primary ring-1 ring-primary/40'
                          : 'border-transparent hover:border-primary/40',
                    )}
                  >
                    <img
                      src={imgUrl}
                      alt={imgName}
                      className="h-full w-full object-cover transition-transform duration-150 group-hover:scale-105"
                      onError={(e) => {
                        ;(e.target as HTMLImageElement).style.display = 'none'
                      }}
                    />
                    {isChecked && (
                      <div className="absolute inset-0 flex items-center justify-center bg-primary/25">
                        <span className="flex size-5 items-center justify-center rounded-full bg-primary shadow">
                          <Check className="size-3 text-primary-foreground" />
                        </span>
                      </div>
                    )}
                    <div className="pointer-events-none absolute bottom-0 left-0 right-0 translate-y-full rounded-b-xl bg-black/80 px-1 py-0.5 text-[8px] text-white transition-transform duration-150 group-hover:translate-y-0 truncate">
                      {imgName}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {!loading && !error && lastPage > 1 && (
          <div className="flex items-center justify-between border-t pt-2">
            <span className="text-xs text-muted-foreground">
              {total} imagen{total !== 1 ? 'es' : ''}
            </span>
            <div className="flex items-center gap-1">
              <Button type="button" variant="ghost" size="icon" className="size-7" disabled={page <= 1} onClick={() => fetchPage(page - 1, search)}>
                <ChevronLeft className="size-3.5" />
              </Button>
              <span className="min-w-[48px] text-center text-xs text-muted-foreground">{page} / {lastPage}</span>
              <Button type="button" variant="ghost" size="icon" className="size-7" disabled={page >= lastPage} onClick={() => fetchPage(page + 1, search)}>
                <ChevronRight className="size-3.5" />
              </Button>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleConfirm} disabled={newCount === 0}>
            {newCount > 0
              ? `Agregar ${newCount} imagen${newCount !== 1 ? 'es' : ''}`
              : 'Selecciona imágenes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
