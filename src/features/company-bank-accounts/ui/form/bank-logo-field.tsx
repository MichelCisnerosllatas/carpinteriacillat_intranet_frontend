'use client'

import { useRef, useState } from 'react'
import { Landmark, Loader2, Upload, X } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { cn } from '@/shared/lib/utils'
import { toastError } from '@/shared/lib/toast'
import { getImageUrl } from '@/features/images/lib/image-url'
import { storageFilesService } from '@/features/storage-files/services/storage-files.service'

interface BankLogoFieldProps {
  value: string
  onChange: (path: string) => void
  disabled?: boolean
}

// Sube el logo del banco al storage y guarda solo la ruta (`path`) en el formulario.
export function BankLogoField({ value, onChange, disabled }: BankLogoFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const handleFile = async (file: File) => {
    setIsUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('folder', 'company-bank-accounts')
      const res = await storageFilesService.upload(fd)
      if (res.success) {
        onChange(res.data.path)
        setPreviewUrl(res.data.url)
      } else {
        toastError('Error al subir el logo', res.message)
      }
    } catch (error: any) {
      toastError('Error al subir el logo', error?.response?.data?.message ?? error?.message)
    } finally {
      setIsUploading(false)
    }
  }

  const displayUrl = previewUrl ?? (value ? getImageUrl(value) : null)

  return (
    <div className="flex items-center gap-3">
      <div
        className={cn(
          'flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted',
        )}
      >
        {displayUrl
          ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={displayUrl} alt="Logo del banco" className="size-full object-contain" />
          )
          : <Landmark className="size-6 text-muted-foreground" />}
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled || isUploading}
            onClick={() => inputRef.current?.click()}
          >
            {isUploading
              ? <><Loader2 className="mr-2 size-4 animate-spin" />Subiendo...</>
              : <><Upload className="mr-2 size-4" />{value ? 'Cambiar logo' : 'Subir logo'}</>}
          </Button>
          {value && !isUploading && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={disabled}
              onClick={() => { onChange(''); setPreviewUrl(null) }}
            >
              <X className="mr-1 size-4" />Quitar
            </Button>
          )}
        </div>
        <span className="text-xs text-muted-foreground">PNG, JPG o SVG. Opcional.</span>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) void handleFile(file)
          e.target.value = ''
        }}
      />
    </div>
  )
}
