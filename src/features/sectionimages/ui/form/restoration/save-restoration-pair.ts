// SOLO para «Restauración» (restoration_compare) al EDITAR.
// Guarda los bloques "Antes" y "Después" comparando con lo que tenían al abrir el formulario.
// Por cada bloque:
//   - tenía id y sigue con foto  → PUT    (actualiza esa fila)
//   - no tenía id y ahora tiene foto → POST (fila nueva, como create-restoration-pair.ts)
//   - tenía id y quedó vacío (X) → DELETE (el formulario pide confirmación ANTES, ver getRestorationDeletes)
//   - no tenía id y sigue vacío  → nada
// Orden: primero DELETE, luego PUT y al final POST. Así, si algo falla, reintentar es seguro:
// los DELETE hechos se "olvidan" en el formulario, un PUT repetido no cambia nada y el POST
// (como mucho uno: la foto editada siempre tiene id) es lo último.

import type { SectionImagePostRequestDto } from '../../../model/sectionimagepost.dto'
import type { SectionImagePutRequestDto } from '../../../model/sectionimageput.dto'
import type { RestorationPhotoVariant } from '../../../grouped'
import type { RestorationPerVariant, RestorationSlotValue } from './use-restoration-pair'

/** Datos comunes a las dos fotos (sección, trabajo y ajuste). */
type SaveBase = {
  id_section: number
  id_section_item: number | null
  sectionimage_fix: string | null
}

/** Lo que hay que guardar (sale de useRestorationPair). */
type SaveInput = {
  /** id original de cada bloque (null = no tenía foto guardada). */
  ids: RestorationPerVariant<number | null>
  /** Lo que tiene cada bloque ahora. */
  slots: RestorationPerVariant<RestorationSlotValue>
  /** Visible (1) u oculta (0) de cada bloque. */
  states: RestorationPerVariant<number>
}

/** Acciones de los stores (devuelven true si salió bien). */
type SaveActions = {
  create: (params: SectionImagePostRequestDto) => Promise<boolean>
  update: (id: number, data: SectionImagePutRequestDto) => Promise<boolean>
  remove: (id: number) => Promise<boolean>
}

/** Qué se hizo (o se intentó) con un bloque. */
export type RestorationSaveStep = 'delete' | 'update' | 'create'

/**
 * Resultado: ok = todo bien.
 * deletedVariants = bloques cuya foto ya se eliminó (el formulario olvida su id para no repetirlo).
 * failed = el paso que falló (para el mensaje), o null.
 */
export type SaveRestorationPairResult = {
  ok: boolean
  deletedVariants: RestorationPhotoVariant[]
  failed: { step: RestorationSaveStep; variant: RestorationPhotoVariant } | null
}

const VARIANTS: RestorationPhotoVariant[] = ['before', 'after']

/** Texto vacío → null (el backend espera null, no ''). */
const emptyToNull = (value: string) => (value.trim() === '' ? null : value.trim())

/** Bloques que tenían foto guardada y quedaron vacíos (se van a ELIMINAR). Para confirmar antes. */
export function getRestorationDeletes(input: Pick<SaveInput, 'ids' | 'slots'>): RestorationPhotoVariant[] {
  return VARIANTS.filter((v) => input.ids[v] != null && input.slots[v].idImage == null)
}

/** Campos de la foto de un bloque (iguales para PUT y POST). */
function slotFields(variant: RestorationPhotoVariant, slot: RestorationSlotValue, state: number, base: SaveBase) {
  return {
    ...base,
    id_image: slot.idImage as number, // solo se llama con bloques que tienen foto
    sectionimage_variant: variant,
    sectionimage_state: state,
    // Pie de foto
    sectionimage_title: emptyToNull(slot.caption),
    // Enlace con el mueble ('/gallery/<id>') si la foto vino de un mueble
    sectionimage_link: emptyToNull(slot.link),
    // La web de Restauración no usa estos textos
    sectionimage_description: null,
    sectionimage_label: null,
    sectionimage_link_label: null,
  }
}

/** Guarda los dos bloques (ver el orden arriba). `now` = formatDatetime() para created_at / updated_at. */
export async function saveRestorationPair(
  input: SaveInput,
  base: SaveBase,
  now: string,
  actions: SaveActions,
): Promise<SaveRestorationPairResult> {
  const deletedVariants: RestorationPhotoVariant[] = []
  const fail = (step: RestorationSaveStep, variant: RestorationPhotoVariant): SaveRestorationPairResult =>
    ({ ok: false, deletedVariants, failed: { step, variant } })

  // 1) DELETE: tenía id y quedó vacío
  for (const variant of getRestorationDeletes(input)) {
    const ok = await actions.remove(input.ids[variant] as number)
    if (!ok) return fail('delete', variant)
    deletedVariants.push(variant)
  }

  // 2) PUT: tenía id y sigue con foto
  for (const variant of VARIANTS) {
    const id = input.ids[variant]
    const slot = input.slots[variant]
    if (id == null || slot.idImage == null) continue
    const ok = await actions.update(id, {
      ...slotFields(variant, slot, input.states[variant], base),
      sectionimage_updated_at: now,
    })
    if (!ok) return fail('update', variant)
  }

  // 3) POST: no tenía id y ahora tiene foto
  for (const variant of VARIANTS) {
    const slot = input.slots[variant]
    if (input.ids[variant] != null || slot.idImage == null) continue
    const ok = await actions.create({
      ...slotFields(variant, slot, input.states[variant], base),
      sectionimage_created_at: now,
    })
    if (!ok) return fail('create', variant)
  }

  return { ok: true, deletedVariants, failed: null }
}
