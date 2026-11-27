import { create } from 'zustand'
import { sectionButtonsService } from '../services/sectionbuttons.service'
import { getVisibilityStateOption } from '@/shared/config/entity-states'
import type { SectionButtonListRequestDto, SectionButtonApiItem } from '../model/sectionbuttonget.dto'
import type { LinksPaginationType } from '@/shared/type/linksPagination.type'
import type { MetaPaginationType } from '@/shared/type/metaPagination.type'
import type { SectionButton } from '../data/schema'

type State = {
  hasLoaded: boolean
  isInitialLoading: boolean
  isFetching: boolean
  isError: boolean
  message: string | null
  items: SectionButton[]
  links: LinksPaginationType | null
  meta: MetaPaginationType | null
  filters: SectionButtonListRequestDto
  currentItem: SectionButton | null
  /** false = load() reutiliza los datos ya cargados (hasLoaded) en vez de pedirlos de nuevo. Por defecto true: la pantalla vuelve a pedir la lista cada vez que se entra a la ruta. */
  forceReload: boolean
}

type Action = {
  setForceReload: (value: boolean) => void
  load: (params?: SectionButtonListRequestDto) => Promise<boolean>
  loadById: (id: number) => Promise<boolean>
  setCurrentItem: (item: SectionButton | null) => void
  reset: () => void
}

const defaultFilters: SectionButtonListRequestDto = { page: 1, per_page: 10, search: '', state: undefined, id_section: undefined }

const mapFromApi = (item: SectionButtonApiItem): SectionButton => {
  const stateOpt = getVisibilityStateOption(item.sectionbutton_state)
  return {
    id: item.id_section_button,
    idSection: item.id_section,
    label: item.sectionbutton_label,
    url: item.sectionbutton_url,
    icon: item.sectionbutton_icon,
    variant: item.sectionbutton_variant,
    actionKey: item.sectionbutton_action_key,
    order: item.sectionbutton_order,
    status: item.sectionbutton_state === 1 ? 'active' : 'inactive',
    statusLabel: stateOpt.label,
    stateValue: item.sectionbutton_state,
    createdAt: item.sectionbutton_created_at,
    updatedAt: item.sectionbutton_updated_at ?? '',
    createdAtFormatted: item.sectionbutton_created_at_formatted ?? null,
    updatedAtFormatted: item.sectionbutton_updated_at_formatted ?? null,
  }
}

export const useSectionButtonListStore = create<State & Action>((set, get) => ({
  hasLoaded: false, isInitialLoading: false, isFetching: false,
  isError: false, message: null, items: [], links: null, meta: null,
  filters: defaultFilters, currentItem: null,
  forceReload: true,

  setForceReload: (value) => set({ forceReload: value }),
  setCurrentItem: (item) => set({ currentItem: item }),

  loadById: async (id) => {
    set({ isFetching: true })
    try {
      const response = await sectionButtonsService.getById(id)
      if (!response.success) throw new Error(response.message)
      const mapped = mapFromApi(response.data)
      set({ isFetching: false, currentItem: mapped, hasLoaded: true })
      return true
    } catch (error: any) {
      set({ isFetching: false, isError: true, message: error?.response?.data?.message ?? error?.message ?? 'Error al cargar.' })
      return false
    }
  },

  load: async (params = {}) => {
    if (get().isFetching) return false
    if (!get().forceReload && get().hasLoaded) return true
    const nextFilters = { ...get().filters, ...params }
    set({ filters: nextFilters, isFetching: true })
    try {
      const response = await sectionButtonsService.getList(nextFilters)
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
