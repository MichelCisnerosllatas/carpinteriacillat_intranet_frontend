import { create } from 'zustand'
import { storageFoldersService } from '../services/storage-folders.service'
import type { StorageFolderPostRequestDto } from '../model/storagefolder.post.dto'
import type { StorageFolderPatchRequestDto, StorageFolderMoveRequestDto, StorageFolderDeleteRequestDto } from '../model/storagefolder.patch.dto'

type State = {
  isSubmitting: boolean
  error:        string | null
}

type Action = {
  create:       (payload: StorageFolderPostRequestDto) => Promise<boolean>
  rename:       (payload: StorageFolderPatchRequestDto) => Promise<boolean>
  moveFolder:   (payload: StorageFolderMoveRequestDto) => Promise<boolean>
  moveFoldersBulk: (items: StorageFolderMoveRequestDto[]) => Promise<{ done: number; errors: number; lastError?: string | null }>
  deleteFolder: (payload: StorageFolderDeleteRequestDto) => Promise<boolean>
  clearError:   () => void
}

export const useStorageFolderActionStore = create<State & Action>((set) => ({
  isSubmitting: false,
  error:        null,

  create: async (payload) => {
    set({ isSubmitting: true, error: null })
    try {
      const res = await storageFoldersService.create(payload)
      set({ isSubmitting: false })
      return res.success
    } catch (error: any) {
      const msg = error?.response?.data?.message ?? error?.message ?? 'Error al crear la carpeta.'
      set({ isSubmitting: false, error: msg })
      return false
    }
  },

  rename: async (payload) => {
    set({ isSubmitting: true, error: null })
    try {
      const res = await storageFoldersService.rename(payload)
      set({ isSubmitting: false })
      return res.success
    } catch (error: any) {
      const msg = error?.response?.data?.message ?? error?.message ?? 'Error al renombrar la carpeta.'
      set({ isSubmitting: false, error: msg })
      return false
    }
  },

  moveFolder: async (payload) => {
    set({ isSubmitting: true, error: null })
    try {
      const res = await storageFoldersService.move(payload)
      set({ isSubmitting: false })
      return res.success
    } catch (error: any) {
      const msg = error?.response?.data?.message ?? error?.message ?? 'Error al mover la carpeta.'
      set({ isSubmitting: false, error: msg })
      return false
    }
  },

  moveFoldersBulk: async (items) => {
    set({ isSubmitting: true, error: null })
    let done = 0, errors = 0
    let lastError: string | null = null
    for (const item of items) {
      try {
        const res = await storageFoldersService.move(item)
        if (res.success) done++
        else { errors++; lastError = res.message ?? 'Error desconocido' }
      } catch (error: any) {
        errors++
        lastError = error?.response?.data?.message ?? error?.message ?? 'Error al mover la carpeta.'
      }
    }
    set({ isSubmitting: false, error: lastError })
    return { done, errors, lastError }
  },

  deleteFolder: async (payload) => {
    set({ isSubmitting: true, error: null })
    try {
      const res = await storageFoldersService.delete(payload)
      set({ isSubmitting: false })
      return res.success
    } catch (error: any) {
      const msg = error?.response?.data?.message ?? error?.message ?? 'Error al eliminar la carpeta.'
      set({ isSubmitting: false, error: msg })
      return false
    }
  },

  clearError: () => set({ error: null }),
}))
