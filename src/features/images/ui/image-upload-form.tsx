'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Lightbox from 'yet-another-react-lightbox'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails'
import 'yet-another-react-lightbox/styles.css'
import 'yet-another-react-lightbox/plugins/thumbnails.css'
import {
  AlertCircle, CheckCircle2, ImagePlus, Loader2,
  Plus, StopCircle, Upload, X, XCircle,
} from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Label } from '@/shared/ui/label'
import { Card, CardContent } from '@/shared/ui/card'
import { Separator } from '@/shared/ui/separator'
import { toastSuccess, toastError } from '@/shared/lib/toast'
import { imagesService } from '../services/images.service'
import { useImageSelectStore } from '../stores/useImageSelectStore'
import { useImageListStore } from '../stores/useImageListStore'
import { FolderPicker } from '@/shared/ui/folder-picker'
import { cn } from '@/shared/lib/utils'

type FileStatus = 'pending' | 'uploading' | 'done' | 'error'

type FileEntry = {
  id:      string
  file:    File
  preview: string | null
  status:  FileStatus
  error?:  string
}

let idCounter = 0
const nextId  = () => String(++idCounter)

export function ImageUploadForm() {
  const router = useRouter()
  const { reload }           = useImageSelectStore()
  const { load: reloadList } = useImageListStore()

  const [entries,     setEntries]     = useState<FileEntry[]>([])
  const [folder,      setFolder]      = useState('')
  const [dragOver,    setDragOver]    = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [lightboxIdx, setLightboxIdx] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      entries.forEach((e) => { if (e.preview) URL.revokeObjectURL(e.preview) })
    }
  }, [])

  const addFiles = (files: File[]) => {
    const valid: FileEntry[] = files
      .filter((f) => f.type.startsWith('image/'))
      .map((file) => ({
        id:      nextId(),
        file,
        preview: URL.createObjectURL(file),
        status:  'pending',
      }))
    setEntries((prev) => [...prev, ...valid])
  }

  const removeEntry = (id: string) => {
    setEntries((prev) => {
      const entry = prev.find((e) => e.id === id)
      if (entry?.preview) URL.revokeObjectURL(entry.preview)
      return prev.filter((e) => e.id !== id)
    })
  }

  const updateStatus = (id: string, status: FileStatus, error?: string) => {
    setEntries((prev) => prev.map((e) => e.id === id ? { ...e, status, error } : e))
  }

  const handleAbort = () => {
    abortRef.current?.abort()
  }

  const handleUpload = async () => {
    const pending = entries.filter((e) => e.status === 'pending' || e.status === 'error')
    if (!pending.length) return

    abortRef.current = new AbortController()
    const { signal } = abortRef.current
    setIsUploading(true)

    let done   = 0
    let errors = 0

    for (const entry of pending) {
      if (signal.aborted) {
        updateStatus(entry.id, 'pending')
        continue
      }

      updateStatus(entry.id, 'uploading')
      try {
        const name = entry.file.name.replace(/\.[^/.]+$/, '')
        const res  = await imagesService.post({
          image:       entry.file,
          image_name:  name,
          image_title: name,
          image_alt:   name,
          folder:      folder.trim() || undefined,
        })

        if (res.success) {
          done++
          updateStatus(entry.id, 'done')
        } else {
          errors++
          updateStatus(entry.id, 'error', res.message)
          abortRef.current?.abort()
        }
      } catch (err: any) {
        const isCanceled = err?.code === 'ERR_CANCELED' || err?.name === 'CanceledError' || err?.name === 'AbortError'
        if (isCanceled) {
          updateStatus(entry.id, 'pending')
        } else {
          errors++
          updateStatus(entry.id, 'error', err?.response?.data?.message ?? err?.message ?? 'Error al subir')
          abortRef.current?.abort()
        }
      }
    }

    setIsUploading(false)
    abortRef.current = null

    if (done > 0) {
      await Promise.all([reload(), reloadList({ page: 1 })])
    }

    if (done > 0 && errors === 0) {
      toastSuccess('Imágenes registradas', `${done} imagen${done !== 1 ? 'es' : ''} guardada${done !== 1 ? 's' : ''} correctamente.`)
      router.push('/images')
    } else if (errors > 0) {
      toastError('Subida parcial', `${done} correcta${done !== 1 ? 's' : ''}, ${errors} con error.`)
    }
  }

  const doneCount    = entries.filter((e) => e.status === 'done').length
  const errorCount   = entries.filter((e) => e.status === 'error').length
  const pendingCount = entries.filter((e) => e.status === 'pending').length
  const totalCount   = entries.length
  const allDone      = totalCount > 0 && doneCount + errorCount === totalCount

  // Lightbox slides (solo entradas con preview)
  const previewEntries = entries.filter((e) => e.preview)
  const lightboxSlides = previewEntries.map((e) => ({ src: e.preview!, alt: e.file.name }))
  const getLbIdx       = (entryId: string) => previewEntries.findIndex((e) => e.id === entryId)

  const progress = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0

  return (
    <>
      <form
        onSubmit={(e) => { e.preventDefault(); void handleUpload() }}
        className="flex flex-col gap-4 max-w-2xl"
      >
        <Card>
          <CardContent className="pt-6 flex flex-col gap-4">

            {/* ── Estado vacío: zona de arrastre grande ── */}
            {totalCount === 0 && (
              <DropZone
                dragOver={dragOver}
                onDragOver={() => setDragOver(true)}
                onDragLeave={() => setDragOver(false)}
                onDrop={(files) => { setDragOver(false); addFiles(files) }}
                onClick={() => inputRef.current?.click()}
                disabled={isUploading}
                compact={false}
              />
            )}

            {/* ── Con archivos: grid con scroll ── */}
            {totalCount > 0 && (
              <div className="max-h-[min(50vh,420px)] overflow-y-auto rounded-xl pr-0.5">
                <div
                  className={cn(
                    'grid gap-2',
                    totalCount <= 4  && 'grid-cols-4',
                    totalCount > 4   && 'grid-cols-5',
                    totalCount > 10  && 'grid-cols-6',
                  )}
                >
                  {entries.map((entry) => {
                    const lbIdx = getLbIdx(entry.id)
                    return (
                      <div
                        key={entry.id}
                        className={cn(
                          'group relative aspect-square overflow-hidden rounded-xl ring-1 ring-border',
                          entry.status === 'done'      && 'ring-emerald-400',
                          entry.status === 'error'     && 'ring-destructive',
                          entry.status === 'uploading' && 'ring-primary',
                        )}
                      >
                        {/* Miniatura — clic abre lightbox */}
                        {entry.preview ? (
                          <button
                            type="button"
                            onClick={() => entry.status !== 'uploading' && setLightboxIdx(lbIdx)}
                            className={cn(
                              'h-full w-full',
                              entry.status !== 'uploading' && 'cursor-zoom-in',
                            )}
                          >
                            <img
                              src={entry.preview}
                              alt={entry.file.name}
                              className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                            />
                          </button>
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-muted">
                            <ImagePlus className="size-5 text-muted-foreground" />
                          </div>
                        )}

                        {/* Overlay oscuro en hover (solo pending) */}
                        {entry.status === 'pending' && (
                          <div className="pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-200 group-hover:bg-black/30" />
                        )}

                        {/* Botón X — visible en hover, solo en pending */}
                        {entry.status === 'pending' && (
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); removeEntry(entry.id) }}
                            disabled={isUploading}
                            className="absolute right-1.5 top-1.5 flex size-6 items-center justify-center rounded-full bg-black/50 text-white opacity-0 backdrop-blur-sm transition-opacity duration-150 hover:bg-red-500 group-hover:opacity-100 disabled:cursor-not-allowed"
                          >
                            <X className="size-3.5" />
                          </button>
                        )}

                        {/* Status overlays */}
                        {entry.status === 'uploading' && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
                            <Loader2 className="size-6 animate-spin text-white" />
                          </div>
                        )}
                        {entry.status === 'done' && (
                          <div className="absolute inset-0 flex items-center justify-center bg-emerald-500/30 backdrop-blur-[1px]">
                            <CheckCircle2 className="size-6 text-white drop-shadow" />
                          </div>
                        )}
                        {entry.status === 'error' && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-destructive/60 backdrop-blur-[1px] p-1.5">
                            <XCircle className="size-5 text-white" />
                            {entry.error && (
                              <p className="line-clamp-2 text-center text-[9px] leading-tight text-white">{entry.error}</p>
                            )}
                          </div>
                        )}

                        {/* Nombre del archivo en hover (solo pending) */}
                        {entry.status === 'pending' && (
                          <div className="pointer-events-none absolute bottom-0 left-0 right-0 translate-y-full rounded-b-xl bg-black/80 px-2 py-1 text-[9px] text-white transition-transform group-hover:translate-y-0 truncate">
                            {entry.file.name}
                          </div>
                        )}
                      </div>
                    )
                  })}

                  {/* Tarjeta "Agregar más" */}
                  {!isUploading && !allDone && (
                    <button
                      type="button"
                      onClick={() => inputRef.current?.click()}
                      className="aspect-square rounded-xl border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary flex flex-col items-center justify-center gap-1"
                    >
                      <Plus className="size-5" />
                      <span className="text-[9px] font-medium">Agregar</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Input oculto */}
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => { if (e.target.files) addFiles(Array.from(e.target.files)); e.target.value = '' }}
            />

            {/* Zona de arrastre secundaria cuando ya hay archivos */}
            {totalCount > 0 && !isUploading && !allDone && (
              <div
                className={cn(
                  'hidden items-center justify-center rounded-xl border-2 border-dashed p-3 text-xs text-muted-foreground transition-colors',
                  dragOver && '!flex border-primary bg-primary/5 text-primary',
                )}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setDragOver(false); addFiles(Array.from(e.dataTransfer.files)) }}
              />
            )}

            {/* Barra de progreso */}
            {isUploading && (
              <div className="flex flex-col gap-1.5">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-center text-xs text-muted-foreground">
                  {doneCount} de {totalCount} completado{doneCount !== 1 ? 's' : ''}
                </p>
              </div>
            )}

            {/* Resumen al terminar */}
            {allDone && !isUploading && (
              <div className={cn(
                'flex items-center gap-2 rounded-xl px-4 py-3 text-sm',
                errorCount === 0
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                  : 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400',
              )}>
                {errorCount === 0
                  ? <CheckCircle2 className="size-4 shrink-0" />
                  : <AlertCircle className="size-4 shrink-0" />}
                <span>
                  {doneCount > 0 && `${doneCount} imagen${doneCount !== 1 ? 'es' : ''} registrada${doneCount !== 1 ? 's' : ''} correctamente.`}
                  {errorCount > 0 && ` ${errorCount} con error.`}
                </span>
              </div>
            )}

            {/* Carpeta destino */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">
                Carpeta destino
                <span className="ml-1 text-muted-foreground">(opcional · se aplica a todas)</span>
              </Label>
              <FolderPicker
                value={folder || undefined}
                onChange={setFolder}
                onClear={() => setFolder('')}
                placeholder="Seleccionar carpeta destino..."
                disabled={isUploading}
                rootPath="images"
              />
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Acciones */}
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            {!allDone && pendingCount > 0 && `${pendingCount} pendiente${pendingCount !== 1 ? 's' : ''}`}
            {errorCount > 0 && ` · ${errorCount} con error`}
          </p>
          <div className="flex gap-2">
            {isUploading ? (
              <Button type="button" variant="destructive" size="sm" onClick={handleAbort}>
                <StopCircle className="mr-2 size-4" />
                Cancelar subida
              </Button>
            ) : (
              <>
                <Button type="button" variant="outline" size="sm" onClick={() => router.push('/images')}>
                  {allDone ? 'Ir a galería' : 'Cancelar'}
                </Button>
                {!allDone && (
                  <Button type="submit" size="sm" disabled={pendingCount === 0}>
                    <Upload className="mr-2 size-4" />
                    {pendingCount > 1 ? `Subir ${pendingCount} imágenes` : 'Subir imagen'}
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </form>

      {/* Lightbox — fuera del form para evitar conflictos de eventos */}
      <Lightbox
        open={lightboxIdx >= 0}
        close={() => setLightboxIdx(-1)}
        index={lightboxIdx}
        slides={lightboxSlides}
        plugins={[Zoom, Thumbnails]}
        controller={{ closeOnBackdropClick: true }}
        zoom={{ maxZoomPixelRatio: 4 }}
        thumbnails={{ position: 'bottom', width: 72, height: 48, gap: 8, border: 0, borderRadius: 6 }}
        styles={{ root: { '--yarl__color_backdrop': 'rgba(0,0,0,0.92)' } }}
      />
    </>
  )
}

// ── DropZone ──────────────────────────────────────────────────────────────────

function DropZone({
  dragOver, onDragOver, onDragLeave, onDrop, onClick, disabled, compact,
}: {
  dragOver:    boolean
  onDragOver:  () => void
  onDragLeave: () => void
  onDrop:      (files: File[]) => void
  onClick:     () => void
  disabled:    boolean
  compact:     boolean
}) {
  return (
    <div
      onClick={onClick}
      onDragOver={(e) => { e.preventDefault(); onDragOver() }}
      onDragLeave={onDragLeave}
      onDrop={(e) => { e.preventDefault(); onDrop(Array.from(e.dataTransfer.files)) }}
      className={cn(
        'flex cursor-pointer select-none flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all',
        compact ? 'gap-1 p-3' : 'gap-3 p-10',
        dragOver
          ? 'border-primary bg-primary/5 scale-[0.99]'
          : 'border-border hover:border-primary/50 hover:bg-muted/30',
        disabled && 'pointer-events-none opacity-50',
      )}
    >
      <div className={cn(
        'flex items-center justify-center rounded-2xl bg-muted',
        compact ? 'size-8' : 'size-14',
      )}>
        <ImagePlus className={cn(compact ? 'size-4' : 'size-6', 'text-muted-foreground')} />
      </div>
      <div className="text-center">
        <p className={cn('font-medium', compact ? 'text-xs' : 'text-sm')}>
          {compact ? 'Agregar archivos' : 'Arrastra imágenes aquí'}
        </p>
        {!compact && (
          <p className="mt-0.5 text-xs text-muted-foreground">
            o haz clic para seleccionar · puedes elegir varias a la vez
          </p>
        )}
      </div>
    </div>
  )
}
