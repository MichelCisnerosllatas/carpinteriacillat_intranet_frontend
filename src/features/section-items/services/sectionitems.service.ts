import apiClient from '@/shared/api/apiClient'
import { SECTIONITEMS_ENDPOINTS } from './sectionitems.endpoint'
import type {
  SectionItemListRequestDto,
  SectionItemListResponseDto,
  SectionItemGetByIdResponseDto,
} from '../model/sectionitemget.dto'
import type { SectionItemPostRequestDto, SectionItemPostResponseDto } from '../model/sectionitempost.dto'
import type { SectionItemPutRequestDto, SectionItemPutResponseDto } from '../model/sectionitemput.dto'
import type { SectionItemReorderRequestDto, SectionItemReorderResponseDto } from '../model/sectionitemreorder.dto'

export const sectionItemsService = {
  getList: async (param: SectionItemListRequestDto): Promise<SectionItemListResponseDto> => {
    const params = Object.fromEntries(
      Object.entries(param).filter(([, v]) => v !== undefined && v !== null && v !== '')
    )
    const { data } = await apiClient.get<SectionItemListResponseDto>(SECTIONITEMS_ENDPOINTS.v1.get, { params })
    return data
  },

  /** Alimenta <SectionItemSelect /> — solo ítems activos, hasta 100 por página. */
  getForSelect: async (idSection?: number): Promise<SectionItemListResponseDto> => {
    const { data } = await apiClient.get<SectionItemListResponseDto>(SECTIONITEMS_ENDPOINTS.v1.get, {
      params: { page: 1, per_page: 100, state: 1, ...(idSection ? { id_section: idSection } : {}) },
    })
    return data
  },

  getById: async (id: number): Promise<SectionItemGetByIdResponseDto> => {
    const { data } = await apiClient.get<SectionItemGetByIdResponseDto>(SECTIONITEMS_ENDPOINTS.v1.getById(id))
    return data
  },

  post: async (param: SectionItemPostRequestDto): Promise<SectionItemPostResponseDto> => {
    const { data } = await apiClient.post<SectionItemPostResponseDto>(SECTIONITEMS_ENDPOINTS.v1.post, param)
    return data
  },

  put: async (id: number, param: SectionItemPutRequestDto): Promise<SectionItemPutResponseDto> => {
    const { data } = await apiClient.put<SectionItemPutResponseDto>(SECTIONITEMS_ENDPOINTS.v1.put(id), param)
    return data
  },

  patch: async (id: number, param: Partial<SectionItemPutRequestDto>): Promise<SectionItemPutResponseDto> => {
    const { data } = await apiClient.patch<SectionItemPutResponseDto>(SECTIONITEMS_ENDPOINTS.v1.patch(id), param)
    return data
  },

  delete: async (id: number): Promise<boolean> => {
    const { data } = await apiClient.delete(SECTIONITEMS_ENDPOINTS.v1.delete(id))
    return data.success
  },

  reorder: async (param: SectionItemReorderRequestDto): Promise<SectionItemReorderResponseDto> => {
    const { data } = await apiClient.post<SectionItemReorderResponseDto>(SECTIONITEMS_ENDPOINTS.v1.reorder, param)
    return data
  },
}
