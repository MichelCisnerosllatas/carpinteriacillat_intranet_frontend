'use client'

import { useRef, useState } from 'react'
import { Loader2, Building2, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { storageFilesService } from '@/features/storage-files/services/storage-files.service'
import { getImageUrl } from '@/features/images/lib/image-url'
import { toastError } from '@/shared/lib/toast'

interface CompanyLogoFieldProps {
  value: string | null | undefined
  onChange: (path: string | undefined) => void
  disabled?: boolean
}

export function CompanyLogoField({ value, onChange, disabled }: CompanyLogoFieldProps) {
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
        toastError('Error', 'No se pudo subir el logo de la empresa.')
      }
    } catch {
      toastError('Error', 'No se pudo subir el logo de la empresa.')
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
      <div className="flex size-30 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted">
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewUrl} alt="Logo de la empresa" className="h-full w-full object-contain" />
        ) : (
          <Building2 className="size-10 text-muted-foreground" />
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
            <><Pencil className="mr-2 size-4" />{previewUrl ? 'Cambiar logo' : 'Subir logo'}</>
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
