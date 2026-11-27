import apiClient from '@/shared/api/apiClient'
import { SECTIONBUTTONS_ENDPOINTS } from './sectionbuttons.endpoint'
import type {
  SectionButtonListRequestDto,
  SectionButtonListResponseDto,
  SectionButtonGetByIdResponseDto,
} from '../model/sectionbuttonget.dto'
import type { SectionButtonPostRequestDto, SectionButtonPostResponseDto } from '../model/sectionbuttonpost.dto'
import type { SectionButtonPutRequestDto, SectionButtonPutResponseDto } from '../model/sectionbuttonput.dto'
import type { SectionButtonReorderRequestDto, SectionButtonReorderResponseDto } from '../model/sectionbuttonreorder.dto'

export const sectionButtonsService = {
  getList: async (param: SectionButtonListRequestDto): Promise<SectionButtonListResponseDto> => {
    const params = Object.fromEntries(
      Object.entries(param).filter(([, v]) => v !== undefined && v !== null && v !== '')
    )
    const { data } = await apiClient.get<SectionButtonListResponseDto>(SECTIONBUTTONS_ENDPOINTS.v1.get, { params })
    return data
  },

  getById: async (id: number): Promise<SectionButtonGetByIdResponseDto> => {
    const { data } = await apiClient.get<SectionButtonGetByIdResponseDto>(SECTIONBUTTONS_ENDPOINTS.v1.getById(id))
    return data
  },

  post: async (param: SectionButtonPostRequestDto): Promise<SectionButtonPostResponseDto> => {
    const { data } = await apiClient.post<SectionButtonPostResponseDto>(SECTIONBUTTONS_ENDPOINTS.v1.post, param)
    return data
  },

  put: async (id: number, param: SectionButtonPutRequestDto): Promise<SectionButtonPutResponseDto> => {
    const { data } = await apiClient.put<SectionButtonPutResponseDto>(SECTIONBUTTONS_ENDPOINTS.v1.put(id), param)
    return data
  },

  patch: async (id: number, param: Partial<SectionButtonPutRequestDto>): Promise<SectionButtonPutResponseDto> => {
    const { data } = await apiClient.patch<SectionButtonPutResponseDto>(SECTIONBUTTONS_ENDPOINTS.v1.patch(id), param)
    return data
  },

  delete: async (id: number): Promise<boolean> => {
    const { data } = await apiClient.delete(SECTIONBUTTONS_ENDPOINTS.v1.delete(id))
    return data.success
  },

  reorder: async (param: SectionButtonReorderRequestDto): Promise<SectionButtonReorderResponseDto> => {
    const { data } = await apiClient.post<SectionButtonReorderResponseDto>(SECTIONBUTTONS_ENDPOINTS.v1.reorder, param)
    return data
  },
}
