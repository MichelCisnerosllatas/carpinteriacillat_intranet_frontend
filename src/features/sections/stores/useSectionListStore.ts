import { create } from 'zustand'
import { sectionsService } from '../services/sections.service'
import { getStateOption } from '@/shared/config/entity-states'
import type { SectionListRequestDto, SectionJoinApiItem } from '../model/sectionget.dto'
import type { LinksPaginationType } from '@/shared/type/linksPagination.type'
import type { MetaPaginationType } from '@/shared/type/metaPagination.type'
import type { Section } from '../data/schema'

type State = {
  hasLoaded: boolean
  isInitialLoading: boolean
  isFetching: boolean
  isError: boolean
  message: string | null
  items: Section[]
  links: LinksPaginationType | null
  meta: MetaPaginationType | null
  filters: SectionListRequestDto
  currentItem: Section | null
}

type Action = {
  load: (params?: SectionListRequestDto) => Promise<boolean>
  setCurrentItem: (item: Section | null) => void
  reset: () => void
}

const defaultFilters: SectionListRequestDto = { page: 1, per_page: 10, search: '', state: undefined }

const mapFromApi = (item: SectionJoinApiItem): Section => {
  const stateOpt = getStateOption(item.section_state)
  return {
    id: item.id_section,
    name: item.section_name,
    description: item.section_description,
    idTypesection: item.id_typesection,
    typesectionName: item.typesection?.typesection_name ?? '',
    idNavigation: item.id_navigation,
    navigationName: item.navigation?.navigation_name ?? null,
    status: item.section_state === 1 ? 'active' : 'inactive',
    statusLabel: stateOpt.label,
    stateValue: item.section_state,
    createdAt: item.section_created_at,
    updatedAt: item.section_updated_at ?? '',
  }
}

export const useSectionListStore = create<State & Action>((set, get) => ({
  hasLoaded: false, isInitialLoading: false, isFetching: false,
  isError: false, message: null, items: [], links: null, meta: null,
  filters: defaultFilters, currentItem: null,

  setCurrentItem: (item) => set({ currentItem: item }),

  load: async (params = {}) => {
    if (get().isFetching) return false
    const nextFilters = { ...get().filters, ...params }
    set({ filters: nextFilters, isFetching: true, isError: false, message: null })
    try {
      const response = await sectionsService.getList(nextFilters)
      if (!response.success) throw new Error(response.message)
      set({
        hasLoaded: true, isInitialLoading: false, isFetching: false, isError: false,
        message: response.message,
        items: response.data.map(mapFromApi),
        links: response.links, meta: response.meta,
        filters: { ...nextFilters, page: response.meta?.current_page ?? nextFilters.page, per_page: response.meta?.per_page ?? nextFilters.per_page },
      })
      return true
    } catch (error: any) {
      set({ hasLoaded: true, isInitialLoading: false, isFetching: false, isError: true, message: error?.response?.data?.message ?? error?.message ?? 'Error al cargar.' })
      return false
    }
  },

  reset: () => set({ hasLoaded: false, isInitialLoading: false, isFetching: false, isError: false, message: null, items: [], links: null, meta: null, filters: defaultFilters }),
}))
