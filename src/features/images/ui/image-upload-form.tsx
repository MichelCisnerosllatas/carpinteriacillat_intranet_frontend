'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ImagePlus, Loader2, Upload, X } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Card, CardContent } from '@/shared/ui/card'
import { Separator } from '@/shared/ui/separator'
import { Label } from '@/shared/ui/label'
import { swalConfirm, swalSuccess } from '@/shared/lib/swal'
import { AlertError } from '@/widgets/alerts_components'
import { useImageUploadStore } from '../stores/useImageUploadStore'
import { useImageSelectStore } from '../stores/useImageSelectStore'
import { cn } from '@/shared/lib/utils'

export function ImageUploadForm() {
  const router = useRouter()
  const { isSubmitting, error, fieldErrors, upload, reset } = useImageUploadStore()
  const { reload } = useImageSelectStore()

  const [file, setFile]           = useState<File | null>(null)
  const [preview, setPreview]     = useState<string | null>(null)
  const [name, setName]           = useState('')
  const [folder, setFolder]       = useState('')
  const [dragOver, setDragOver]   = useState(false)
  const [fileError, setFileError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => () => { reset(); if (preview) URL.revokeObjectURL(preview) }, [])

  const handleFile = (f: File) => {
    if (!f.type.startsWith('image/')) { setFileError('Solo se permiten archivos de imagen.'); return }
    setFileError(null)
    setFile(f)
    setPreview(URL.createObjectURL(f))
    if (!name) setName(f.name.replace(/\.[^/.]+$/, ''))
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) { setFileError('Selecciona una imagen para subir.'); return }

    const confirmed = await swalConfirm({
      title: '¿Subir imagen?',
      text: file.name,
      confirmText: 'Sí, subir',
      cancelText: 'Cancelar',
    })
    if (!confirmed) return

    const formData = new FormData()
    formData.append('image', file)
    if (name.trim()) formData.append('name', name.trim())
    if (folder.trim()) formData.append('folder', folder.trim())

    const success = await upload(formData)
    if (success) {
      await reload()
      await swalSuccess('Imagen subida', file.name)
      router.push('/images')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-lg">
      <Card>
        <CardContent className="pt-6 flex flex-col gap-4">
          {/* Zona de arrastre */}
          <div
            className={cn(
              'relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors cursor-pointer',
              dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50',
              preview ? 'min-h-[180px]' : 'min-h-[140px]'
            )}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
            />

            {preview ? (
              <div className="relative">
                <img src={preview} alt="Preview" className="max-h-32 rounded-md object-contain" />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute -right-2 -top-2 size-6"
                  onClick={(e) => { e.stopPropagation(); setFile(null); setPreview(null); setName('') }}
                >
                  <X className="size-3" />
                </Button>
              </div>
            ) : (
              <>
                <ImagePlus className="mb-2 size-8 text-muted-foreground" />
                <p className="text-sm font-medium">Arrastra o haz clic para seleccionar</p>
                <p className="mt-1 text-xs text-muted-foreground">PNG, JPG, GIF, WEBP — máx. 10 MB</p>
              </>
            )}
          </div>
          {fileError && <p className="text-xs text-destructive">{fileError}</p>}

          {/* Nombre personalizado */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="img-name">Nombre personalizado <span className="text-xs text-muted-foreground">(opcional)</span></Label>
            <Input
              id="img-name"
              placeholder="Ej: banner-principal"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Carpeta destino */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="img-folder">Carpeta destino <span className="text-xs text-muted-foreground">(opcional)</span></Label>
            <Input
              id="img-folder"
              placeholder="Ej: furniture, banners, sections..."
              value={folder}
              onChange={(e) => setFolder(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Separator />
      {error && (
        <AlertError
          title="Error al subir imagen"
          message={error}
          apiError={fieldErrors ? { errors: fieldErrors } : undefined}
        />
      )}
      <div className="flex items-center justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.push('/images')} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting || !file} className="min-w-32">
          {isSubmitting
            ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Subiendo...</>
            : <><Upload className="mr-2 h-4 w-4" />Subir imagen</>}
        </Button>
      </div>
    </form>
  )
}
