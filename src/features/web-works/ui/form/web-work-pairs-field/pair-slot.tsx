'use client'

import { useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { ImageOff, Plus } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { ImageSelect } from '@/features/images/ui/image-select'
import { ImageQuickUploadDialog } from '@/features/images/ui/image-quick-upload-dialog'
import { Can } from '@/features/auth/ui/can'
import { getImageUrl, getImageDisplayName } from '@/features/images/lib/image-url'
import type { ImageApiItem } from '@/features/images/model/imageget.dto'
import { type WebWorkFormValues } from '../web-work-form.schema'

interface PairSlotProps {
  index: number
  side: 'before' | 'after'
  label: string
  error?: string
  disabled?: boolean
}

/** Un bloque del par ("Antes" o "Después"): foto en grande + selector del banco + subir nueva. */
export function PairSlot({ index, side, label, error, disabled }: PairSlotProps) {
  const { watch, setValue, clearErrors } = useFormContext<WebWorkFormValues>()
  const [showUpload, setShowUpload] = useState(false)
  const idField = side === 'before' ? (`pairs.${index}.id_image_before` as const) : (`pairs.${index}.id_image_after` as const)
  const urlField = side === 'before' ? (`pairs.${index}.before_url` as const) : (`pairs.${index}.after_url` as const)
  const nameField = side === 'before' ? (`pairs.${index}.before_name` as const) : (`pairs.${index}.after_name` as const)

  const idImage = watch(idField)
  const url = watch(urlField)
  const name = watch(nameField)

  const setImage = (item: ImageApiItem) => {
    setValue(idField, item.id_image, { shouldDirty: true })
    setValue(urlField, getImageUrl(item.image_patch), { shouldDirty: true })
    setValue(nameField, getImageDisplayName(item), { shouldDirty: true })
    clearErrors(idField)
  }

  const clearImage = () => {
    setValue(idField, null, { shouldDirty: true })
    setValue(urlField, null, { shouldDirty: true })
    setValue(nameField, '', { shouldDirty: true })
  }

  return (
    <div className={cn('flex flex-col gap-2 rounded-md border p-2', error && 'border-destructive/60')}>
      <div className="relative aspect-[4/3] overflow-hidden rounded bg-muted/50">
        {idImage != null && url ? (
          <img src={url} alt={name || label} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-1 text-muted-foreground">
            <ImageOff className="size-5" />
            <span className="text-xs">{idImage != null ? `Imagen #${idImage}` : `Elige la foto «${label}»`}</span>
          </div>
        )}
        <span className="pointer-events-none absolute bottom-1 left-1 rounded bg-black/70 px-1.5 text-[11px] font-medium text-white">{label}</span>
      </div>
      <ImageSelect
        value={idImage}
        onValueChange={(id) => { if (id == null) clearImage() }}
        // Solo se usa la imagen resuelta (con url) para setear; el null inicial del montaje se ignora
        onSelectedChange={(item) => { if (item && item.id_image !== idImage) setImage(item) }}
        placeholder={`Foto «${label}»`}
        disabled={disabled}
      />
      {/* Solo si tiene permiso de crear imágenes (ver ROLES_Y_PERMISOS.md) */}
      <Can permission="images.create">
        <button
          type="button"
          onClick={() => setShowUpload(true)}
          disabled={disabled}
          className="flex w-fit items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <Plus className="size-3.5" />Subir imagen nueva
        </button>
      </Can>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <ImageQuickUploadDialog open={showUpload} onOpenChange={setShowUpload} onUploaded={setImage} />
    </div>
  )
}
