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

type Action = {
  get: (id: number) => Promise<boolean>
  /** `displaySettings` = solo las claves que cambiaron (null = volver al valor por defecto). */
  update: (id: number, displaySettings: Record<string, unknown>) => Promise<boolean>
  reset: () => void
}

/**
 * Estado propio del tab "Apariencia" de Configuración de Sección — deliberadamente separado de
 * `useSectionListStore`/`useSectionFormStore` (que ya maneja el tab "Estructura", los tabs/
 * permisos de Imágenes/Botones/Items) para que ambos tabs carguen y guarden de forma
 * independiente, sin pisarse `isSubmitting`/`error` entre sí. Pega al MISMO endpoint PATCH de la
 * sección — nomás que solo manda `display_settings` (el backend lo mezcla con lo guardado).
 */
export const useSectionAppearanceStore = create<State & Action>((set) => ({
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
        error: error?.response?.data?.message ?? error?.message ?? 'Error al cargar la apariencia de la sección.',
      })
      return false
    }
  },

  update: async (id, displaySettings) => {
    set({ isSubmitting: true, error: null, fieldErrors: null })
    try {
      const res = await sectionsService.patch(id, { display_settings: displaySettings })
      if (!res.success) {
        set({ isSubmitting: false, error: res.message, fieldErrors: res.errors ?? null })
        return false
      }
      set({ isSubmitting: false })
      return true
    } catch (error: any) {
      set({
        isSubmitting: false,
        error: error?.response?.data?.message ?? error?.message ?? 'Error al guardar la apariencia de la sección.',
        fieldErrors: error?.response?.data?.errors ?? null,
      })
      return false
    }
  },

  reset: () => set({ isLoading: false, isSubmitting: false, isError: false, error: null, fieldErrors: null, section: null }),
}))
