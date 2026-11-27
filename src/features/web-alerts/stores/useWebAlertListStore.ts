// Guarda la lista de alertas del sitio que se ve en la tabla (con sus filtros y su paginación).

import { create } from 'zustand'
import { webAlertsService } from '../services/web-alerts.service'
import type { WebAlertListRequestDto, WebAlertApiItem } from '../model/webalertget.dto'
import type { LinksPaginationType } from '@/shared/type/linksPagination.type'
import type { MetaPaginationType } from '@/shared/type/metaPagination.type'
import type { WebAlert } from '../data/schema'

type State = {
  hasLoaded: boolean
  isInitialLoading: boolean
  isFetching: boolean
  isError: boolean
  message: string | null
  items: WebAlert[]
  links: LinksPaginationType | null
  meta: MetaPaginationType | null
  filters: WebAlertListRequestDto
  /** false = load() reutiliza lo ya cargado. Por defecto true: se pide de nuevo al entrar. */
  forceReload: boolean
}

type Action = {
  setForceReload: (value: boolean) => void
  load: (params?: WebAlertListRequestDto) => Promise<boolean>
  reset: () => void
}

const defaultFilters: WebAlertListRequestDto = { page: 1, per_page: 20, search: '', state: undefined }

/** Convierte una alerta de la API al formato que usa la pantalla. */
export const mapWebAlertFromApi = (item: WebAlertApiItem): WebAlert => ({
  id: item.id_web_alert,
  title: item.webalert_title,
  subtitle: item.webalert_subtitle,
  style: item.webalert_style,
  align: item.webalert_align,
  // Boolean(...) por si el backend manda 1/0 en vez de true/false
  showIcon: Boolean(item.webalert_show_icon),
  trailing: item.webalert_trailing,
  trailingLabel: item.webalert_trailing_label,
  linkUrl: item.webalert_link_url,
  dismissible: Boolean(item.webalert_dismissible),
  scrollBehavior: item.webalert_scroll_behavior,
  startsAt: item.webalert_starts_at,
  endsAt: item.webalert_ends_at,
  order: item.webalert_order,
  stateValue: item.webalert_state,
  visibilityStatus: item.visibility_status,
})

export const useWebAlertListStore = create<State & Action>((set, get) => ({
  hasLoaded: false, isInitialLoading: false, isFetching: false,
  isError: false, message: null, items: [], links: null, meta: null,
  filters: defaultFilters,
  forceReload: true,

  setForceReload: (value) => set({ forceReload: value }),

  load: async (params = {}) => {
    if (get().isFetching) return false
    if (!get().forceReload && get().hasLoaded) return true
    const nextFilters = { ...get().filters, ...params }
    set({ filters: nextFilters, isFetching: true })
    try {
      const response = await webAlertsService.getList(nextFilters)
      if (!response.success) throw new Error(response.message)
      set({
        hasLoaded: true, isInitialLoading: false, isFetching: false, isError: false,
        message: response.message,
        items: response.data.map(mapWebAlertFromApi),
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
