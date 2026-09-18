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
  /** false = load() reutiliza los datos ya cargados (hasLoaded) en vez de pedirlos de nuevo. Por defecto true: la pantalla vuelve a pedir la lista cada vez que se entra a la ruta. */
  forceReload: boolean
}

type Action = {
  setForceReload: (value: boolean) => void
  load: (params?: SectionListRequestDto) => Promise<boolean>
  loadById: (id: number) => Promise<boolean>
  setCurrentItem: (item: Section | null) => void
  reset: () => void
}

const defaultFilters: SectionListRequestDto = { page: 1, per_page: 10, search: '', state: undefined }

const mapFromApi = (item: SectionJoinApiItem): Section => {
  const stateOpt = getStateOption(item.section_state)
  const typesectionStateOpt = item.type_section ? getStateOption(item.type_section.typesection_state) : null
  const navigationStateOpt = item.navigation ? getStateOption(item.navigation.navigation_state) : null
  return {
    id: item.id_section,
    name: item.section_name,
    key: item.section_key,
    title: item.section_title,
    subtitle: item.section_subtitle,
    description: item.section_description,
    content: item.section_content,
    variant: item.section_variant,
    idTypesection: item.type_section?.id_typesection ?? 0,
    typesectionKey: item.type_section?.typesection_key ?? null,
    typesectionName: item.type_section?.typesection_name ?? '',
    typesectionDescription: item.type_section?.typesection_description ?? null,
    // `web_settings` ausente (backend viejo, o una sección creada a mano sin fila de settings
    // todavía) = tratar como "todo permitido/visible", para no ocultar tabs/acciones por error
    // solo porque no hay config técnica cargada para esta sección puntual.
    tabInfo: item.web_settings?.tab_info ?? true,
    tabImages: item.web_settings?.tab_images ?? true,
    tabButtons: item.web_settings?.tab_buttons ?? true,
    tabItems: item.web_settings?.tab_items ?? true,
    imagesAdd: item.web_settings?.images_add ?? true,
    imagesReorder: item.web_settings?.images_reorder ?? true,
    imagesDelete: item.web_settings?.images_delete ?? true,
    buttonsAdd: item.web_settings?.buttons_add ?? true,
    buttonsReorder: item.web_settings?.buttons_reorder ?? true,
    buttonsDelete: item.web_settings?.buttons_delete ?? true,
    itemsAdd: item.web_settings?.items_add ?? true,
    itemsReorder: item.web_settings?.items_reorder ?? true,
    itemsDelete: item.web_settings?.items_delete ?? true,
    typesectionStateValue: item.type_section?.typesection_state ?? null,
    typesectionStateLabel: typesectionStateOpt?.label ?? null,
    typesectionStateBadge: typesectionStateOpt?.badge ?? null,
    idNavigation: item.navigation?.id_navigation ?? null,
    navigationName: item.navigation?.navigation_name ?? null,
    navigationDescription: item.navigation?.navigation_description ?? null,
    navigationUrl: item.navigation?.navigation_url ?? null,
    navigationOrder: item.navigation?.navigation_order ?? null,
    navigationStateValue: item.navigation?.navigation_state ?? null,
    navigationStateLabel: navigationStateOpt?.label ?? null,
    navigationStateBadge: navigationStateOpt?.badge ?? null,
    order: item.section_order,
    status: item.section_state === 1 ? 'active' : 'inactive',
    statusLabel: stateOpt.label,
    stateValue: item.section_state,
    createdAt: item.section_created_at,
    updatedAt: item.section_updated_at ?? '',
    createdAtFormatted: item.section_created_at_format ?? null,
    updatedAtFormatted: item.section_updated_at_format ?? null,
  }
}

export const useSectionListStore = create<State & Action>((set, get) => ({
  hasLoaded: false, isInitialLoading: false, isFetching: false,
  isError: false, message: null, items: [], links: null, meta: null,
  filters: defaultFilters, currentItem: null,
  forceReload: true,

  setForceReload: (value) => set({ forceReload: value }),
  setCurrentItem: (item) => set({ currentItem: item }),

  loadById: async (id) => {
    set({ isFetching: true })
    try {
      const response = await sectionsService.getById(id)
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
