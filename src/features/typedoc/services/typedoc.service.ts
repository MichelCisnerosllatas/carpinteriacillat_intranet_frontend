import apiClient from '@/shared/api/apiClient'
import { TYPEDOC_ENDPOINTS } from './typedoc.endpoint'
import type { TypeDocGetResponseDto } from '@/entities/typedoc/model/typedocget.dto'

export const typeDocService = {
  getForSelect: async (): Promise<TypeDocGetResponseDto> => {
    const { data } = await apiClient.get<TypeDocGetResponseDto>(TYPEDOC_ENDPOINTS.v1.get)
    return data
  },
}
