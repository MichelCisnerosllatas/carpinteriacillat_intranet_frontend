// src/shared/ui/logo-field.tsx
'use client'

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { Building2, Camera, X } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { buildImageUrl } from '@/shared/lib/images'
import type { LogoFieldHandle } from '@/shared/lib/logo-field.types'

interface LogoFieldProps {
  value: string | null | undefined
  disabled?: boolean
  /** Texto del alt/título de las imágenes — por defecto "Logo". */
  alt?: string
  /**
   * Tamaño REAL con el que se debe ver la imagen dentro del recuadro — si se pasa, la vista
   * previa es exactamente cómo se vería en el sitio (la usa `FooterVisibilityForm`, que además
   * deja elegir alto/ancho/object-fit). Sin esto, cae a un tamaño genérico fijo (lo usa
   * `CompanyLogoCard`, que no tiene ese control).
   */
  previewHeight?: number
  previewWidth?: number | null
  previewObjectFit?: 'contain' | 'cover'
}

const DEFAULT_HEIGHT = 96

/**
 * Selector de logo con vista previa, subir/cambiar/quitar — genérico a propósito: lo usa tanto
 * `CompanyLogoCard` (logo principal de la empresa) como `FooterVisibilityForm` (logo propio del
 * footer). Vive en `shared/ui` porque ya lo usa más de una feature.
 *
 * Los controles son SIEMPRE visibles (no solo al pasar el cursor) — en mobile no existe hover,
 * así que depender de él dejaba sin forma de descubrir cómo cambiar la foto en touch. Mismo
 * criterio que `PersonPhotoPicker` (formulario de Usuarios).
 */
export const LogoField = forwardRef<LogoFieldHandle, LogoFieldProps>(
  function LogoField({ value, disabled, alt = 'Logo', previewHeight, previewWidth, previewObjectFit = 'contain' }, ref) {
    const [file, setFile] = useState<File | null>(null)
    const [removed, setRemoved] = useState(false)
    const [previewUrl, setPreviewUrl] = useState<string | null>(value ? buildImageUrl(value) : null)
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
      if (!file) setPreviewUrl(value ? buildImageUrl(value) : null)
    }, [value, file])

    useImperativeHandle(ref, () => ({
      getPendingFile: () => file,
      wasRemoved: () => removed,
    }))

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = e.target.files?.[0]
      if (!selected) return

      setFile(selected)
      setRemoved(false)
      setPreviewUrl(URL.createObjectURL(selected))
    }

    const handleRemove = (e: React.MouseEvent) => {
      e.stopPropagation()
      setFile(null)
      setRemoved(true)
      setPreviewUrl(null)
      if (inputRef.current) inputRef.current.value = ''
    }

    const height = previewHeight ?? DEFAULT_HEIGHT
    // El recuadro "lienzo" siempre reserva un poco más que la imagen, para que los badges de la
    // esquina no queden pegados encima del logo — el ancho es libre (según previewWidth o el
    // contenido), con un tope para que un logo muy ancho no se coma toda la tarjeta.
    const canvasHeight = height + 32

    return (
      <div className="flex flex-col items-center gap-3">
        <div className="relative inline-flex">
          <button
            type="button"
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
            className="group relative flex w-full max-w-md items-center justify-center overflow-hidden rounded-lg border bg-muted p-4 transition-shadow disabled:cursor-not-allowed disabled:opacity-60"
            style={{ minHeight: canvasHeight }}
          >
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt={alt}
                style={{
                  height,
                  width: previewWidth ?? 'auto',
                  maxWidth: previewWidth ? undefined : '100%',
                  objectFit: previewObjectFit,
                }}
              />
            ) : (
              <Building2 className="size-10 text-muted-foreground" />
            )}

            {!disabled && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/40">
                <span className="text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
                  {previewUrl ? 'Cambiar' : 'Subir logo'}
                </span>
              </div>
            )}

            {/* Siempre visible — no depende de hover, así en touch (mobile) también se ve cómo cambiar la foto. */}
            {!disabled && (
              <span className="absolute bottom-2 right-2 flex size-8 items-center justify-center rounded-full border-2 border-background bg-primary text-primary-foreground shadow">
                <Camera className="size-4" />
              </span>
            )}
          </button>

          {previewUrl && !disabled && (
            <button
              type="button"
              onClick={handleRemove}
              className="absolute -right-2 -top-2 flex size-7 items-center justify-center rounded-full border-2 border-background bg-destructive text-destructive-foreground shadow transition-transform hover:scale-110"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          disabled={disabled}
        />
      </div>
    )
  }
)
