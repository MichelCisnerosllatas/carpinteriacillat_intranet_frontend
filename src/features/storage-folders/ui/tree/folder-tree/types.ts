
// Shared drag payload type — matches what storage-explorer encodes in dataTransfer
export type DragPayload = { kind: 'file' | 'folder'; paths: string[]; encodeds: string[] }
