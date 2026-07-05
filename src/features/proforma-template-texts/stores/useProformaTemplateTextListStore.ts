import { create } from 'zustand'
import { proformaTemplateTextsService } from '../services/proforma-template-texts.service'
import type { ProformaTemplateTextApiItem } from '../model/proformatemplatetextget.dto'
import type { ProformaTemplateText } from '../data/schema'

type State = {
  hasLoaded: boolean
  isFetching: boolean
  isError: boolean
  message: string | null
  items: ProformaTemplateText[]
  templateId: number | null
}

type Action = {
  loadByTemplate: (templateId: number) => Promise<boolean>
  reset: () => void
}

const mapFromApi = (item: ProformaTemplateTextApiItem): ProformaTemplateText => ({
  id: item.id,
  templateId: item.template_id,
  key: item.key,
  title: item.title,
  content: item.content,
  visible: !!item.visible,
  order: item.order,
  createdAt: item.created_at,
  updatedAt: item.updated_at ?? '',
})

export const useProformaTemplateTextListStore = create<State & Action>((set) => ({
  hasLoaded: false, isFetching: false, isError: false, message: null, items: [], templateId: null,

  loadByTemplate: async (templateId) => {
    set({ isFetching: true, isError: false, message: null, templateId })
    try {
      const response = await proformaTemplateTextsService.getList({ template_id: templateId, per_page: 100 })
      if (!response.success) throw new Error(response.message)
      const items = response.data.map(mapFromApi).sort((a, b) => a.order - b.order)
      set({ hasLoaded: true, isFetching: false, isError: false, message: response.message, items })
      return true
    } catch (error: any) {
      set({ hasLoaded: true, isFetching: false, isError: true, message: error?.response?.data?.message ?? error?.message ?? 'Error al cargar.' })
      return false
    }
  },

  reset: () => set({ hasLoaded: false, isFetching: false, isError: false, message: null, items: [], templateId: null }),
}))
