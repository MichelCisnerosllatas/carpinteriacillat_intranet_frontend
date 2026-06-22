import { create } from 'zustand'
import { sectionImagesService } from '../services/sectionimages.service'
import { getStateOption } from '@/shared/config/entity-states'
import type { SectionImageListRequestDto, SectionImageJoinApiItem } from '../model/sectionimageget.dto'
import type { LinksPaginationType } from '@/shared/type/linksPagination.type'
import type { MetaPaginationType } from '@/shared/type/metaPagination.type'
import type { SectionImage } from '../data/schema'

type State = {
  hasLoaded: boolean
  isInitialLoading: boolean
  isFetching: boolean
  isError: boolean
  message: string | null
  items: SectionImage[]
  links: LinksPaginationType | null
  meta: MetaPaginationType | null
  filters: SectionImageListRequestDto
  currentItem: SectionImage | null
}

type Action = {
  load: (params?: SectionImageListRequestDto) => Promise<boolean>
  setCurrentItem: (item: SectionImage | null) => void
  reset: () => void
}

const defaultFilters: SectionImageListRequestDto = { page: 1, per_page: 10, search: '', state: undefined }

const mapFromApi = (item: SectionImageJoinApiItem): SectionImage => {
  const stateOpt = getStateOption(item.sectionimage_state)
  return {
    id: item.id_sectionimage,
    idSection: item.id_section,
    sectionName: item.section?.section_name ?? '',
    idImage: item.id_image,
    imageName: item.image?.image_name ?? '',
    imageUrl: item.image?.image_url ?? '',
    status: item.sectionimage_state === 1 ? 'active' : 'inactive',
    statusLabel: stateOpt.label,
    stateValue: item.sectionimage_state,
    createdAt: item.sectionimage_created_at,
    updatedAt: item.sectionimage_updated_at ?? '',
  }
}

export const useSectionImageListStore = create<State & Action>((set, get) => ({
  hasLoaded: false, isInitialLoading: false, isFetching: false,
  isError: false, message: null, items: [], links: null, meta: null,
  filters: defaultFilters, currentItem: null,

  setCurrentItem: (item) => set({ currentItem: item }),

  load: async (params = {}) => {
    const nextFilters = { ...get().filters, ...params }
    set({ filters: nextFilters, isFetching: true, isError: false, message: null })
    try {
      const response = await sectionImagesService.getList(nextFilters)
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
