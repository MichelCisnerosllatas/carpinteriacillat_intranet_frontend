// src/features/proforma-notes/stores/usePendingNotesStore.ts
import { create } from 'zustand'
import type { NoteItem, PendingNoteItem } from '../lib/types'

let nextTempId = 0

type State = {
  /** Notas agregadas ANTES de que la proforma tenga id — la lista temporal de notas.
   * Se recorre una por una para registrarlas en cuanto la proforma obtiene su id real. */
  pendingNotes: PendingNoteItem[]
  /** tempId de la nota que se está subiendo al backend ahora mismo (o null si ninguna). */
  uploadingTempId: string | null
}

type Action = {
  addPendingNote: (item: NoteItem) => void
  updatePendingNote: (tempId: string, changes: Partial<NoteItem>) => void
  removePendingNote: (tempId: string) => void
  setUploadingTempId: (tempId: string | null) => void
  /** Vacía la lista — se llama al cerrar/cancelar el formulario de creación. */
  clearPendingNotes: () => void
}

export const usePendingNotesStore = create<State & Action>((set) => ({
  pendingNotes: [],
  uploadingTempId: null,

  addPendingNote: (item) => set((state) => ({
    pendingNotes: [...state.pendingNotes, { ...item, tempId: `pending-${++nextTempId}` }],
  })),

  updatePendingNote: (tempId, changes) => set((state) => ({
    pendingNotes: state.pendingNotes.map((p) => (p.tempId === tempId ? { ...p, ...changes } : p)),
  })),

  removePendingNote: (tempId) => set((state) => ({
    pendingNotes: state.pendingNotes.filter((p) => p.tempId !== tempId),
  })),

  setUploadingTempId: (tempId) => set({ uploadingTempId: tempId }),

  clearPendingNotes: () => set({ pendingNotes: [], uploadingTempId: null }),
}))
