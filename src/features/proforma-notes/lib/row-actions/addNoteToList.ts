// src/features/proforma-notes/lib/row-actions/addNoteToList.ts
import { toastError, toastSuccess } from '@/shared/lib/toast'
import { useProformaNoteFormStore } from '../../stores/useProformaNoteFormStore'
import { usePendingNotesStore } from '../../stores/usePendingNotesStore'

interface AddNoteToListDeps {
  proformaId: number | null
  text: string
  /** Posición que ocupará la nueva nota — total actual (guardadas + pendientes) + 1. Solo se usa
   * cuando la proforma ya está registrada; en memoria, `uploadPendingNotes` recalcula el `order`
   * por la posición real dentro de `pendingNotes` al momento de subir. */
  nextOrder: number
}

/**
 * Lógica completa del botón "Agregar nota" — clon simplificado de `addProductToCart.ts`: sin
 * catálogo ni autocompletado, solo valida que el texto no esté vacío. Tampoco exige mínimo (las
 * notas son opcionales, a diferencia del carrito de productos).
 *
 * SIN PROFORMA REGISTRADA: mete la nota en la lista temporal (`usePendingNotesStore`), sin
 * ninguna petición al backend.
 *
 * CON PROFORMA YA REGISTRADA: la persiste directo contra `/proforma-notes`, llamando al store de
 * creación (`useProformaNoteFormStore`) directamente.
 */
export async function addNoteToList(deps: AddNoteToListDeps): Promise<boolean> {
  const { proformaId, text, nextOrder } = deps
  const trimmed = text.trim()

  if (!trimmed) {
    toastError('Falta el texto', 'Escribe el texto de la nota.')
    return false
  }

  // SIN PROFORMA REGISTRADA — se guarda en memoria, no hay petición al backend
  if (!proformaId) {
    usePendingNotesStore.getState().addPendingNote({ text: trimmed })
    return true
  }

  // CON PROFORMA YA REGISTRADA — se persiste directo contra el backend
  const ok = await useProformaNoteFormStore.getState().create({
    proforma_id: proformaId,
    text: trimmed,
    order: nextOrder,
  })

  if (ok) {
    toastSuccess('Nota agregada', trimmed)
  } else {
    toastError('Error', 'No se pudo agregar la nota.')
  }
  return ok
}
