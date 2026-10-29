import apiClient from '@/shared/api/apiClient'
import { WEB_WORKS_ENDPOINTS } from './web-works.endpoint'
import type {
  WebWorkListRequestDto,
  WebWorkListResponseDto,
  WebWorkGetByIdResponseDto,
  WebWorkStylesResponseDto,
} from '../model/webworkget.dto'
import type { WebWorkPostRequestDto, WebWorkPostResponseDto } from '../model/webworkpost.dto'
import type { WebWorkPutRequestDto, WebWorkPutResponseDto } from '../model/webworkput.dto'
import type { WebWorkReorderRequestDto, WebWorkReorderResponseDto } from '../model/webworkreorder.dto'

export const webWorksService = {
  getList: async (param: WebWorkListRequestDto): Promise<WebWorkListResponseDto> => {
    const params = Object.fromEntries(
      Object.entries(param).filter(([, v]) => v !== undefined && v !== null && v !== '')
    )
    const { data } = await apiClient.get<WebWorkListResponseDto>(WEB_WORKS_ENDPOINTS.v1.get, { params })
    return data
  },

  /**
   * Lista con `include=media`: cada trabajo trae además `images` y `pairs` completos.
   * Pensada para quien necesita las fotos (fotos automáticas del carrusel, selector "Foto de un trabajo").
   * `per_page` máx 100 (límite de la API).
   */
  getMediaList: async (param: Omit<WebWorkListRequestDto, 'include'> = {}): Promise<WebWorkListResponseDto> => {
    return webWorksService.getList({ page: 1, per_page: 100, ...param, include: 'media' })
  },

  getForSelect: async (): Promise<WebWorkListResponseDto> => {
    const { data } = await apiClient.get<WebWorkListResponseDto>(WEB_WORKS_ENDPOINTS.v1.get, {
      params: { page: 1, per_page: 100 },
    })
    return data
  },

  getById: async (id: number): Promise<WebWorkGetByIdResponseDto> => {
    const { data } = await apiClient.get<WebWorkGetByIdResponseDto>(WEB_WORKS_ENDPOINTS.v1.getById(id))
    return data
  },

  /** Estilos distintos ya usados en otros trabajos (sugerencias del campo "Estilo"). */
  getStyles: async (): Promise<WebWorkStylesResponseDto> => {
    const { data } = await apiClient.get<WebWorkStylesResponseDto>(WEB_WORKS_ENDPOINTS.v1.styles)
    return data
  },

  post: async (param: WebWorkPostRequestDto): Promise<WebWorkPostResponseDto> => {
    const { data } = await apiClient.post<WebWorkPostResponseDto>(WEB_WORKS_ENDPOINTS.v1.post, param)
    return data
  },

  put: async (id: number, param: WebWorkPutRequestDto): Promise<WebWorkPutResponseDto> => {
    const { data } = await apiClient.put<WebWorkPutResponseDto>(WEB_WORKS_ENDPOINTS.v1.put(id), param)
    return data
  },

  patch: async (id: number, param: Partial<WebWorkPutRequestDto>): Promise<WebWorkPutResponseDto> => {
    const { data } = await apiClient.patch<WebWorkPutResponseDto>(WEB_WORKS_ENDPOINTS.v1.patch(id), param)
    return data
  },

  delete: async (id: number): Promise<boolean> => {
    const { data } = await apiClient.delete(WEB_WORKS_ENDPOINTS.v1.delete(id))
    return data.success
  },

  reorder: async (param: WebWorkReorderRequestDto): Promise<WebWorkReorderResponseDto> => {
    const { data } = await apiClient.post<WebWorkReorderResponseDto>(WEB_WORKS_ENDPOINTS.v1.reorder, param)
    return data
  },
}
