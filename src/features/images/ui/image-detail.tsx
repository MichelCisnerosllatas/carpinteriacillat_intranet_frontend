'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CalendarDays, ExternalLink, ImageIcon, Trash2, FileImage, Maximize2 } from 'lucide-react'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Separator } from '@/shared/ui/separator'
import { swalDeleteConfirm } from '@/shared/lib/swal'
import { toastError, toastSuccess } from '@/shared/lib/toast'
import { formatBytes } from '../lib/image-url'
import { useImageListStore } from '../stores/useImageListStore'
import { useImageDeleteStore } from '../stores/useImageDeleteStore'

export function ImageDetail({ id }: { id: string }) {
  const router = useRouter()
  const { currentItem, items, setCurrentItem } = useImageListStore()
  const { deleteItem } = useImageDeleteStore()

  useEffect(() => {
    if (!currentItem || String(currentItem.id) !== id) {
      const found = items.find((i) => String(i.id) === id)
      if (found) setCurrentItem(found)
      else router.replace('/images')
    }
  }, [id, currentItem, items])

  const item = currentItem && String(currentItem.id) === id ? currentItem : null
  if (!item) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
        Cargando...
      </div>
    )
  }

  const displayName = item.name ?? item.patch.split('/').pop() ?? item.patch

  const handleDelete = async () => {
    const confirmed = await swalDeleteConfirm(`¿Eliminar "${displayName}"?`, 'Esta acción no se puede deshacer.')
    if (!confirmed) return
    const ok = await deleteItem(item.id)
    if (ok) {
      toastSuccess('Imagen eliminada', `"${displayName}" fue eliminada.`)
      router.push('/images')
    } else {
      toastError('Error al eliminar', 'No se pudo eliminar la imagen.')
    }
  }

  return (
    <div className="flex max-w-lg flex-col gap-4">
      {/* Preview */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                  <ImageIcon className="size-5 text-muted-foreground" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <h3 className="text-base font-semibold leading-none">{displayName}</h3>
                  <p className="text-xs text-muted-foreground break-all">{item.patch}</p>
                </div>
              </div>
              {item.type && (
                <Badge variant="secondary" className="shrink-0 text-xs">
                  {item.type.split('/')[1] ?? item.type}
                </Badge>
              )}
            </div>

            <div className="overflow-hidden rounded-lg border bg-muted/30">
              <img
                src={item.url}
                alt={item.alt ?? displayName}
                className="w-full max-h-64 object-contain"
                onError={(e) => {
                  const el = e.target as HTMLImageElement
                  el.parentElement!.innerHTML =
                    '<div class="flex h-32 items-center justify-center text-sm text-muted-foreground">No se pudo cargar la imagen</div>'
                }}
              />
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <a href={item.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="size-4 mr-1" />Ver original
                </a>
              </Button>
              <Button variant="destructive" size="sm" onClick={() => void handleDelete()}>
                <Trash2 className="size-4 mr-1" />Eliminar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metadata */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <FileImage className="size-4" />Metadatos
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm">
          {item.title && (
            <>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground shrink-0">Título</span>
                <span className="font-medium text-right">{item.title}</span>
              </div>
              <Separator />
            </>
          )}
          {item.alt && (
            <>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground shrink-0">Alt</span>
                <span className="font-medium text-right">{item.alt}</span>
              </div>
              <Separator />
            </>
          )}
          {item.type && (
            <>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground shrink-0">Tipo</span>
                <span className="font-medium">{item.type}</span>
              </div>
              <Separator />
            </>
          )}
          {item.size != null && (
            <>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground shrink-0">Tamaño</span>
                <span className="font-medium">{formatBytes(item.size)}</span>
              </div>
              <Separator />
            </>
          )}
          {item.width != null && item.height != null && (
            <>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground shrink-0">Dimensiones</span>
                <span className="font-medium flex items-center gap-1">
                  <Maximize2 className="size-3" />
                  {item.width} × {item.height} px
                </span>
              </div>
              <Separator />
            </>
          )}
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground shrink-0">Ruta</span>
            <span className="font-medium text-xs break-all text-right">{item.patch}</span>
          </div>
          <Separator />
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground shrink-0">URL completa</span>
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary underline break-all text-right max-w-[60%]"
            >
              {item.url}
            </a>
          </div>
          {item.createdAt && (
            <>
              <Separator />
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground shrink-0 flex items-center gap-1">
                  <CalendarDays className="size-3" />Creada
                </span>
                <span className="font-medium">{item.createdAt}</span>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
