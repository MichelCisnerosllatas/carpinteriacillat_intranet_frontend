import { create } from 'zustand'
import { sectionItemsService } from '../services/sectionitems.service'
import { getVisibilityStateOption } from '@/shared/config/entity-states'
import type { SectionItemListRequestDto, SectionItemApiItem, SectionItemDetailApiItem } from '../model/sectionitemget.dto'
import type { LinksPaginationType } from '@/shared/type/linksPagination.type'
import type { MetaPaginationType } from '@/shared/type/metaPagination.type'
import type { SectionItem, SectionItemDetailSummary } from '../data/schema'

type State = {
  hasLoaded: boolean
  isInitialLoading: boolean
  isFetching: boolean
  isError: boolean
  message: string | null
  items: SectionItem[]
  links: LinksPaginationType | null
  meta: MetaPaginationType | null
  filters: SectionItemListRequestDto
  currentItem: SectionItem | null
  /** false = load() reutiliza los datos ya cargados (hasLoaded) en vez de pedirlos de nuevo. Por defecto true: la pantalla vuelve a pedir la lista cada vez que se entra a la ruta. */
  forceReload: boolean
}

type Action = {
  setForceReload: (value: boolean) => void
  load: (params?: SectionItemListRequestDto) => Promise<boolean>
  loadById: (id: number) => Promise<boolean>
  setCurrentItem: (item: SectionItem | null) => void
  reset: () => void
}

const defaultFilters: SectionItemListRequestDto = {
  page: 1, per_page: 10, search: '', state: undefined, id_section: undefined, type: undefined,
}

const mapDetailFromApi = (d: SectionItemDetailApiItem): SectionItemDetailSummary => ({
  id: d.id_section_item_detail,
  title: d.sectionitemdetail_title,
  description: d.sectionitemdetail_description,
  order: d.sectionitemdetail_order,
  status: d.sectionitemdetail_state === 1 ? 'active' : 'inactive',
})

const mapFromApi = (item: SectionItemApiItem): SectionItem => {
  const stateOpt = getVisibilityStateOption(item.sectionitem_state)
  return {
    id: item.id_section_item,
    idSection: item.id_section,
    type: item.sectionitem_type,
    key: item.sectionitem_key,
    title: item.sectionitem_title,
    subtitle: item.sectionitem_subtitle,
    description: item.sectionitem_description,
    label: item.sectionitem_label,
    value: item.sectionitem_value,
    suffix: item.sectionitem_suffix,
    icon: item.sectionitem_icon,
    link: item.sectionitem_link,
    rating: item.sectionitem_rating,
    variant: item.sectionitem_variant,
    latitude: item.sectionitem_latitude,
    longitude: item.sectionitem_longitude,
    order: item.sectionitem_order,
    status: item.sectionitem_state === 1 ? 'active' : 'inactive',
    statusLabel: stateOpt.label,
    stateValue: item.sectionitem_state,
    createdAt: item.sectionitem_created_at,
    updatedAt: item.sectionitem_updated_at ?? '',
    createdAtFormatted: item.sectionitem_created_at_formatted ?? null,
    updatedAtFormatted: item.sectionitem_updated_at_formatted ?? null,
    // `web_settings` ausente (backend viejo, o un item creado a mano sin fila de settings
    // todavía) => "Info" se asume visible (igual que Section), pero "Detalles" se asume SIN,
    // no al revés — a diferencia de Section, acá el default seguro es ocultar, porque la
    // mayoría de los tipos de item (contacto, stats, features, etc.) nunca debieron tener
    // sub-detalles.
    tabInfo: item.web_settings?.tab_info ?? true,
    tabDetails: item.web_settings?.tab_details ?? false,
    detailsAdd: item.web_settings?.details_add ?? false,
    detailsReorder: item.web_settings?.details_reorder ?? false,
    detailsDelete: item.web_settings?.details_delete ?? false,
    details: item.details?.map(mapDetailFromApi),
  }
}

export const useSectionItemListStore = create<State & Action>((set, get) => ({
  hasLoaded: false, isInitialLoading: false, isFetching: false,
  isError: false, message: null, items: [], links: null, meta: null,
  filters: defaultFilters, currentItem: null,
  forceReload: true,

  setForceReload: (value) => set({ forceReload: value }),
  setCurrentItem: (item) => set({ currentItem: item }),

  loadById: async (id) => {
    set({ isFetching: true })
    try {
      const response = await sectionItemsService.getById(id)
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
      const response = await sectionItemsService.getList(nextFilters)
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
