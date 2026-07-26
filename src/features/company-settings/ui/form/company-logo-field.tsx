// src/features/company-settings/ui/form/company-logo-field.tsx
'use client'

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { Building2, Eye, Pencil, Trash2 } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { getImageUrl } from '@/features/images/lib/image-url'
import { Dialog, DialogContent, DialogTitle } from '@/shared/ui/dialog'
import type { CompanyLogoFieldHandle } from '../../lib/company-logo-field.types'

// export interface CompanyLogoFieldHandle {
//   getPendingFile: () => File | null
//   wasRemoved: () => boolean
// }

interface CompanyLogoFieldProps {
  value: string | null | undefined
  disabled?: boolean
}

export const CompanyLogoField = forwardRef<CompanyLogoFieldHandle, CompanyLogoFieldProps>(
  function CompanyLogoField({ value, disabled }, ref) {
    const [file, setFile] = useState<File | null>(null)
    const [removed, setRemoved] = useState(false)
    const [previewUrl, setPreviewUrl] = useState<string | null>(value ? getImageUrl(value) : null)
    const [isPreviewOpen, setIsPreviewOpen] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
      if (!file) setPreviewUrl(value ? getImageUrl(value) : null)
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

    const handleRemove = () => {
      setFile(null)
      setRemoved(true)
      setPreviewUrl(null)
      if (inputRef.current) inputRef.current.value = ''
    }

    return (
      <div className="flex items-center gap-6">
        <div
          role="button"
          tabIndex={disabled ? -1 : 0}
          onClick={() => !disabled && inputRef.current?.click()}
          onKeyDown={(e) => {
            if (!disabled && (e.key === 'Enter' || e.key === ' ')) inputRef.current?.click()
          }}
          className={cn(
            'group relative flex size-32 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted transition-shadow sm:size-40 md:size-52 lg:size-60',
            disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:shadow-md'
          )}
        >
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt="Logo de la empresa"
              className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
            />
          ) : (
            <Building2 className="size-12 text-muted-foreground transition-transform duration-300 ease-out group-hover:scale-110 md:size-16" />
          )}

          {!disabled && (
            <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/60 opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100">
              {previewUrl && (
                <span
                  title="Ver logo"
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsPreviewOpen(true)
                  }}
                  className="flex size-9 items-center justify-center rounded-full bg-white/15 text-white transition-transform duration-150 ease-out hover:scale-110 hover:bg-white/25"
                >
                  <Eye className="size-4" />
                </span>
              )}
              <span
                title={previewUrl ? 'Cambiar logo' : 'Subir logo'}
                onClick={(e) => {
                  e.stopPropagation()
                  inputRef.current?.click()
                }}
                className="flex size-9 items-center justify-center rounded-full bg-white/15 text-white transition-transform duration-150 ease-out hover:scale-110 hover:bg-white/25"
              >
                <Pencil className="size-4" />
              </span>
              {previewUrl && (
                <span
                  title="Quitar logo"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRemove()
                  }}
                  className="flex size-9 items-center justify-center rounded-full bg-white/15 text-white transition-transform duration-150 ease-out hover:scale-110 hover:bg-destructive/80"
                >
                  <Trash2 className="size-4" />
                </span>
              )}
            </div>
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

        {previewUrl && (
          <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
            <DialogContent className="sm:max-w-2xl">
              <DialogTitle>Logo de la empresa</DialogTitle>
              <div className="flex items-center justify-center rounded-lg border bg-muted p-6">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt="Logo de la empresa"
                  className="max-h-[70vh] w-full object-contain"
                />
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    )
  }
)
