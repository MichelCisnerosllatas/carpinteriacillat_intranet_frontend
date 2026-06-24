import apiClient from '@/shared/api/apiClient'
import { STORAGE_FOLDERS_ENDPOINTS } from './storage-folders.endpoint'
import type {
  StorageFolderListRequestDto,
  StorageFolderListResponseDto,
  StorageFolderTreeRequestDto,
  StorageFolderTreeResponseDto,
} from '../model/storagefolder.get.dto'
import type {
  StorageFolderPostRequestDto,
  StorageFolderPostResponseDto,
} from '../model/storagefolder.post.dto'
import type {
  StorageFolderPatchRequestDto,
  StorageFolderPatchResponseDto,
  StorageFolderMoveRequestDto,
  StorageFolderDeleteRequestDto,
  StorageFolderDeleteResponseDto,
} from '../model/storagefolder.patch.dto'

const clean = (params: Record<string, unknown>) =>
  Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ''))

export const storageFoldersService = {
  getList: async (params: StorageFolderListRequestDto = {}): Promise<StorageFolderListResponseDto> => {
    const { data } = await apiClient.get<StorageFolderListResponseDto>(
      STORAGE_FOLDERS_ENDPOINTS.v1.get,
      { params: clean(params as Record<string, unknown>) }
    )
    return data
  },

  getAll: async (params: StorageFolderTreeRequestDto = {}): Promise<StorageFolderTreeResponseDto> => {
    const { data } = await apiClient.get<StorageFolderTreeResponseDto>(
      STORAGE_FOLDERS_ENDPOINTS.v1.all,
      { params: clean(params as Record<string, unknown>) }
    )
    return data
  },

  create: async (payload: StorageFolderPostRequestDto): Promise<StorageFolderPostResponseDto> => {
    const { data } = await apiClient.post<StorageFolderPostResponseDto>(
      STORAGE_FOLDERS_ENDPOINTS.v1.post,
      payload
    )
    return data
  },

  rename: async (payload: StorageFolderPatchRequestDto): Promise<StorageFolderPatchResponseDto> => {
    const { data } = await apiClient.patch<StorageFolderPatchResponseDto>(
      STORAGE_FOLDERS_ENDPOINTS.v1.patch,
      payload
    )
    return data
  },

  move: async (payload: StorageFolderMoveRequestDto): Promise<StorageFolderPatchResponseDto> => {
    const { data } = await apiClient.patch<StorageFolderPatchResponseDto>(
      STORAGE_FOLDERS_ENDPOINTS.v1.patch,
      payload
    )
    return data
  },

  delete: async (payload: StorageFolderDeleteRequestDto): Promise<StorageFolderDeleteResponseDto> => {
    const { data } = await apiClient.delete<StorageFolderDeleteResponseDto>(
      STORAGE_FOLDERS_ENDPOINTS.v1.delete,
      { data: payload }
    )
    return data
  },
}
