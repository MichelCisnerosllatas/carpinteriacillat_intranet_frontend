import { create } from 'zustand'
import { webWorksService } from '../services/web-works.service'
import { useWebWorkListStore } from './useWebWorkListStore'

type State = {
  isSubmitting: boolean
  error: string | null
  fieldErrors: Record<string, string[]> | null
}

type Action = {
  /** Manda los ids en el nuevo orden: todos (la API deja 1..N) o solo los de un tipo (se reordenan entre ellos). */
  confirm: (ids: number[]) => Promise<boolean>
  reset: () => void
}

export const useWebWorkReorderStore = create<State & Action>((set) => ({
  isSubmitting: false, error: null, fieldErrors: null,

  confirm: async (ids) => {
    set({ isSubmitting: true, error: null, fieldErrors: null })
    try {
      const res = await webWorksService.reorder({ ids })
      if (!res.success) {
        set({ isSubmitting: false, error: res.message, fieldErrors: res.errors ?? null })
        return false
      }
      useWebWorkListStore.getState().setForceReload(true)
      set({ isSubmitting: false })
      return true
    } catch (error: any) {
      set({
        isSubmitting: false,
        error: error?.response?.data?.message ?? error?.message ?? 'Error al reordenar.',
        fieldErrors: error?.response?.data?.errors ?? null,
      })
      return false
    }
  },

  reset: () => set({ isSubmitting: false, error: null, fieldErrors: null }),
}))
