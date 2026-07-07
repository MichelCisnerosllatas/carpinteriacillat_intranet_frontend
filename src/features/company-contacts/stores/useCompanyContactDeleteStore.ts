import { create } from 'zustand'
import { companyContactsService } from '../services/company-contacts.service'
import { useCompanyContactListStore } from './useCompanyContactListStore'

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

export const useCompanyContactDeleteStore = create<State & Action>((set) => ({
  isLoading: false,
  error: null,

  toggleState: async (id, newStatus) => {
    set({ isLoading: true, error: null })
    try {
      await companyContactsService.patch(id, { status: newStatus })
      await useCompanyContactListStore.getState().load()
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
      await companyContactsService.delete(id)
      await useCompanyContactListStore.getState().load()
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
      await Promise.all(ids.map((id) => companyContactsService.patch(id, { status: newStatus })))
      await useCompanyContactListStore.getState().load()
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
      await Promise.all(ids.map((id) => companyContactsService.delete(id)))
      await useCompanyContactListStore.getState().load()
      return true
    } catch {
      set({ error: 'No se pudieron eliminar los registros.' })
      return false
    } finally {
      set({ isLoading: false })
    }
  },
}))
