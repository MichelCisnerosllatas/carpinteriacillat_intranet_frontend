import { create } from 'zustand'
import { sectionsService } from '../services/sections.service'
import { mapSectionFromApi } from './useSectionListStore'
import type { Section } from '../data/schema'

type ApiFieldErrors = Record<string, string[]>

type State = {
  isLoading: boolean
  isSubmitting: boolean
  isError: boolean
  error: string | null
  fieldErrors: ApiFieldErrors | null
  section: Section | null
}

type VisibilityData = {
  show_title?: boolean
  show_subtitle?: boolean
  show_description?: boolean
}

type Action = {
  get: (id: number) => Promise<boolean>
  update: (id: number, data: VisibilityData) => Promise<boolean>
  reset: () => void
}

/**
 * Estado propio del tab "Visibilidad" de Configuración de Sección — deliberadamente separado de
 * `useSectionListStore`/`useSectionFormStore` (que ya maneja el tab "Estructura", los tabs/
 * permisos de Imágenes/Botones/Items) para que ambos tabs carguen y guarden de forma
 * independiente, sin pisarse `isSubmitting`/`error` entre sí. Pega al MISMO endpoint PATCH
 * (`sectionsService.patch`, tabla `section_web_setting`) — nomás que solo manda los 3 campos de
 * este tab.
 */
export const useSectionContentVisibilityStore = create<State & Action>((set) => ({
  isLoading: false, isSubmitting: false, isError: false, error: null, fieldErrors: null, section: null,

  get: async (id) => {
    set({ isLoading: true, isError: false, error: null })
    try {
      const res = await sectionsService.getById(id)
      if (!res.success) throw new Error(res.message)
      set({ isLoading: false, section: mapSectionFromApi(res.data) })
      return true
    } catch (error: any) {
      set({
        isLoading: false,
        isError: true,
        error: error?.response?.data?.message ?? error?.message ?? 'Error al cargar la visibilidad de la sección.',
      })
      return false
    }
  },

  update: async (id, data) => {
    set({ isSubmitting: true, error: null, fieldErrors: null })
    try {
      const res = await sectionsService.patch(id, data)
      if (!res.success) {
        set({ isSubmitting: false, error: res.message, fieldErrors: res.errors ?? null })
        return false
      }
      set({ isSubmitting: false })
      return true
    } catch (error: any) {
      set({
        isSubmitting: false,
        error: error?.response?.data?.message ?? error?.message ?? 'Error al actualizar la visibilidad de la sección.',
        fieldErrors: error?.response?.data?.errors ?? null,
      })
      return false
    }
  },

  reset: () => set({ isLoading: false, isSubmitting: false, isError: false, error: null, fieldErrors: null, section: null }),
}))
