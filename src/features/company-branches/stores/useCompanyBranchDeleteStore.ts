import { create } from 'zustand'
import { companyBranchesService } from '../services/company-branches.service'
import { useCompanyBranchListStore } from './useCompanyBranchListStore'

type State = {
  isLoading: boolean
  error: string | null
}

type Action = {
  toggleState: (id: number, newStatus: number) => Promise<boolean>
  deleteItem: (id: number) => Promise<boolean>
  bulkToggleState: (ids: number[], newStatus: number) => Promise<boolean>
  bulkDeleteItems: (ids: number[]) => Promise<boolean>
}

export const useCompanyBranchDeleteStore = create<State & Action>((set) => ({
  isLoading: false,
  error: null,

  toggleState: async (id, newStatus) => {
    set({ isLoading: true, error: null })
    try {
      await companyBranchesService.patch(id, { status: newStatus })
      await useCompanyBranchListStore.getState().load()
      return true
    } catch {
      set({ error: 'No se pudo cambiar el estado.' })
      return false
    } finally {
      set({ isLoading: false })
    }
  },

  deleteItem: async (id) => {
    set({ isLoading: true, error: null })
    try {
      await companyBranchesService.delete(id)
      await useCompanyBranchListStore.getState().load()
      return true
    } catch {
      set({ error: 'No se pudo eliminar el registro.' })
      return false
    } finally {
      set({ isLoading: false })
    }
  },

  bulkToggleState: async (ids, newStatus) => {
    set({ isLoading: true, error: null })
    try {
      await Promise.all(ids.map((id) => companyBranchesService.patch(id, { status: newStatus })))
      await useCompanyBranchListStore.getState().load()
      return true
    } catch {
      set({ error: 'No se pudieron actualizar los registros.' })
      return false
    } finally {
      set({ isLoading: false })
    }
  },

  bulkDeleteItems: async (ids) => {
    set({ isLoading: true, error: null })
    try {
      await Promise.all(ids.map((id) => companyBranchesService.delete(id)))
      await useCompanyBranchListStore.getState().load()
      return true
    } catch {
      set({ error: 'No se pudieron eliminar los registros.' })
      return false
    } finally {
      set({ isLoading: false })
    }
  },
}))
