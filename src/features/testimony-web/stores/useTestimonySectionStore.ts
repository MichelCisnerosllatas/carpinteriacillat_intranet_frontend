import { create } from 'zustand'
import { testimonyService } from '../services/testimony.service'

type State = {
  isLoading: boolean
  isError: boolean
  error: string | null
  idSection: number | null
  sectionName: string | null
}

type Action = {
  /** Cachea el resultado — la sección de testimonios no cambia durante la sesión. */
  get: () => Promise<boolean>
}

export const useTestimonySectionStore = create<State & Action>((set, get) => ({
  isLoading: false, isError: false, error: null, idSection: null, sectionName: null,

  get: async () => {
    if (get().idSection !== null) return true
    if (get().isLoading) return false
    set({ isLoading: true, isError: false, error: null })
    try {
      const res = await testimonyService.getSection()
      if (!res.success || !res.data) throw new Error(res.message)
      set({ isLoading: false, idSection: res.data.id_section, sectionName: res.data.section_name })
      return true
    } catch (error: any) {
      set({
        isLoading: false,
        isError: true,
        error: error?.response?.data?.message ?? error?.message ?? 'No existe una sección de testimonios configurada.',
      })
      return false
    }
  },
}))
