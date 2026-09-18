'use client'

import { useEffect, useRef, useState } from 'react'
import { ImagePlus, Loader2, Upload, X } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/ui/dialog'
import { Label } from '@/shared/ui/label'
import { FolderPicker } from '@/shared/ui/folder-picker'
import { cn } from '@/shared/lib/utils'
import { toastError } from '@/shared/lib/toast'
import { imagesService } from '../services/images.service'
import type { ImageApiItem } from '../model/imageget.dto'

interface ImageQuickUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Se dispara con el registro recién creado (ya trae `id_image`/`image_patch` completos, listos para seleccionar de inmediato sin otra llamada). */
  onUploaded: (image: ImageApiItem) => void
}

/**
 * Subida rápida de UNA imagen, pensada para abrirse desde dentro de un `<ImageSelect>` — cuando
 * la imagen que se necesita todavía no existe en el sistema, sin salir del formulario que la está
 * usando. Para subir varias imágenes o gestionar la galería completa, usar `/images/upload`.
 */
export function ImageQuickUploadDialog({ open, onOpenChange, onUploaded }: ImageQuickUploadDialogProps) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [folder, setFolder] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const pickFile = (f: File | null) => {
    setPreview((prev) => { if (prev) URL.revokeObjectURL(prev); return f ? URL.createObjectURL(f) : null })
    setFile(f)
  }

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview) }, [])

  const handleClose = () => {
    if (isUploading) return
    pickFile(null)
    setFolder('')
    onOpenChange(false)
  }

  const handleUpload = async () => {
    if (!file) return
    setIsUploading(true)
    try {
      const name = file.name.replace(/\.[^/.]+$/, '')
      const res = await imagesService.post({
        image: file,
        image_name: name,
        image_title: name,
        image_alt: name,
        folder: folder.trim() || undefined,
      })
      if (res.success && res.data) {
        onUploaded(res.data)
        pickFile(null)
        setFolder('')
        onOpenChange(false)
      } else {
        toastError('Error al subir', res.message)
      }
    } catch (err: any) {
      toastError('Error al subir', err?.response?.data?.message ?? err?.message ?? 'Error inesperado')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md gap-4">
        <DialogHeader>
          <DialogTitle>Subir nueva imagen</DialogTitle>
        </DialogHeader>

        {!file ? (
          <div
            className={cn(
              'flex cursor-pointer select-none flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-8 text-center transition-all',
              dragOver ? 'scale-[0.99] border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/30'
            )}
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault()
              setDragOver(false)
              const f = e.dataTransfer.files[0]
              if (f) pickFile(f)
            }}
          >
            <div className="flex size-12 items-center justify-center rounded-2xl bg-muted">
              <ImagePlus className="size-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium">Arrastra una imagen aquí</p>
              <p className="mt-0.5 text-xs text-muted-foreground">o haz clic para seleccionar</p>
            </div>
          </div>
        ) : (
          <div className="relative aspect-video w-full overflow-hidden rounded-xl border bg-muted">
            <img src={preview!} alt={file.name} className="h-full w-full object-contain" />
            {!isUploading && (
              <button
                type="button"
                onClick={() => pickFile(null)}
                className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-red-500"
              >
                <X className="size-4" />
              </button>
            )}
            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <Loader2 className="size-6 animate-spin text-white" />
              </div>
            )}
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) pickFile(f); e.target.value = '' }}
        />

        <div className="flex flex-col gap-1.5">
          <Label className="text-xs">Carpeta (opcional)</Label>
          <FolderPicker
            value={folder || undefined}
            onChange={setFolder}
            onClear={() => setFolder('')}
            placeholder="Carpeta destino..."
            disabled={isUploading}
            rootPath="images"
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={handleClose} disabled={isUploading}>Cancelar</Button>
          <Button type="button" disabled={!file || isUploading} onClick={() => void handleUpload()}>
            {isUploading
              ? <><Loader2 className="mr-2 size-4 animate-spin" />Subiendo...</>
              : <><Upload className="mr-2 size-4" />Subir y usar</>}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
