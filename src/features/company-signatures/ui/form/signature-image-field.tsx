'use client'

import { useRef, useState } from 'react'
import { Loader2, PenTool, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { storageFilesService } from '@/features/storage-files/services/storage-files.service'
import { getImageUrl } from '@/features/images/lib/image-url'
import { toastError } from '@/shared/lib/toast'

interface SignatureImageFieldProps {
  value: string | null | undefined
  onChange: (path: string | undefined) => void
  disabled?: boolean
}

export function SignatureImageField({ value, onChange, disabled }: SignatureImageFieldProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(value ? getImageUrl(value) : null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await storageFilesService.upload(formData)
      if (res.success) {
        onChange(res.data.path)
        setPreviewUrl(res.data.url)
      } else {
        toastError('Error', 'No se pudo subir la imagen de la firma.')
      }
    } catch {
      toastError('Error', 'No se pudo subir la imagen de la firma.')
    } finally {
      setIsUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const handleRemove = () => {
    onChange(undefined)
    setPreviewUrl(null)
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted">
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewUrl} alt="Firma" className="h-full w-full object-contain" />
        ) : (
          <PenTool className="size-6 text-muted-foreground" />
        )}
      </div>
      <div className="flex flex-col gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          disabled={disabled || isUploading}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled || isUploading}
          onClick={() => inputRef.current?.click()}
        >
          {isUploading ? (
            <><Loader2 className="mr-2 size-4 animate-spin" />Subiendo...</>
          ) : (
            <><Pencil className="mr-2 size-4" />{previewUrl ? 'Cambiar imagen' : 'Subir imagen'}</>
          )}
        </Button>
        {previewUrl && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-destructive"
            disabled={disabled || isUploading}
            onClick={handleRemove}
          >
            <Trash2 className="mr-2 size-4" />Quitar
          </Button>
        )}
      </div>
    </div>
  )
}
