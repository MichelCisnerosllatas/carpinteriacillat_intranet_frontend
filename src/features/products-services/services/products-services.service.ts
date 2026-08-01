import apiClient from '@/shared/api/apiClient'
import { PRODUCTS_SERVICES_ENDPOINTS } from './products-services.endpoint'
import type {
  ProductServiceListRequestDto,
  ProductServiceListResponseDto,
  ProductServiceJoinListResponseDto,
  ProductServiceGetByIdResponseDto,
} from '../model/productserviceget.dto'
import type {
  ProductServicePostRequestDto,
  ProductServicePostResponseDto,
} from '../model/productservicepost.dto'
import type {
  ProductServicePutRequestDto,
  ProductServicePutResponseDto,
} from '../model/productserviceput.dto'

export const productsServicesService = {
  // Lista con el mueble vinculado (si existe) — usada por la tabla principal.
  getList: async (
    param: ProductServiceListRequestDto
  ): Promise<ProductServiceJoinListResponseDto> => {
    const params = Object.fromEntries(
      Object.entries(param).filter(([, v]) => v !== undefined && v !== null && v !== '')
    )
    const { data } = await apiClient.get<ProductServiceJoinListResponseDto>(
      PRODUCTS_SERVICES_ENDPOINTS.v1.getJoin,
      { params }
    )
    return data
  },

  getById: async (id: number): Promise<ProductServiceGetByIdResponseDto> => {
    const { data } = await apiClient.get<ProductServiceGetByIdResponseDto>(
      `${PRODUCTS_SERVICES_ENDPOINTS.v1.getJoin}/${id}`
    )
    return data
  },

  // Con join — el select/picker necesita la imagen de portada + galería del mueble vinculado.
  getForSelect: async (): Promise<ProductServiceJoinListResponseDto> => {
    const { data } = await apiClient.get<ProductServiceJoinListResponseDto>(
      PRODUCTS_SERVICES_ENDPOINTS.v1.getJoin,
      {
        params: { page: 1, per_page: 100, status: 1 },
      }
    )
    return data
  },

  /** Igual que getForSelect, pero es la que consume useProductServiceModalSelectStore para <ModalSelect />. */
  getForModalSelect: async (): Promise<ProductServiceListResponseDto> => {
    const { data } = await apiClient.get<ProductServiceListResponseDto>(
      PRODUCTS_SERVICES_ENDPOINTS.v1.get,
      {
        params: { page: 1, per_page: 100 },
      }
    )
    return data
  },

  post: async (param: ProductServicePostRequestDto): Promise<ProductServicePostResponseDto> => {
    const { data } = await apiClient.post<ProductServicePostResponseDto>(
      PRODUCTS_SERVICES_ENDPOINTS.v1.post,
      param
    )
    return data
  },

  put: async (
    id: number,
    param: ProductServicePutRequestDto
  ): Promise<ProductServicePutResponseDto> => {
    const { data } = await apiClient.put<ProductServicePutResponseDto>(
      PRODUCTS_SERVICES_ENDPOINTS.v1.put(id),
      param
    )
    return data
  },

  patch: async (
    id: number,
    param: Partial<ProductServicePutRequestDto>
  ): Promise<ProductServicePutResponseDto> => {
    const { data } = await apiClient.patch<ProductServicePutResponseDto>(
      PRODUCTS_SERVICES_ENDPOINTS.v1.patch(id),
      param
    )
    return data
  },

  delete: async (id: number): Promise<boolean> => {
    const { data } = await apiClient.delete(PRODUCTS_SERVICES_ENDPOINTS.v1.delete(id))
    return data.success
  },
}
