import apiClient from '@/shared/api/apiClient'
import { STORAGE_ENDPOINTS } from './storage.endpoint'
import type {
  StorageListRequestDto,
  StorageListResponseDto,
  StorageExistsResponseDto,
  StorageDeleteResponseDto,
  StorageMoveRequestDto,
  StorageMoveResponseDto,
  DbImageListResponseDto,
} from '../model/storage.dto'

export const storageService = {
  getAll: async (params: StorageListRequestDto = {}): Promise<StorageListResponseDto> => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
    )
    const { data } = await apiClient.get<StorageListResponseDto>(STORAGE_ENDPOINTS.storageAll, { params: cleanParams })
    return data
  },

  exists: async (path: string): Promise<StorageExistsResponseDto> => {
    const { data } = await apiClient.post<StorageExistsResponseDto>(STORAGE_ENDPOINTS.exists, { path })
    return data
  },

  deleteFile: async (path: string): Promise<StorageDeleteResponseDto> => {
    const { data } = await apiClient.delete<StorageDeleteResponseDto>(
      STORAGE_ENDPOINTS.delete,
      { data: { path } }
    )
    return data
  },

  moveFile: async (params: StorageMoveRequestDto): Promise<StorageMoveResponseDto> => {
    const { data } = await apiClient.patch<StorageMoveResponseDto>(STORAGE_ENDPOINTS.move, params)
    return data
  },

  getAllDbImages: async (): Promise<DbImageListResponseDto> => {
    const { data } = await apiClient.get<DbImageListResponseDto>(STORAGE_ENDPOINTS.dbImages, {
      params: { page: 1, per_page: 500 },
    })
    return data
  },

  deleteDbRecord: async (id: number): Promise<boolean> => {
    const { data } = await apiClient.delete(STORAGE_ENDPOINTS.dbImageById(id))
    return data.success
  },

  updateDbPatch: async (id: number, imagePatch: string): Promise<boolean> => {
    const { data } = await apiClient.patch(STORAGE_ENDPOINTS.dbImageById(id), { image_patch: imagePatch })
    return data.success
  },
}
