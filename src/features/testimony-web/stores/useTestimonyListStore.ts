import { create } from 'zustand'
import { testimonyService } from '../services/testimony.service'
import { getStateOption } from '@/shared/config/entity-states'
import { buildImageUrl } from '@/shared/lib/images'
import type { TestimonyListRequestDto, TestimonyApiItem } from '../model/testimonyget.dto'
import type { LinksPaginationType } from '@/shared/type/linksPagination.type'
import type { MetaPaginationType } from '@/shared/type/metaPagination.type'
import type { Testimony } from '../data/schema'

type State = {
  hasLoaded: boolean
  isInitialLoading: boolean
  isFetching: boolean
  isError: boolean
  message: string | null
  items: Testimony[]
  links: LinksPaginationType | null
  meta: MetaPaginationType | null
  filters: TestimonyListRequestDto
  currentItem: Testimony | null
  /** false = load() reutiliza los datos ya cargados (hasLoaded) en vez de pedirlos de nuevo. Por defecto true: la pantalla vuelve a pedir la lista cada vez que se entra a la ruta. */
  forceReload: boolean
}

type Action = {
  setForceReload: (value: boolean) => void
  load: (params?: TestimonyListRequestDto) => Promise<boolean>
  loadById: (id: number) => Promise<boolean>
  setCurrentItem: (item: Testimony | null) => void
  reset: () => void
}

const defaultFilters: TestimonyListRequestDto = { page: 1, per_page: 10, search: '', state: undefined, id_section: undefined }

const mapFromApi = (item: TestimonyApiItem): Testimony => {
  const stateOpt = getStateOption(item.testimony_state)
  return {
    id: item.id_testimony_web,
    idSection: item.section?.id_section ?? item.id_section,
    sectionName: item.section?.section_name,
    idImage: item.image?.id_image ?? item.id_image,
    imageUrl: item.image?.image_patch ? (buildImageUrl(item.image.image_patch) ?? undefined) : undefined,
    name: item.testimony_name,
    role: item.testimony_role,
    city: item.testimony_city,
    email: item.testimony_email,
    rating: item.testimony_rating,
    message: item.testimony_message,
    isDelivered: item.testimony_is_delivered,
    isVerified: item.testimony_is_verified,
    order: item.testimony_order,
    status: item.testimony_state === 1 ? 'active' : 'inactive',
    statusLabel: stateOpt.label,
    stateValue: item.testimony_state,
    isVisibleOnWeb: item.is_visible_on_web,
    createdAt: item.testimony_created_at,
    updatedAt: item.testimony_updated_at ?? '',
    createdAtFormatted: item.testimony_created_at_formatted ?? null,
    updatedAtFormatted: item.testimony_updated_at_formatted ?? null,
  }
}

export const useTestimonyListStore = create<State & Action>((set, get) => ({
  hasLoaded: false, isInitialLoading: false, isFetching: false,
  isError: false, message: null, items: [], links: null, meta: null,
  filters: defaultFilters, currentItem: null,
  forceReload: true,

  setForceReload: (value) => set({ forceReload: value }),
  setCurrentItem: (item) => set({ currentItem: item }),

  loadById: async (id) => {
    set({ isFetching: true })
    try {
      const response = await testimonyService.getById(id)
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
    set({ filters: nextFilters, 
      isFetching: true })

    try {
      const response = await testimonyService.getList(nextFilters)
      if (!response.success) throw new Error(response.message)
      set({
        hasLoaded: true, 
        isInitialLoading: false, 
        isFetching: false, 
        isError: false,
        message: response.message,
        items: response.data.map(mapFromApi),
        links: response.links, meta: response.meta,
        filters: { ...nextFilters, page: response.meta?.current_page ?? nextFilters.page, per_page: response.meta?.per_page ?? nextFilters.per_page },
      })
      return true
    } catch (error: any) {
      set({ 
        hasLoaded: true, 
        isInitialLoading: false, 
        isFetching: false, 
        isError: true, 
        message: error?.response?.data?.message ?? error?.message ?? 'Error al cargar.'
      })
      return false
    }
  },

  reset: () => set({ hasLoaded: false, isInitialLoading: false, isFetching: false, isError: false, message: null, items: [], links: null, meta: null, filters: defaultFilters }),
}))
