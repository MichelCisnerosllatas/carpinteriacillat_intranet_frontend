// src/features/furnitures_images/data/data.ts

/** Variante web de una foto: "antes" / "después" (para restauraciones). null = foto normal. */
export type FurnitureImageVariant = 'before' | 'after'

/**
 * Opciones del Select "Normal / Antes / Después".
 * El <Select> de shadcn (Radix) no acepta value="" , por eso "normal" representa null.
 */
export const FURNITURE_IMAGE_VARIANT_NONE = 'normal'

export const FURNITURE_IMAGE_VARIANT_OPTIONS: { value: string; label: string }[] = [
  { value: FURNITURE_IMAGE_VARIANT_NONE, label: 'Normal' },
  { value: 'before', label: 'Antes' },
  { value: 'after', label: 'Después' },
]

/** Convierte cualquier texto a una variante válida ('before' | 'after') o null. */
export function toFurnitureImageVariant(value: string | null | undefined): FurnitureImageVariant | null {
  return value === 'before' || value === 'after' ? value : null
}

/** Valor del Select → valor que se guarda (null si es "Normal"). */
export function variantFromSelect(value: string): FurnitureImageVariant | null {
  return toFurnitureImageVariant(value)
}

/** Valor guardado → valor del Select. */
export function variantToSelect(variant: string | null | undefined): string {
  return variant === 'before' || variant === 'after' ? variant : FURNITURE_IMAGE_VARIANT_NONE
}

/** Texto a mostrar para una variante (ej. en el detalle). */
export function getVariantLabel(variant: string | null | undefined): string {
  return FURNITURE_IMAGE_VARIANT_OPTIONS.find((o) => o.value === variantToSelect(variant))?.label ?? 'Normal'
}
