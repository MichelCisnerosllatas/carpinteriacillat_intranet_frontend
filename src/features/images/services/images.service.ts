import apiClient from '@/shared/api/apiClient'
import { IMAGES_ENDPOINTS } from './images.endpoint'
import type { ImageListRequestDto, ImageListResponseDto, ImageGetByIdResponseDto } from '../model/imageget.dto'
import type { StorageListRequestDto, StorageListResponseDto, StorageDeleteResponseDto } from '../model/imagestorage.dto'
import type { ImageUploadResponseDto } from '../model/imageupload.dto'

export const imagesService = {
  getList: async (param: ImageListRequestDto): Promise<ImageListResponseDto> => {
    const params = Object.fromEntries(
      Object.entries(param).filter(([, v]) => v !== undefined && v !== null && v !== '')
    )
    const { data } = await apiClient.get<ImageListResponseDto>(IMAGES_ENDPOINTS.v1.get, { params })
    return data
  },

  getForSelect: async (): Promise<ImageListResponseDto> => {
    const { data } = await apiClient.get<ImageListResponseDto>(IMAGES_ENDPOINTS.v1.get, {
      params: { page: 1, per_page: 500 },
    })
    return data
  },

  getById: async (id: number): Promise<ImageGetByIdResponseDto> => {
    const { data } = await apiClient.get<ImageGetByIdResponseDto>(IMAGES_ENDPOINTS.v1.getById(id))
    return data
  },

  upload: async (formData: FormData, signal?: AbortSignal): Promise<ImageUploadResponseDto> => {
    const { data } = await apiClient.post<ImageUploadResponseDto>(
      IMAGES_ENDPOINTS.v1.upload,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' }, signal }
    )
    return data
  },

  delete: async (id: number): Promise<boolean> => {
    const { data } = await apiClient.delete(IMAGES_ENDPOINTS.v1.delete(id))
    return data.success
  },

  storageAll: async (param: StorageListRequestDto = {}): Promise<StorageListResponseDto> => {
    const params = Object.fromEntries(
      Object.entries(param).filter(([, v]) => v !== undefined && v !== null && v !== '')
    )
    const { data } = await apiClient.get<StorageListResponseDto>(IMAGES_ENDPOINTS.v1.storageAll, { params })
    return data
  },

  storageDelete: async (path: string): Promise<StorageDeleteResponseDto> => {
    const { data } = await apiClient.delete<StorageDeleteResponseDto>(
      IMAGES_ENDPOINTS.v1.storageDelete,
      { data: { path } }
    )
    return data
  },
}
