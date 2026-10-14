'use client'

import { Input } from '@/shared/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import {
  FURNITURE_IMAGE_VARIANT_OPTIONS,
  variantFromSelect,
  variantToSelect,
  type FurnitureImageVariant,
} from '../../data/data'

interface FurnitureGalleryWebFieldsProps {
  caption: string
  variant: FurnitureImageVariant | null
  disabled?: boolean
  onCaptionChange: (caption: string) => void
  onVariantChange: (variant: FurnitureImageVariant | null) => void
}

/**
 * Campos web de una foto de la galería: pie de foto y si es "antes"/"después".
 * Se muestran debajo de cada miniatura en FurnitureGalleryManager.
 */
export function FurnitureGalleryWebFields({
  caption,
  variant,
  disabled = false,
  onCaptionChange,
  onVariantChange,
}: FurnitureGalleryWebFieldsProps) {
  return (
    <div className="flex flex-col gap-1">
      <Input
        value={caption}
        onChange={(e) => onCaptionChange(e.target.value)}
        placeholder="Pie de foto"
        aria-label="Pie de foto"
        maxLength={150}
        disabled={disabled}
        className="h-8 text-xs"
      />
      <Select
        value={variantToSelect(variant)}
        onValueChange={(v) => onVariantChange(variantFromSelect(v))}
        disabled={disabled}
      >
        <SelectTrigger size="sm" className="w-full text-xs" aria-label="Tipo de foto">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {FURNITURE_IMAGE_VARIANT_OPTIONS.map((o) => (
            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
