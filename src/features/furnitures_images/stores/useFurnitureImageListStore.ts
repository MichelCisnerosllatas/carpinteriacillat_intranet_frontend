import { create } from 'zustand'
import { furnitureImagesService } from '../services/furnitures-images.service'
import { getStateOption } from '@/shared/config/entity-states'
import { buildImageUrl } from '@/shared/lib/images'
import type { FurnitureImageListRequestDto } from '../model/furnitures-image-get.dto'
import type { FurnitureImageJoinApiItem } from '../model/furnitures-image-api-item.dto'
import type { LinksPaginationType } from '@/shared/type/linksPagination.type'
import type { MetaPaginationType } from '@/shared/type/metaPagination.type'
import type { FurnitureImage } from '../data/schema'

type State = {
  hasLoaded: boolean
  isInitialLoading: boolean
  isFetching: boolean
  isError: boolean
  message: string | null
  items: FurnitureImage[]
  links: LinksPaginationType | null
  meta: MetaPaginationType | null
  filters: FurnitureImageListRequestDto
  currentItem: FurnitureImage | null
}

type Action = {
  load: (params?: FurnitureImageListRequestDto) => Promise<boolean>
  setCurrentItem: (item: FurnitureImage | null) => void
  reset: () => void
}

const defaultFilters: FurnitureImageListRequestDto = { page: 1, per_page: 12 }

const mapFromApi = (item: FurnitureImageJoinApiItem): FurnitureImage => {
  const stateOpt = getStateOption(item.furnitureimage_state)
  return {
    id: item.id_furniture_image,
    furnitureId: item.furniture?.id_furniture ?? 0,
    furnitureName: item.furniture?.furniture_name ?? '',
    imageId: item.image?.id_image ?? 0,
    imageUrl: buildImageUrl(item.image?.image_patch ?? null),
    imagePatch: item.image?.image_patch ?? null,
    imageName: item.image?.image_name ?? null,
    imageTitle: item.image?.image_title ?? null,
    imageAlt: item.image?.image_alt ?? null,
    order: item.furnitureimage_order,
    stateValue: item.furnitureimage_state,
    statusLabel: stateOpt.label,
    createdAt: item.furnitureimage_created_at,
    updatedAt: item.furnitureimage_updated_at,
  }
}

export const useFurnitureImageListStore = create<State & Action>((set, get) => ({
  hasLoaded: false, isInitialLoading: false, isFetching: false,
  isError: false, message: null, items: [], links: null, meta: null,
  filters: defaultFilters, currentItem: null,

  setCurrentItem: (item) => set({ currentItem: item }),

  load: async (params = {}) => {
    if (get().isFetching) return false
    const nextFilters = { ...get().filters, ...params }
    set({ filters: nextFilters, isFetching: true, isError: false, message: null })
    try {
      const response = await furnitureImagesService.getList(nextFilters)
      if (!response.success) throw new Error(response.message)
      set({
        hasLoaded: true, isInitialLoading: false, isFetching: false, isError: false,
        message: response.message,
        items: response.data.map(mapFromApi),
        links: response.links, meta: response.meta,
        filters: {
          ...nextFilters,
          page: response.meta?.current_page ?? nextFilters.page,
          per_page: response.meta?.per_page ?? nextFilters.per_page,
        },
      })
      return true
    } catch (error: any) {
      set({
        hasLoaded: true, isInitialLoading: false, isFetching: false, isError: true,
        message: error?.response?.data?.message ?? error?.message ?? 'Error al cargar.',
      })
      return false
    }
  },

  reset: () => set({
    hasLoaded: false, isInitialLoading: false, isFetching: false,
    isError: false, message: null, items: [], links: null, meta: null,
    filters: defaultFilters,
  }),
}))
