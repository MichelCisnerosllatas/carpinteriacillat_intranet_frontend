import apiClient from '@/shared/api/apiClient'
import { FURNITURE_IMAGES_ENDPOINTS } from './furnitures-images.endpoint'
import type {
  FurnitureImageListRequestDto,
  FurnitureImageJoinListResponseDto,
  FurnitureImageGetByIdResponseDto,
} from '../model/furnitures-image-get.dto'
import type { FurnitureImagePostRequestDto, FurnitureImagePostResponseDto } from '../model/furnitures-image-post.dto'
import type { FurnitureImagePutRequestDto, FurnitureImagePutResponseDto } from '../model/furnitures-image-put.dto'

export const furnitureImagesService = {
  getList: async (params: FurnitureImageListRequestDto): Promise<FurnitureImageJoinListResponseDto> => {
    const p = Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== 0)
    )
    const { data } = await apiClient.get<FurnitureImageJoinListResponseDto>(
      FURNITURE_IMAGES_ENDPOINTS.v1.getJoin, { params: p }
    )
    return data
  },

  getById: async (id: number): Promise<FurnitureImageGetByIdResponseDto> => {
    const { data } = await apiClient.get<FurnitureImageGetByIdResponseDto>(
      FURNITURE_IMAGES_ENDPOINTS.v1.getJoinById(id)
    )
    return data
  },

  post: async (param: FurnitureImagePostRequestDto): Promise<FurnitureImagePostResponseDto> => {
    const { data } = await apiClient.post<FurnitureImagePostResponseDto>(
      FURNITURE_IMAGES_ENDPOINTS.v1.post, param
    )
    return data
  },

  patch: async (id: number, param: Partial<FurnitureImagePutRequestDto>): Promise<FurnitureImagePutResponseDto> => {
    const { data } = await apiClient.patch<FurnitureImagePutResponseDto>(
      FURNITURE_IMAGES_ENDPOINTS.v1.patch(id), param
    )
    return data
  },

  delete: async (id: number): Promise<boolean> => {
    const { data } = await apiClient.delete(FURNITURE_IMAGES_ENDPOINTS.v1.delete(id))
    return data.success
  },
}
