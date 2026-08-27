// src/features/proforma-notes/lib/row-actions/updateNoteInList.ts
import { toastError } from '@/shared/lib/toast'
import { useProformaNoteFormStore } from '../../stores/useProformaNoteFormStore'
import { usePendingNotesStore } from '../../stores/usePendingNotesStore'
import type { ProformaNote } from '../../data/schema'

interface UpdateNoteInListDeps {
  proformaId: number | null
  text: string
  /** Fila ya guardada en el backend (de `savedNotes`) — pásala cuando la nota YA existe ahí. */
  savedRow?: ProformaNote
  /** tempId de una nota pendiente (de `pendingNotes`) — pásalo cuando SOLO vive en memoria. */
  pendingTempId?: string
}

/**
 * Lógica completa de la edición inline de una nota (click en el texto del chip) — hermana de
 * `addNoteToList.ts` / `removeNoteFromList.ts`.
 *
 * PENDIENTE (sin proforma registrada todavía, en `usePendingNotesStore`): se actualiza directo en
 * memoria — sin petición al backend, porque todavía no tiene id real.
 *
 * GUARDADA (ya persistida en `/proforma-notes`): se persiste directo contra el backend llamando a
 * `useProformaNoteFormStore.update()`, que ya se encarga de refrescar `savedNotes` al terminar.
 */
export async function updateNoteInList(deps: UpdateNoteInListDeps): Promise<boolean> {
  const { proformaId, text, savedRow, pendingTempId } = deps
  const trimmed = text.trim()

  if (!trimmed) {
    toastError('Falta el texto', 'Escribe el texto de la nota.')
    return false
  }

  // PENDIENTE — se actualiza en memoria, sin llamada al backend
  if (pendingTempId) {
    usePendingNotesStore.getState().updatePendingNote(pendingTempId, { text: trimmed })
    return true
  }

  // GUARDADA — se persiste directo contra el backend
  if (!savedRow || !proformaId) return false
  if (trimmed === savedRow.text) return true // sin cambios, no hace falta llamar al backend

  const ok = await useProformaNoteFormStore.getState().update(savedRow.id, {
    proforma_id: proformaId,
    text: trimmed,
  })

  if (!ok) toastError('Error', 'No se pudo actualizar la nota.')
  return ok
}
