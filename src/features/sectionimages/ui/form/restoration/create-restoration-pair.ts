// SOLO para «Restauración» (restoration_compare) al CREAR.
// Guarda los bloques "Antes" y "Después" como filas de sections_images: un POST por bloque, en orden
// (primero Antes, luego Después), con el mismo trabajo (id_section_item).
// Si un POST falla se detiene y avisa cuáles ya se guardaron (para no repetirlos al reintentar).

import type { SectionImagePostRequestDto } from '../../../model/sectionimagepost.dto'
import type { RestorationPhotoVariant } from '../../../grouped'
import type { FilledRestorationSlot } from './use-restoration-pair'

/** Datos comunes a las dos fotos (sección, trabajo, ajuste y visibilidad). */
type PairBase = {
  id_section: number
  id_section_item: number | null
  sectionimage_fix: string | null
  sectionimage_state: number
  sectionimage_created_at: string
}

/** Resultado: ok = se guardaron todas; savedVariants = las que sí se guardaron. */
export type CreateRestorationPairResult = { ok: boolean; savedVariants: RestorationPhotoVariant[] }

/** Texto vacío → null (el backend espera null, no ''). */
const emptyToNull = (value: string) => (value.trim() === '' ? null : value.trim())

/**
 * Crea una fila por bloque con foto. `create` es la acción del store (useSectionImageFormStore):
 * devuelve true si se guardó.
 */
export async function createRestorationPair(
  slots: FilledRestorationSlot[],
  base: PairBase,
  create: (params: SectionImagePostRequestDto) => Promise<boolean>,
): Promise<CreateRestorationPairResult> {
  const savedVariants: RestorationPhotoVariant[] = []

  for (const { variant, slot } of slots) {
    if (slot.idImage == null) continue
    const ok = await create({
      ...base,
      id_image: slot.idImage,
      sectionimage_variant: variant,
      // Pie de foto
      sectionimage_title: emptyToNull(slot.caption),
      // Enlace con el mueble ('/gallery/<id>') si la foto vino de un mueble
      sectionimage_link: emptyToNull(slot.link),
      // La web de Restauración no usa estos textos
      sectionimage_description: null,
      sectionimage_label: null,
      sectionimage_link_label: null,
    })
    if (!ok) return { ok: false, savedVariants }
    savedVariants.push(variant)
  }

  return { ok: true, savedVariants }
}
