'use client'

import { useRef, useState } from 'react'
import { CheckCircle2, ImagePlus, Loader2, Upload, X, XCircle } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/ui/dialog'
import { Label } from '@/shared/ui/label'
import { FolderPicker } from '@/shared/ui/folder-picker'
import { cn } from '@/shared/lib/utils'
import { imagesService } from '@/features/images/services/images.service'
import { getImageUrl } from '@/features/images/lib/image-url'
import { toastError } from '@/shared/lib/toast'
import type { PickedImage } from './furniture-gallery-add-picker'

type UploadEntry = {
  id: string
  file: File
  preview: string
  status: 'pending' | 'uploading' | 'done' | 'error'
  uploadedId?: number
  uploadedUrl?: string
  error?: string
}

let counter = 0
const nextId = () => String(++counter)

interface FurnitureGalleryUploadProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onUploaded: (images: PickedImage[]) => void
}

export function FurnitureGalleryUpload({
  open,
  onOpenChange,
  onUploaded,
}: FurnitureGalleryUploadProps) {
  const [entries, setEntries]       = useState<UploadEntry[]>([])
  const [folder, setFolder]         = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [dragOver, setDragOver]     = useState(false)
  const inputRef                    = useRef<HTMLInputElement>(null)

  const addFiles = (files: File[]) => {
    const valid = files
      .filter((f) => f.type.startsWith('image/'))
      .map((file) => ({
        id: nextId(),
        file,
        preview: URL.createObjectURL(file),
        status: 'pending' as const,
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

  const updateEntry = (id: string, patch: Partial<UploadEntry>) =>
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)))

  const handleUpload = async () => {
    const pending = entries.filter((e) => e.status === 'pending')
    if (!pending.length) return
    setIsUploading(true)

    const uploaded: PickedImage[] = []
    for (const entry of pending) {
      updateEntry(entry.id, { status: 'uploading' })
      try {
        const name = entry.file.name.replace(/\.[^/.]+$/, '')
        const res  = await imagesService.post({
          image:       entry.file,
          image_name:  name,
          image_title: name,
          image_alt:   name,
          folder:      folder.trim() || undefined,
        })
        if (res.success && res.data) {
          const url = getImageUrl(res.data.image_patch)
          uploaded.push({
            imageId:   res.data.id_image,
            imageUrl:  url,
            imageName: res.data.image_name ?? name,
          })
          updateEntry(entry.id, { status: 'done', uploadedId: res.data.id_image, uploadedUrl: url })
        } else {
          updateEntry(entry.id, { status: 'error', error: res.message })
          toastError('Error al subir', res.message)
          break
        }
      } catch (err: any) {
        const msg = err?.response?.data?.message ?? err?.message ?? 'Error inesperado'
        updateEntry(entry.id, { status: 'error', error: msg })
        toastError('Error al subir', msg)
        break
      }
    }

    setIsUploading(false)
    if (uploaded.length > 0) {
      onUploaded(uploaded)
      entries.forEach((e) => URL.revokeObjectURL(e.preview))
      setEntries([])
      onOpenChange(false)
    }
  }

  const handleClose = () => {
    if (isUploading) return
    entries.forEach((e) => URL.revokeObjectURL(e.preview))
    setEntries([])
    setFolder('')
    onOpenChange(false)
  }

  const pendingCount = entries.filter((e) => e.status === 'pending').length
  const canUpload   = pendingCount > 0 && folder.trim().length > 0

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg gap-4">
        <DialogHeader>
          <DialogTitle>Subir imágenes a la galería</DialogTitle>
        </DialogHeader>

        {/* ── Carpeta destino (obligatoria) ── */}
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs">
            Carpeta destino <span className="text-destructive">*</span>
          </Label>
          <FolderPicker
            value={folder || undefined}
            onChange={setFolder}
            onClear={() => setFolder('')}
            placeholder="Seleccionar carpeta destino..."
            disabled={isUploading}
            rootPath="images"
          />
          {!folder && (
            <p className="text-[11px] text-muted-foreground">
              Selecciona una carpeta antes de subir.
            </p>
          )}
        </div>

        {entries.length === 0 ? (
          <div
            className={cn(
              'flex cursor-pointer select-none flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-10 transition-all',
              dragOver
                ? 'scale-[0.99] border-primary bg-primary/5'
                : 'border-border hover:border-primary/50 hover:bg-muted/30',
            )}
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault()
              setDragOver(false)
              addFiles(Array.from(e.dataTransfer.files))
            }}
          >
            <div className="flex size-14 items-center justify-center rounded-2xl bg-muted">
              <ImagePlus className="size-6 text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium">Arrastra imágenes aquí</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                o haz clic para seleccionar · varias a la vez
              </p>
            </div>
          </div>
        ) : (
          <div className="max-h-[320px] overflow-y-auto rounded-xl pr-0.5">
            <div className="grid grid-cols-5 gap-2">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className={cn(
                    'group relative aspect-square overflow-hidden rounded-xl ring-1',
                    entry.status === 'done'      && 'ring-emerald-400',
                    entry.status === 'error'     && 'ring-destructive',
                    entry.status === 'uploading' && 'ring-primary',
                    entry.status === 'pending'   && 'ring-border',
                  )}
                >
                  <img
                    src={entry.preview}
                    alt={entry.file.name}
                    className="h-full w-full object-cover"
                  />
                  {entry.status === 'pending' && !isUploading && (
                    <button
                      type="button"
                      onClick={() => removeEntry(entry.id)}
                      className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 hover:bg-red-500 transition-opacity pointer-coarse:size-8 pointer-coarse:opacity-100"
                    >
                      <X className="size-3 pointer-coarse:size-4" />
                    </button>
                  )}
                  {entry.status === 'uploading' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <Loader2 className="size-5 animate-spin text-white" />
                    </div>
                  )}
                  {entry.status === 'done' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-emerald-500/30">
                      <CheckCircle2 className="size-5 text-white drop-shadow" />
                    </div>
                  )}
                  {entry.status === 'error' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-destructive/60 p-1">
                      <XCircle className="size-4 text-white" />
                      {entry.error && (
                        <p className="line-clamp-2 text-center text-[8px] leading-tight text-white">
                          {entry.error}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
              {!isUploading && (
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="aspect-square rounded-xl border-2 border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary flex flex-col items-center justify-center gap-1 transition-colors"
                >
                  <ImagePlus className="size-4" />
                  <span className="text-[9px] font-medium">Agregar</span>
                </button>
              )}
            </div>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) addFiles(Array.from(e.target.files))
            e.target.value = ''
          }}
        />

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isUploading}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            disabled={!canUpload || isUploading}
            onClick={handleUpload}
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Subiendo...
              </>
            ) : (
              <>
                <Upload className="mr-2 size-4" />
                {pendingCount > 1 ? `Subir ${pendingCount} imágenes` : 'Subir imagen'}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
