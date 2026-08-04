import apiClient from '@/shared/api/apiClient'
import { IMAGES_ENDPOINTS } from './images.endpoint'
import type { ImageListRequestDto, ImageListResponseDto, ImageGetByIdResponseDto } from '../model/imageget.dto'
import type { StorageListRequestDto, StorageListResponseDto, StorageDeleteResponseDto } from '../model/imagestorage.dto'
import type { ImageUploadResponseDto } from '../model/imageupload.dto'
import { ImagePostRequestDto, ImagePostResponseDto } from '../model/imagepost.dto'

export const imagesService = {
  getList: async (param: ImageListRequestDto): Promise<ImageListResponseDto> => {
    const params = Object.fromEntries(
      Object.entries(param).filter(([, v]) => v !== undefined && v !== null && v !== 0 && v !== '')
    )
    const { data } = await apiClient.get<ImageListResponseDto>(IMAGES_ENDPOINTS.v1.get, { params })
    return data
  },

  getForSelect: async (): Promise<ImageListResponseDto> => {
    const { data } = await apiClient.get<ImageListResponseDto>(IMAGES_ENDPOINTS.v1.get, {
      params: { page: 1, per_page: 100 },
    })
    return data
  },

  /** Igual que getForSelect, pero es la que consume useImageModalSelectStore para <ModalSelect />. */
  getForModalSelect: async (): Promise<ImageListResponseDto> => {
    const { data } = await apiClient.get<ImageListResponseDto>(IMAGES_ENDPOINTS.v1.get, {
      params: { page: 1, per_page: 100 },
    })
    return data
  },

  getById: async (id: number): Promise<ImageGetByIdResponseDto> => {
    const { data } = await apiClient.get<ImageGetByIdResponseDto>(IMAGES_ENDPOINTS.v1.getById(id))
    return data
  },

  post: async (request: ImagePostRequestDto): Promise<ImagePostResponseDto> => {
    const formData = new FormData();
    if(request.image != null) formData.append("image", request.image);
    formData.append("image_name", request.image_name);
    formData.append("image_title", request.image_title);
    formData.append("image_alt", request.image_alt);

    if (request.folder?.trim()) {
      formData.append("folder", request.folder.trim());
    }

    const { data } = await apiClient.post<ImagePostResponseDto>(
      IMAGES_ENDPOINTS.v1.post,
      formData,
      { 
        headers: { 
          'Content-Type': 'multipart/form-data' 
        } 
      }
    )
    return data;  
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
