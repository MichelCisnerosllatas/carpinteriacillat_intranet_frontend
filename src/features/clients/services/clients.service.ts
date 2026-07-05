import apiClient from '@/shared/api/apiClient'
import { CLIENTS_ENDPOINTS } from './clients.endpoint'
import type {
  ClientListRequestDto,
  ClientJoinListResponseDto,
  ClientGetByIdResponseDto,
} from '../model/clientget.dto'
import type { ClientPostRequestDto, ClientPostResponseDto } from '../model/clientpost.dto'
import type { ClientPutRequestDto, ClientPutResponseDto } from '../model/clientput.dto'

export const clientsService = {
  // Tabla principal: usa el endpoint -join para traer el tipo de documento anidado.
  getList: async (param: ClientListRequestDto): Promise<ClientJoinListResponseDto> => {
    const params = Object.fromEntries(
      Object.entries(param).filter(([, v]) => v !== undefined && v !== null && v !== '')
    )
    const { data } = await apiClient.get<ClientJoinListResponseDto>(CLIENTS_ENDPOINTS.v1.getJoin, { params })
    return data
  },

  getById: async (id: number): Promise<ClientGetByIdResponseDto> => {
    const { data } = await apiClient.get<ClientGetByIdResponseDto>(`${CLIENTS_ENDPOINTS.v1.getJoin}/${id}`)
    return data
  },

  post: async (param: ClientPostRequestDto): Promise<ClientPostResponseDto> => {
    const { data } = await apiClient.post<ClientPostResponseDto>(CLIENTS_ENDPOINTS.v1.post, param)
    return data
  },

  put: async (id: number, param: ClientPutRequestDto): Promise<ClientPutResponseDto> => {
    const { data } = await apiClient.put<ClientPutResponseDto>(CLIENTS_ENDPOINTS.v1.put(id), param)
    return data
  },

  patch: async (id: number, param: Partial<ClientPutRequestDto>): Promise<ClientPutResponseDto> => {
    const { data } = await apiClient.patch<ClientPutResponseDto>(CLIENTS_ENDPOINTS.v1.patch(id), param)
    return data
  },

  delete: async (id: number): Promise<boolean> => {
    const { data } = await apiClient.delete(CLIENTS_ENDPOINTS.v1.delete(id))
    return data.success
  },
}
