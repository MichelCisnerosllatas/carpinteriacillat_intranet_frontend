import apiClient from '@/shared/api/apiClient'
import { SECTIONS_ENDPOINTS } from './sections.endpoint'
import type {
  SectionListRequestDto,
  SectionListResponseDto,
  SectionJoinListResponseDto,
  SectionGetByIdResponseDto,
} from '../model/sectionget.dto'
import type { SectionPostRequestDto, SectionPostResponseDto } from '../model/sectionpost.dto'
import type { SectionPutRequestDto, SectionPutResponseDto } from '../model/sectionput.dto'
import type { SectionReorderGroupDto, SectionReorderResponseDto } from '../model/sectionreorder.dto'

export const sectionsService = {
  getList: async (param: SectionListRequestDto): Promise<SectionJoinListResponseDto> => {
    const params = Object.fromEntries(
      Object.entries(param).filter(([, v]) => v !== undefined && v !== null && v !== '')
    )
    const { data } = await apiClient.get<SectionJoinListResponseDto>(SECTIONS_ENDPOINTS.v1.getJoin, { params })
    return data
  },

  getForSelect: async (): Promise<SectionListResponseDto> => {
    const { data } = await apiClient.get<SectionListResponseDto>(SECTIONS_ENDPOINTS.v1.get, {
      params: { page: 1, per_page: 100 },
    })
    return data
  },

  /** Igual que getForSelect, pero es la que consume useSectionModalSelectStore para <ModalSelect />. */
  getForModalSelect: async (): Promise<SectionListResponseDto> => {
    const { data } = await apiClient.get<SectionListResponseDto>(SECTIONS_ENDPOINTS.v1.get, {
      params: { page: 1, per_page: 100 },
    })
    return data
  },

  getById: async (id: number): Promise<SectionGetByIdResponseDto> => {
    const { data } = await apiClient.get<SectionGetByIdResponseDto>(`${SECTIONS_ENDPOINTS.v1.getJoin}/${id}`)
    return data
  },

  post: async (param: SectionPostRequestDto): Promise<SectionPostResponseDto> => {
    const { data } = await apiClient.post<SectionPostResponseDto>(SECTIONS_ENDPOINTS.v1.post, param)
    return data
  },

  put: async (id: number, param: SectionPutRequestDto): Promise<SectionPutResponseDto> => {
    const { data } = await apiClient.put<SectionPutResponseDto>(SECTIONS_ENDPOINTS.v1.put(id), param)
    return data
  },

  patch: async (id: number, param: Partial<SectionPutRequestDto>): Promise<SectionPutResponseDto> => {
    const { data } = await apiClient.patch<SectionPutResponseDto>(SECTIONS_ENDPOINTS.v1.patch(id), param)
    return data
  },

  delete: async (id: number): Promise<boolean> => {
    const { data } = await apiClient.delete(SECTIONS_ENDPOINTS.v1.delete(id))
    return data.success
  },

  reorder: async (groups: SectionReorderGroupDto[]): Promise<SectionReorderResponseDto> => {
    const { data } = await apiClient.post<SectionReorderResponseDto>(SECTIONS_ENDPOINTS.v1.reorder, { groups })
    return data
  },
}
