'use client'

// Selector de UNA imagen del banco que "dispara y se vacía": al elegir una imagen avisa con
// `onPick(imagen)` y se reinicia (vuelve a "Agregar foto del banco") para poder elegir otra.
// Se usa para agregar fotos a la galería del trabajo. Incluye el link "Subir nueva".

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { ImageSelect } from '@/features/images/ui/image-select'
import { ImageQuickUploadDialog } from '@/features/images/ui/image-quick-upload-dialog'
import type { ImageApiItem } from '@/features/images/model/imageget.dto'

interface BankImagePickerProps {
  onPick: (image: ImageApiItem) => void
  placeholder?: string
  disabled?: boolean
}

export function BankImagePicker({ onPick, placeholder = 'Agregar foto del banco...', disabled }: BankImagePickerProps) {
  // Cambiar la key remonta el ImageSelect y lo deja vacío otra vez
  const [pickerKey, setPickerKey] = useState(0)
  const [showUpload, setShowUpload] = useState(false)

  const handlePicked = (item: ImageApiItem | null) => {
    if (!item) return
    onPick(item)
    setPickerKey((k) => k + 1)
  }

  return (
    <div className="flex flex-col gap-1.5">
      <ImageSelect
        key={pickerKey}
        value={null}
        onValueChange={() => {}}
        onSelectedChange={handlePicked}
        placeholder={placeholder}
        disabled={disabled}
      />
      <button
        type="button"
        onClick={() => setShowUpload(true)}
        disabled={disabled}
        className="flex w-fit items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
      >
        <Plus className="size-3.5" />Subir imagen nueva
      </button>
      <ImageQuickUploadDialog open={showUpload} onOpenChange={setShowUpload} onUploaded={(item) => onPick(item)} />
    </div>
  )
}
