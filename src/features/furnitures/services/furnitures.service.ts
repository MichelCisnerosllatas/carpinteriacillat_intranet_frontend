import apiClient from '@/shared/api/apiClient'
import { FURNITURES_ENDPOINTS } from './furnitures.endpoint'
import type {
  FurnitureListRequestDto,
  FurnitureJoinListResponseDto,
  FurnitureGetByIdResponseDto,
} from '../model/furnitureget.dto'
import type { FurniturePostRequestDto, FurniturePostResponseDto } from '../model/furniturepost.dto'
import type { FurniturePutRequestDto, FurniturePutResponseDto } from '../model/furnitureput.dto'

export const furnituresService = {
  getList: async (param: FurnitureListRequestDto): Promise<FurnitureJoinListResponseDto> => {
    const params = Object.fromEntries(
      Object.entries(param).filter(([, v]) => v !== undefined && v !== null && v !== '')
    )
    const { data } = await apiClient.get<FurnitureJoinListResponseDto>(FURNITURES_ENDPOINTS.v1.getJoin, { params })
    return data
  },

  getById: async (id: number): Promise<FurnitureGetByIdResponseDto> => {
    const { data } = await apiClient.get<FurnitureGetByIdResponseDto>(`${FURNITURES_ENDPOINTS.v1.getJoin}/${id}`)
    return data
  },

  /** Igual que getList, pero es la que consume useFurnitureModalSelectStore para <ModalSelect />. */
  getForModalSelect: async (): Promise<FurnitureJoinListResponseDto> => {
    const { data } = await apiClient.get<FurnitureJoinListResponseDto>(FURNITURES_ENDPOINTS.v1.getJoin, {
      params: { page: 1, per_page: 100 },
    })
    return data
  },

  post: async (param: FurniturePostRequestDto): Promise<FurniturePostResponseDto> => {
    const { data } = await apiClient.post<FurniturePostResponseDto>(FURNITURES_ENDPOINTS.v1.post, param)
    return data
  },

  put: async (id: number, param: FurniturePutRequestDto): Promise<FurniturePutResponseDto> => {
    const { data } = await apiClient.put<FurniturePutResponseDto>(FURNITURES_ENDPOINTS.v1.put(id), param)
    return data
  },

  patch: async (id: number, param: Partial<FurniturePutRequestDto>): Promise<FurniturePutResponseDto> => {
    const { data } = await apiClient.patch<FurniturePutResponseDto>(FURNITURES_ENDPOINTS.v1.patch(id), param)
    return data
  },

  delete: async (id: number): Promise<boolean> => {
    const { data } = await apiClient.delete(FURNITURES_ENDPOINTS.v1.delete(id))
    return data.success
  },
}
