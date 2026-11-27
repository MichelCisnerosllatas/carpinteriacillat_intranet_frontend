/** Opciones de `sectionimage_fix` — mapea 1 a 1 con los valores válidos de CSS `object-fit`,
 * que controla cómo la imagen debe encajar en el contenedor donde se muestra (banner, tarjeta, etc.). */
export const SECTION_IMAGE_FIX_OPTIONS = [
  { value: 'cover', label: 'Cubrir (cover)' },
  { value: 'contain', label: 'Contener (contain)' },
  { value: 'fill', label: 'Rellenar (fill)' },
  { value: 'none', label: 'Tamaño original (none)' },
  { value: 'scale-down', label: 'Reducir si es necesario (scale-down)' },
] as const

export const SECTION_IMAGE_FIX_DEFAULT = 'cover'

export function getSectionImageFixLabel(value: string | null): string {
  if (!value) return SECTION_IMAGE_FIX_OPTIONS.find((o) => o.value === SECTION_IMAGE_FIX_DEFAULT)!.label
  return SECTION_IMAGE_FIX_OPTIONS.find((o) => o.value === value)?.label ?? value
}
