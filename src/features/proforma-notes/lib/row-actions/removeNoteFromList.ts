// src/features/proforma-notes/lib/row-actions/removeNoteFromList.ts
import { swalDeleteConfirm } from '@/shared/lib/swal'
import { toastSuccess } from '@/shared/lib/toast'
import { useProformaNoteDeleteStore } from '../../stores/useProformaNoteDeleteStore'
import { usePendingNotesStore } from '../../stores/usePendingNotesStore'
import type { ProformaNote } from '../../data/schema'

interface RemoveNoteFromListDeps {
  proformaId: number | null
  /** Fila ya guardada en el backend (de `savedNotes`) — pásala cuando la nota YA existe ahí. */
  savedRow?: ProformaNote
  /** tempId de una nota pendiente (de `pendingNotes`) — pásalo cuando SOLO vive en memoria. */
  pendingTempId?: string
}

/**
 * Lógica completa del botón de eliminar (🗑) una nota, sea cual sea su estado — clon simplificado
 * de `removeProductFromCart.ts`:
 *
 * PENDIENTE (sin proforma registrada todavía, en `usePendingNotesStore`): se quita directo de la
 * lista en memoria — sin confirmación ni petición al backend, porque nunca se guardó.
 *
 * GUARDADA (ya persistida en `/proforma-notes`): confirma con el usuario y borra en el backend,
 * llamando directo al store de borrado (`useProformaNoteDeleteStore`).
 */
export async function removeNoteFromList(deps: RemoveNoteFromListDeps): Promise<void> {
  const { proformaId, savedRow, pendingTempId } = deps

  // PENDIENTE
  if (pendingTempId) {
    usePendingNotesStore.getState().removePendingNote(pendingTempId)
    return
  }

  // GUARDADA
  if (!savedRow || !proformaId) return

  await swalDeleteConfirm(
    `¿Eliminar la nota "${savedRow.text}"?`, 'Esta acción no se puede deshacer.',
    async ({ close, showError }) => {
      const ok = await useProformaNoteDeleteStore.getState().deleteItem(savedRow.id, proformaId)
      if (ok) {
        toastSuccess('Nota eliminada', savedRow.text)
        close()
      } else {
        showError('No se pudo eliminar la nota.')
      }
    },
    { title: 'Eliminando...' }
  )
}
