'use client'

import { useRef, useState } from 'react'
import { Camera, Loader2, X } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar'
import { getInitials } from '@/shared/lib/get-initials'
import { toastError } from '@/shared/lib/toast'
import { imagesService } from '@/features/images/services/images.service'
import { getImageUrl } from '@/features/images/lib/image-url'

const MAX_SIZE_MB = 5

interface PersonPhotoPickerProps {
  /** URL absoluta/relativa ya resuelta de la foto actual (o null si no tiene). */
  value: string | null
  onChange: (url: string | null) => void
  /** Usado para las iniciales del fallback y el alt de la imagen. */
  name: string
  disabled?: boolean
}

/**
 * Selector de foto de persona: avatar grande que, al hacer clic, abre directamente el selector
 * de archivos del sistema (sin pasar por la galería del módulo de imágenes) y sube la foto de
 * inmediato. Entrega la URL ya resuelta — `persons.person_photo_url` es una columna de texto
 * simple, sin relación con la tabla `images`.
 */
export function PersonPhotoPicker({ value, onChange, name, disabled = false }: PersonPhotoPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)

  const displayName = name.trim() || 'Usuario'

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toastError('Archivo inválido', 'Selecciona un archivo de imagen.')
      return
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toastError('Archivo muy grande', `La imagen no debe superar los ${MAX_SIZE_MB}MB.`)
      return
    }

    setIsUploading(true)
    try {
      const baseName = file.name.replace(/\.[^/.]+$/, '')
      const res = await imagesService.post({
        image: file,
        image_name: baseName,
        image_title: baseName,
        image_alt: baseName,
      })
      if (res.success && res.data) {
        onChange(getImageUrl(res.data.image_patch))
      } else {
        toastError('Error al subir la foto', res.message)
      }
    } catch (err: any) {
      toastError('Error al subir la foto', err?.response?.data?.message ?? err?.message ?? 'Error inesperado')
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(null)
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative inline-flex">
        <button
          type="button"
          disabled={disabled || isUploading}
          onClick={() => inputRef.current?.click()}
          className="group relative block rounded-full outline-none disabled:cursor-not-allowed"
        >
          <Avatar className="size-24 border-2 border-border shadow-sm transition-opacity group-hover:opacity-75 sm:size-28">
            <AvatarImage src={value ?? undefined} alt={displayName} className="object-cover" />
            <AvatarFallback className="text-xl font-semibold">{getInitials(displayName)}</AvatarFallback>
          </Avatar>

          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
              <Loader2 className="size-6 animate-spin text-white" />
            </div>
          )}

          <span className="absolute -bottom-1 -right-1 flex size-8 items-center justify-center rounded-full border-2 border-background bg-primary text-primary-foreground shadow transition-transform group-hover:scale-110">
            <Camera className="size-4" />
          </span>
        </button>

        {value && !isUploading && (
          <button
            type="button"
            disabled={disabled}
            onClick={handleRemove}
            className="absolute -top-1 -right-1 z-10 flex size-6 items-center justify-center rounded-full border-2 border-background bg-destructive text-destructive-foreground shadow transition-transform hover:scale-110 disabled:cursor-not-allowed"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>

      <p className="text-center text-[11px] text-muted-foreground">
        JPG o PNG, máx. {MAX_SIZE_MB}MB
      </p>

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
