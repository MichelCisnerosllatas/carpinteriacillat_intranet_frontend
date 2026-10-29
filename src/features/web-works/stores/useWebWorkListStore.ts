import { create } from 'zustand'
import { webWorksService } from '../services/web-works.service'
import { getWebWorkStateOption } from '../data/data'
import type { WebWorkListRequestDto, WebWorkApiItem } from '../model/webworkget.dto'
import type { LinksPaginationType } from '@/shared/type/linksPagination.type'
import type { MetaPaginationType } from '@/shared/type/metaPagination.type'
import type { WebWork } from '../data/schema'

type State = {
  hasLoaded: boolean
  isInitialLoading: boolean
  isFetching: boolean
  isError: boolean
  message: string | null
  items: WebWork[]
  links: LinksPaginationType | null
  meta: MetaPaginationType | null
  filters: WebWorkListRequestDto
  currentItem: WebWork | null
  /** false = load() reutiliza los datos ya cargados (hasLoaded) en vez de pedirlos de nuevo. Por defecto true: la pantalla vuelve a pedir la lista cada vez que se entra a la ruta. */
  forceReload: boolean
}

type Action = {
  setForceReload: (value: boolean) => void
  load: (params?: WebWorkListRequestDto) => Promise<boolean>
  setCurrentItem: (item: WebWork | null) => void
  reset: () => void
}

const defaultFilters: WebWorkListRequestDto = {
  page: 1, per_page: 10, search: '', state: undefined, typework_key: undefined,
}

const toNumberOrNull = (v: number | string | null | undefined): number | null => {
  if (v === null || v === undefined || v === '') return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

/** API → UI. Exportada para reutilizarla en el detalle/formulario (que piden el trabajo por id). */
export const mapWebWorkFromApi = (item: WebWorkApiItem): WebWork => {
  const stateOpt = getWebWorkStateOption(item.webwork_state)
  return {
    id: item.id_web_work,
    typeworkId: item.id_typework,
    typeworkKey: item.type?.typework_key ?? '',
    typeworkName: item.type?.typework_name ?? '—',
    title: item.webwork_title,
    description: item.webwork_description,
    categoryId: item.id_category,
    categoryName: item.category?.category_name ?? null,
    woodId: item.id_typewood,
    woodName: item.wood?.typewood_name ?? null,
    furnitureId: item.id_furniture,
    furnitureName: item.furniture ? (item.furniture.furniture_title || item.furniture.furniture_name) : null,
    coverId: item.id_image,
    coverUrl: item.cover?.url ?? null,
    style: item.webwork_style,
    measures: item.webwork_measures,
    finish: item.webwork_finish,
    buildTime: item.webwork_build_time,
    location: item.webwork_location,
    deliveredAt: item.webwork_delivered_at ? item.webwork_delivered_at.slice(0, 10) : null,
    priceApprox: toNumberOrNull(item.webwork_price_approx),
    order: item.webwork_order,
    status: item.webwork_state === 1 ? 'visible' : 'hidden',
    statusLabel: stateOpt.label,
    stateValue: item.webwork_state,
    imagesCount: item.images_count ?? item.images?.length ?? 0,
    pairsCount: item.pairs_count ?? item.pairs?.length ?? 0,
    testimoniesCount: item.testimonies_count ?? 0,
    ratingAvg: toNumberOrNull(item.rating_avg),
    images: (item.images ?? []).map((img) => ({
      id: img.id_web_work_image,
      idImage: img.id_image,
      url: img.url,
      name: img.name ?? `Imagen #${img.id_image}`,
      caption: img.webworkimage_caption,
      order: img.webworkimage_order,
      visible: img.webworkimage_state === 1,
    })),
    pairs: (item.pairs ?? []).map((p) => ({
      id: p.id_web_work_pair,
      caption: p.webworkpair_caption,
      order: p.webworkpair_order,
      visible: p.webworkpair_state === 1,
      before: p.before ? { idImage: p.before.id_image, url: p.before.url, name: p.before.name ?? '' } : null,
      after: p.after ? { idImage: p.after.id_image, url: p.after.url, name: p.after.name ?? '' } : null,
    })),
    createdAt: item.webwork_created_at_formatted ?? item.webwork_created_at ?? '',
    updatedAt: item.webwork_updated_at_formatted ?? item.webwork_updated_at ?? '',
  }
}

export const useWebWorkListStore = create<State & Action>((set, get) => ({
  hasLoaded: false, isInitialLoading: false, isFetching: false,
  isError: false, message: null, items: [], links: null, meta: null,
  filters: defaultFilters, currentItem: null,
  forceReload: true,

  setForceReload: (value) => set({ forceReload: value }),
  setCurrentItem: (item) => set({ currentItem: item }),

  load: async (params = {}) => {
    if (get().isFetching) return false
    if (!get().forceReload && get().hasLoaded) return true
    const nextFilters = { ...get().filters, ...params }
    set({ filters: nextFilters, isFetching: true })
    try {
      const response = await webWorksService.getList(nextFilters)
      if (!response.success) throw new Error(response.message)
      set({
        hasLoaded: true, isInitialLoading: false, isFetching: false, isError: false,
        message: response.message,
        items: response.data.map(mapWebWorkFromApi),
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
