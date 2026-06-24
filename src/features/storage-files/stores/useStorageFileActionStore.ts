import { create } from 'zustand'
import { storageFilesService } from '../services/storage-files.service'
import type { StorageFilePatchRequestDto } from '../model/storagefile.patch.dto'

type UploadEntry = { id: string; file: File; status: 'pending' | 'uploading' | 'done' | 'error'; error?: string }

type State = {
  isSubmitting:  boolean
  isDownloading: boolean
  error:         string | null
  // Upload dialog state
  uploadEntries: UploadEntry[]
  isUploading:   boolean
  uploadFolder:  string
}

type Action = {
  setUploadEntries: (entries: UploadEntry[]) => void
  setUploadFolder:  (folder: string) => void
  resetUpload:      () => void
  uploadAll:        (
    folder: string | undefined,
    onProgress: (id: string, status: UploadEntry['status'], error?: string) => void,
    signal: AbortSignal
  ) => Promise<{ done: number; errors: number }>

  rename:       (payload: StorageFilePatchRequestDto) => Promise<boolean>
  move:         (payload: StorageFilePatchRequestDto) => Promise<boolean>
  moveBulk:     (items: { pathEncoded: string; newFolder: string }[]) => Promise<{ done: number; errors: number }>
  deleteFile:   (pathEncoded: string) => Promise<boolean>
  deleteBulk:   (pathEncodeds: string[]) => Promise<{ done: number; errors: number }>
  download:     (pathEncoded: string, fileName: string) => Promise<void>
  openPreview:  (pathEncoded: string, mimeType: string) => Promise<void>
  clearError:   () => void
}

let entryCounter = 0
export const nextEntryId = () => String(++entryCounter)

export const useStorageFileActionStore = create<State & Action>((set, get) => ({
  isSubmitting:  false,
  isDownloading: false,
  error:         null,
  uploadEntries: [],
  isUploading:   false,
  uploadFolder:  '',

  setUploadEntries: (entries) => set({ uploadEntries: entries }),
  setUploadFolder:  (folder)  => set({ uploadFolder: folder }),
  resetUpload:      ()        => set({ uploadEntries: [], uploadFolder: '', isUploading: false }),

  uploadAll: async (folder, onProgress, signal) => {
    const entries = get().uploadEntries.filter((e) => e.status === 'pending' || e.status === 'error')
    set({ isUploading: true })
    let done = 0; let errors = 0

    for (const entry of entries) {
      if (signal.aborted) { onProgress(entry.id, 'pending'); continue }
      onProgress(entry.id, 'uploading')
      try {
        const fd = new FormData()
        fd.append('file', entry.file)
        if (folder?.trim()) fd.append('folder', folder.trim())
        const res = await storageFilesService.upload(fd, signal)
        if (res.success) { done++; onProgress(entry.id, 'done') }
        else { errors++; onProgress(entry.id, 'error', res.message) }
      } catch (err: any) {
        const isCanceled = err?.code === 'ERR_CANCELED' || err?.name === 'CanceledError' || err?.name === 'AbortError'
        if (isCanceled) { onProgress(entry.id, 'pending') }
        else { errors++; onProgress(entry.id, 'error', err?.response?.data?.message ?? 'Error al subir') }
      }
    }

    set({ isUploading: false })
    return { done, errors }
  },

  rename: async (payload) => {
    set({ isSubmitting: true, error: null })
    try {
      const res = await storageFilesService.rename(payload)
      set({ isSubmitting: false })
      return res.success
    } catch (error: any) {
      set({ isSubmitting: false, error: error?.response?.data?.message ?? error?.message ?? 'Error al renombrar.' })
      return false
    }
  },

  move: async (payload) => {
    set({ isSubmitting: true, error: null })
    try {
      const res = await storageFilesService.rename(payload)
      set({ isSubmitting: false })
      return res.success
    } catch (error: any) {
      set({ isSubmitting: false, error: error?.response?.data?.message ?? error?.message ?? 'Error al mover.' })
      return false
    }
  },

  moveBulk: async (items) => {
    let done = 0; let errors = 0
    for (const item of items) {
      try {
        const res = await storageFilesService.rename({ path_encoded: item.pathEncoded, new_folder: item.newFolder })
        if (res.success) done++; else errors++
      } catch { errors++ }
    }
    return { done, errors }
  },

  deleteFile: async (pathEncoded) => {
    set({ isSubmitting: true, error: null })
    try {
      const res = await storageFilesService.deleteFile({ path_encoded: pathEncoded })
      set({ isSubmitting: false })
      return res.success
    } catch (error: any) {
      set({ isSubmitting: false, error: error?.response?.data?.message ?? error?.message ?? 'Error al eliminar.' })
      return false
    }
  },

  deleteBulk: async (pathEncodeds) => {
    let done = 0; let errors = 0
    for (const pe of pathEncodeds) {
      try {
        const res = await storageFilesService.deleteFile({ path_encoded: pe })
        if (res.success) done++; else errors++
      } catch { errors++ }
    }
    return { done, errors }
  },

  download: async (pathEncoded, fileName) => {
    set({ isDownloading: true })
    try {
      const blob = await storageFilesService.downloadBlob(pathEncoded, false)
      const url  = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      link.click()
      URL.revokeObjectURL(url)
    } finally {
      set({ isDownloading: false })
    }
  },

  openPreview: async (pathEncoded, mimeType) => {
    let win: Window | null = null
    try {
      win = window.open('', '_blank')
      if (!win) return
      const blob    = await storageFilesService.downloadBlob(pathEncoded, true)
      const blobUrl = URL.createObjectURL(new Blob([blob], { type: mimeType }))
      win.location.href = blobUrl
      setTimeout(() => URL.revokeObjectURL(blobUrl), 30000)
    } catch {
      win?.close()
    }
  },

  clearError: () => set({ error: null }),
}))
