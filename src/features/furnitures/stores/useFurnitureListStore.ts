import { create } from 'zustand'
import { furnituresService } from '../services/furnitures.service'
import { getStateOption } from '@/shared/config/entity-states'
import type { FurnitureListRequestDto } from '../model/furnitureget.dto'
import type { FurnitureJoinApiItem } from '../model/furniture-api-item.dto'
import type { LinksPaginationType } from '@/shared/type/linksPagination.type'
import type { MetaPaginationType } from '@/shared/type/metaPagination.type'
import type { Furniture } from '../data/schema'

type State = {
  hasLoaded: boolean
  isInitialLoading: boolean
  isFetching: boolean
  isError: boolean
  message: string | null
  items: Furniture[]
  links: LinksPaginationType | null
  meta: MetaPaginationType | null
  filters: FurnitureListRequestDto
  currentItem: Furniture | null
}

type Action = {
  load: (params?: FurnitureListRequestDto) => Promise<boolean>
  setCurrentItem: (item: Furniture | null) => void
  reset: () => void
}

const defaultFilters: FurnitureListRequestDto = { page: 1, per_page: 10, search: '', state: undefined }

const mapFromApi = (item: FurnitureJoinApiItem): Furniture => {
  const stateOpt = getStateOption(item.furniture_state)
  return {
    id: item.id_furniture,
    name: item.furniture_name,
    description: item.furniture_description,
    largo: item.furniture_largo,
    ancho: item.furniture_ancho,
    idCategory: item.id_category,
    categoryName: item.category?.category_name ?? '',
    idTypecolor: item.id_typecolor,
    typecolorName: item.typecolor?.typecolor_name ?? '',
    idTypewood: item.id_typewood,
    typewoodName: item.typewood?.typewood_name ?? '',
    idImage: item.id_image,
    imageName: item.image?.image_name ?? null,
    imageUrl: item.image?.image_url ?? null,
    status: item.furniture_state === 1 ? 'active' : 'inactive',
    statusLabel: stateOpt.label,
    stateValue: item.furniture_state,
    createdAt: item.furniture_created_at,
    updatedAt: item.furniture_updated_at ?? '',
  }
}

export const useFurnitureListStore = create<State & Action>((set, get) => ({
  hasLoaded: false, isInitialLoading: false, isFetching: false,
  isError: false, message: null, items: [], links: null, meta: null,
  filters: defaultFilters, currentItem: null,

  setCurrentItem: (item) => set({ currentItem: item }),

  load: async (params = {}) => {
    const nextFilters = { ...get().filters, ...params }
    set({ filters: nextFilters, isFetching: true, isError: false, message: null })
    try {
      const response = await furnituresService.getList(nextFilters)
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
