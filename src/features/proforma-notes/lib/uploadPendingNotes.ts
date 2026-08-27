// src/features/proforma-notes/lib/uploadPendingNotes.ts
import { toastError } from '@/shared/lib/toast'
import { useProformaNoteFormStore } from '../stores/useProformaNoteFormStore'
import { usePendingNotesStore } from '../stores/usePendingNotesStore'

interface UploadPendingNotesDeps {
  proformaId: number
}

/**
 * Se dispara sola en cuanto la proforma obtiene su id real (ver `submitProformaHeader`, tras
 * `uploadPendingItems`). Recorre `usePendingNotesStore().pendingNotes` y sube al backend, una por
 * una, EN EL MISMO ORDEN en que se agregaron — el `order` de cada nota es su posición (índice + 1)
 * dentro de esa lista, no hay input de "orden" en la UI. Secuencial (no en paralelo), mismo motivo
 * que `uploadPendingItems.ts`. Cada nota se quita de la lista temporal en cuanto se sube bien.
 */
export async function uploadPendingNotes(deps: UploadPendingNotesDeps): Promise<void> {
  const { proformaId } = deps
  const tempIds = usePendingNotesStore.getState().pendingNotes.map((p) => p.tempId)

  for (let i = 0; i < tempIds.length; i++) {
    const tempId = tempIds[i]
    const note = usePendingNotesStore.getState().pendingNotes.find((p) => p.tempId === tempId)
    if (!note) continue // el usuario lo borró mientras esperaba su turno

    usePendingNotesStore.getState().setUploadingTempId(tempId)
    const ok = await useProformaNoteFormStore.getState().create({
      proforma_id: proformaId,
      text: note.text,
      order: i + 1,
    })

    if (ok) {
      usePendingNotesStore.getState().removePendingNote(tempId)
    } else {
      toastError('Error', `No se pudo guardar la nota "${note.text}".`)
    }
  }

  usePendingNotesStore.getState().setUploadingTempId(null)
}
