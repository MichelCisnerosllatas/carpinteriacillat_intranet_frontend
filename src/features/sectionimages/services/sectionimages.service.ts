import apiClient from '@/shared/api/apiClient'
import { SECTIONIMAGES_ENDPOINTS } from './sectionimages.endpoint'
import type {
  SectionImageListRequestDto,
  SectionImageJoinListResponseDto,
  SectionImageGetByIdResponseDto,
} from '../model/sectionimageget.dto'
import type { SectionImagePostRequestDto, SectionImagePostResponseDto } from '../model/sectionimagepost.dto'
import type { SectionImagePutRequestDto, SectionImagePutResponseDto } from '../model/sectionimageput.dto'

export const sectionImagesService = {
  getList: async (param: SectionImageListRequestDto): Promise<SectionImageJoinListResponseDto> => {
    const params = Object.fromEntries(
      Object.entries(param).filter(([, v]) => v !== undefined && v !== null && v !== '')
    )
    const { data } = await apiClient.get<SectionImageJoinListResponseDto>(SECTIONIMAGES_ENDPOINTS.v1.getJoin, { params })
    return data
  },

  getById: async (id: number): Promise<SectionImageGetByIdResponseDto> => {
    const { data } = await apiClient.get<SectionImageGetByIdResponseDto>(`${SECTIONIMAGES_ENDPOINTS.v1.getJoin}/${id}`)
    return data
  },

  post: async (param: SectionImagePostRequestDto): Promise<SectionImagePostResponseDto> => {
    const { data } = await apiClient.post<SectionImagePostResponseDto>(SECTIONIMAGES_ENDPOINTS.v1.post, param)
    return data
  },

  put: async (id: number, param: SectionImagePutRequestDto): Promise<SectionImagePutResponseDto> => {
    const { data } = await apiClient.put<SectionImagePutResponseDto>(SECTIONIMAGES_ENDPOINTS.v1.put(id), param)
    return data
  },

  patch: async (id: number, param: Partial<SectionImagePutRequestDto>): Promise<SectionImagePutResponseDto> => {
    const { data } = await apiClient.patch<SectionImagePutResponseDto>(SECTIONIMAGES_ENDPOINTS.v1.patch(id), param)
    return data
  },

  delete: async (id: number): Promise<boolean> => {
    const { data } = await apiClient.delete(SECTIONIMAGES_ENDPOINTS.v1.delete(id))
    return data.success
  },
}
