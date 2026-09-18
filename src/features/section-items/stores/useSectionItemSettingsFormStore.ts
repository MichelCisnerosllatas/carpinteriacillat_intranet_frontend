// src/features/section-items/stores/useSectionItemSettingsFormStore.ts
import { create } from 'zustand'
import { sectionItemsService } from '../services/sectionitems.service'
import type { SectionItemPutRequestDto } from '../model/sectionitemput.dto'
import { useSectionItemListStore } from './useSectionItemListStore'

type State = {
  isSubmitting: boolean
  error: string | null
  fieldErrors: Record<string, string[]> | null
}

type Action = {
  /**
   * Store aparte de `useSectionItemFormStore` a propósito: ese siempre hace `PUT` (reemplazo
   * completo, usado por el form de edición normal). Acá siempre se manda `PATCH` con un
   * subconjunto de campos (`tab_info`, `tab_details`, `details_add`, etc. — ver
   * `SectionItemSettingsForm`), sin tocar título/descripción/etc. del item.
   */
  update: (id: number, data: Partial<SectionItemPutRequestDto>) => Promise<boolean>
  reset: () => void
}

export const useSectionItemSettingsFormStore = create<State & Action>((set) => ({
  isSubmitting: false, error: null, fieldErrors: null,

  update: async (id, data) => {
    set({ isSubmitting: true, error: null, fieldErrors: null })
    try {
      const res = await sectionItemsService.patch(id, data)
      if (!res.success) {
        set({ isSubmitting: false, error: res.message, fieldErrors: res.errors ?? null })
        return false
      }
      useSectionItemListStore.getState().setForceReload(true)
      await useSectionItemListStore.getState().load()
      set({ isSubmitting: false })
      return true
    } catch (error: any) {
      set({
        isSubmitting: false,
        error: error?.response?.data?.message ?? error?.message ?? 'Error al actualizar.',
        fieldErrors: error?.response?.data?.errors ?? null,
      })
      return false
    }
  },

  reset: () => set({ isSubmitting: false, error: null, fieldErrors: null }),
}))
