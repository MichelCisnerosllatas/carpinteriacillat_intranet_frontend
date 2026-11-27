import apiClient from '@/shared/api/apiClient'
import { SECTIONITEMDETAILS_ENDPOINTS } from './sectionitemdetails.endpoint'
import type {
  SectionItemDetailListRequestDto,
  SectionItemDetailListResponseDto,
  SectionItemDetailGetByIdResponseDto,
} from '../model/sectionitemdetailget.dto'
import type { SectionItemDetailPostRequestDto, SectionItemDetailPostResponseDto } from '../model/sectionitemdetailpost.dto'
import type { SectionItemDetailPutRequestDto, SectionItemDetailPutResponseDto } from '../model/sectionitemdetailput.dto'
import type { SectionItemDetailReorderRequestDto, SectionItemDetailReorderResponseDto } from '../model/sectionitemdetailreorder.dto'

export const sectionItemDetailsService = {
  getList: async (param: SectionItemDetailListRequestDto): Promise<SectionItemDetailListResponseDto> => {
    const params = Object.fromEntries(
      Object.entries(param).filter(([, v]) => v !== undefined && v !== null && v !== '')
    )
    const { data } = await apiClient.get<SectionItemDetailListResponseDto>(SECTIONITEMDETAILS_ENDPOINTS.v1.get, { params })
    return data
  },

  getById: async (id: number): Promise<SectionItemDetailGetByIdResponseDto> => {
    const { data } = await apiClient.get<SectionItemDetailGetByIdResponseDto>(SECTIONITEMDETAILS_ENDPOINTS.v1.getById(id))
    return data
  },

  post: async (param: SectionItemDetailPostRequestDto): Promise<SectionItemDetailPostResponseDto> => {
    const { data } = await apiClient.post<SectionItemDetailPostResponseDto>(SECTIONITEMDETAILS_ENDPOINTS.v1.post, param)
    return data
  },

  put: async (id: number, param: SectionItemDetailPutRequestDto): Promise<SectionItemDetailPutResponseDto> => {
    const { data } = await apiClient.put<SectionItemDetailPutResponseDto>(SECTIONITEMDETAILS_ENDPOINTS.v1.put(id), param)
    return data
  },

  patch: async (id: number, param: Partial<SectionItemDetailPutRequestDto>): Promise<SectionItemDetailPutResponseDto> => {
    const { data } = await apiClient.patch<SectionItemDetailPutResponseDto>(SECTIONITEMDETAILS_ENDPOINTS.v1.patch(id), param)
    return data
  },

  delete: async (id: number): Promise<boolean> => {
    const { data } = await apiClient.delete(SECTIONITEMDETAILS_ENDPOINTS.v1.delete(id))
    return data.success
  },

  reorder: async (param: SectionItemDetailReorderRequestDto): Promise<SectionItemDetailReorderResponseDto> => {
    const { data } = await apiClient.post<SectionItemDetailReorderResponseDto>(SECTIONITEMDETAILS_ENDPOINTS.v1.reorder, param)
    return data
  },
}
