import apiClient from '@/shared/api/apiClient'
import { STORAGE_FILES_ENDPOINTS } from './storage-files.endpoint'
import type { StorageFileListRequestDto, StorageFileListResponseDto } from '../model/storagefile.get.dto'
import type { StorageFilePostResponseDto } from '../model/storagefile.post.dto'
import type {
  StorageFilePatchRequestDto,
  StorageFilePatchResponseDto,
  StorageFileDeleteRequestDto,
  StorageFileDeleteResponseDto,
} from '../model/storagefile.patch.dto'

const clean = (params: Record<string, unknown>) =>
  Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ''))

export const storageFilesService = {
  getList: async (params: StorageFileListRequestDto = {}): Promise<StorageFileListResponseDto> => {
    const { data } = await apiClient.get<StorageFileListResponseDto>(
      STORAGE_FILES_ENDPOINTS.v1.get,
      { params: clean(params as Record<string, unknown>) }
    )
    return data
  },

  upload: async (formData: FormData, signal?: AbortSignal): Promise<StorageFilePostResponseDto> => {
    const { data } = await apiClient.post<StorageFilePostResponseDto>(
      STORAGE_FILES_ENDPOINTS.v1.post,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' }, signal }
    )
    return data
  },

  rename: async (payload: StorageFilePatchRequestDto): Promise<StorageFilePatchResponseDto> => {
    const { data } = await apiClient.patch<StorageFilePatchResponseDto>(
      STORAGE_FILES_ENDPOINTS.v1.patch,
      payload
    )
    return data
  },

  deleteFile: async (payload: StorageFileDeleteRequestDto): Promise<StorageFileDeleteResponseDto> => {
    const { data } = await apiClient.delete<StorageFileDeleteResponseDto>(
      STORAGE_FILES_ENDPOINTS.v1.delete,
      { data: payload }
    )
    return data
  },

  downloadBlob: async (pathEncoded: string, inline = false): Promise<Blob> => {
    const { data } = await apiClient.get(
      STORAGE_FILES_ENDPOINTS.v1.download,
      { params: { path_encoded: pathEncoded, ...(inline ? { inline: true } : {}) }, responseType: 'blob' }
    )
    return data as Blob
  },
}
