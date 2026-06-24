import { create } from 'zustand'
import { storageFoldersService } from '../services/storage-folders.service'
import type { StorageFolderTreeNode } from '../data/schema'

type State = {
  tree:       StorageFolderTreeNode[]
  hasLoaded:  boolean
  isFetching: boolean
  isError:    boolean
}

type Action = {
  load:  () => Promise<void>
  reset: () => void
}

export const useStorageFolderTreeStore = create<State & Action>((set) => ({
  tree: [], hasLoaded: false, isFetching: false, isError: false,

  load: async () => {
    set({ isFetching: true, isError: false })
    try {
      const res = await storageFoldersService.getAll()
      set({ hasLoaded: true, isFetching: false, tree: (res.data ?? []) as StorageFolderTreeNode[] })
    } catch {
      set({ hasLoaded: true, isFetching: false, isError: true })
    }
  },

  reset: () => set({ tree: [], hasLoaded: false, isFetching: false, isError: false }),
}))
