// src/features/proforma-notes/hooks/useProformaNotes.ts
'use client'

import { useEffect } from 'react'
import { useProformaNoteListStore } from '../stores/useProformaNoteListStore'
import { usePendingNotesStore } from '../stores/usePendingNotesStore'

interface UseProformaNotesOptions {
  proformaId: number | null
}

/**
 * Solo el ESTADO de las notas (qué hay guardado, qué fila está subiendo) y los efectos que lo
 * mantienen sincronizado con el backend — clon simplificado de `useProformaCart.ts`. Este hook NO
 * decide qué pasa al agregar o eliminar una nota — esa lógica vive en
 * `lib/row-actions/` (`addNoteToList.ts`, `removeNoteFromList.ts`). El componente
 * llama a esas funciones directamente — este hook solo expone el estado que leen.
 *
 * - `savedNotes`: notas ya guardadas en el backend (store de `proforma-notes`).
 * - `pendingNotes`: notas agregadas ANTES de que la proforma tuviera id — viven en su propio
 *   store, `usePendingNotesStore`.
 */
export function useProformaNotes({ proformaId }: UseProformaNotesOptions) {
  const {
    items: savedNotes,
    isFetching,
    loadByProforma,
    reset: resetSavedNotes,
  } = useProformaNoteListStore()
  const { pendingNotes, uploadingTempId } = usePendingNotesStore()

  useEffect(() => {
    if (proformaId) void loadByProforma(proformaId)
    return () => resetSavedNotes()
  }, [proformaId])

  // Solo al desmontar el formulario por completo (deps []). La subida de `pendingNotes` al crear
  // la proforma NO ocurre acá — la maneja `submitProformaHeader` (en el feature `proformas`), que
  // llama a `uploadPendingNotes` y espera a que termine ANTES de cerrar el modal y navegar. Este
  // cleanup solo limpia el store si el usuario cierra el formulario sin llegar a registrar nada.
  useEffect(() => {
    return () => usePendingNotesStore.getState().clearPendingNotes()
  }, [])

  return {
    savedNotes,
    isFetching,
    pendingNotes,
    uploadingTempId,
    hasItems: savedNotes.length > 0 || pendingNotes.length > 0,
  }
}
