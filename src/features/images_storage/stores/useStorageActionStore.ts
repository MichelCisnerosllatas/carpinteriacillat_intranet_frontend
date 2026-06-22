import { create } from 'zustand'
import { storageService } from '../services/storage.service'
import type { VerifyResult, BulkDeleteMode, EnrichedStorageFile } from '../data/schema'

type State = {
  isVerifying: boolean
  isActing:    boolean
  error:       string | null
  verifyResult: VerifyResult | null
}

type Action = {
  verify:          (path: string, knownDbRecord: EnrichedStorageFile['dbRecord']) => Promise<VerifyResult | null>
  deletePhysical:  (path: string) => Promise<boolean>
  deleteDbRecord:  (id: number) => Promise<boolean>
  deleteBoth:      (path: string, id: number) => Promise<boolean>
  bulkAction:      (files: EnrichedStorageFile[], mode: BulkDeleteMode) => Promise<{ success: number; failed: number }>
  moveFile:        (params: { oldPath: string; newName?: string; newFolder?: string; dbId?: number }) => Promise<{ ok: boolean; newPath?: string; newUrl?: string }>
  clearResult:     () => void
}

export const useStorageActionStore = create<State & Action>((set) => ({
  isVerifying:  false,
  isActing:     false,
  error:        null,
  verifyResult: null,

  verify: async (path, knownDbRecord) => {
    set({ isVerifying: true, error: null, verifyResult: null })
    try {
      const res = await storageService.exists(path)
      const result: VerifyResult = {
        path,
        existsOnDisk: res.data?.exists ?? false,
        diskUrl:      res.data?.url ?? '',
        dbRecord:     knownDbRecord,
      }
      set({ verifyResult: result, isVerifying: false })
      return result
    } catch {
      set({ isVerifying: false, error: 'No se pudo verificar el estado del archivo.' })
      return null
    }
  },

  deletePhysical: async (path) => {
    set({ isActing: true, error: null })
    try {
      const res = await storageService.deleteFile(path)
      set({ isActing: false })
      return res.success
    } catch (e: any) {
      set({ isActing: false, error: e?.response?.data?.message ?? 'Error al eliminar el archivo.' })
      return false
    }
  },

  deleteDbRecord: async (id) => {
    set({ isActing: true, error: null })
    try {
      const ok = await storageService.deleteDbRecord(id)
      set({ isActing: false })
      return ok
    } catch (e: any) {
      set({ isActing: false, error: e?.response?.data?.message ?? 'Error al eliminar el registro.' })
      return false
    }
  },

  deleteBoth: async (path, id) => {
    set({ isActing: true, error: null })
    try {
      await storageService.deleteFile(path)
      await storageService.deleteDbRecord(id)
      set({ isActing: false })
      return true
    } catch (e: any) {
      set({ isActing: false, error: e?.response?.data?.message ?? 'Error en la eliminación.' })
      return false
    }
  },

  bulkAction: async (files, mode) => {
    set({ isActing: true, error: null })
    let success = 0
    let failed  = 0

    for (const file of files) {
      try {
        if (mode === 'physical') {
          const res = await storageService.deleteFile(file.path)
          if (res.success) success++; else failed++
        } else if (mode === 'db') {
          if (file.dbRecord) {
            const ok = await storageService.deleteDbRecord(file.dbRecord.id_image)
            if (ok) success++; else failed++
          } else {
            failed++ // no DB record to delete
          }
        } else {
          // both
          await storageService.deleteFile(file.path)
          if (file.dbRecord) await storageService.deleteDbRecord(file.dbRecord.id_image)
          success++
        }
      } catch {
        failed++
      }
    }

    set({ isActing: false })
    return { success, failed }
  },

  moveFile: async ({ oldPath, newName, newFolder, dbId }) => {
    set({ isActing: true, error: null })
    try {
      const res = await storageService.moveFile({ old_path: oldPath, new_name: newName, new_folder: newFolder })
      if (!res.success) {
        set({ isActing: false, error: res.message })
        return { ok: false }
      }
      if (dbId) {
        await storageService.updateDbPatch(dbId, res.data.new_path)
      }
      set({ isActing: false })
      return { ok: true, newPath: res.data.new_path, newUrl: res.data.url }
    } catch (e: any) {
      set({ isActing: false, error: e?.response?.data?.message ?? 'Error al mover el archivo.' })
      return { ok: false }
    }
  },

  clearResult: () => set({ verifyResult: null, error: null }),
}))
