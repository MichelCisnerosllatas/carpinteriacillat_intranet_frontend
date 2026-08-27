// src/features/proforma-notes/lib/types.ts

/** Una nota adicional de la proforma — sin importar si ya está guardada en el backend o no. */
export type NoteItem = {
  text: string
}

/** Una nota agregada ANTES de que la proforma tenga id — solo vive en memoria, todavía no tiene
 * un id real del backend, por eso usa un `tempId` propio para identificarla en pantalla. */
export type PendingNoteItem = NoteItem & { tempId: string }

export const emptyNoteItem: NoteItem = { text: '' }
