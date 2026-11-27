// Llamadas a la API de alertas del sitio (listar, ver, crear, editar, borrar y ordenar).

import apiClient from '@/shared/api/apiClient'
import { WEB_ALERTS_ENDPOINTS } from './web-alerts.endpoint'
import type { WebAlertListRequestDto, WebAlertListResponseDto, WebAlertGetByIdResponseDto } from '../model/webalertget.dto'
import type { WebAlertPostRequestDto, WebAlertPostResponseDto } from '../model/webalertpost.dto'
import type {
  WebAlertPutRequestDto, WebAlertPutResponseDto,
  WebAlertReorderRequestDto, WebAlertReorderResponseDto,
} from '../model/webalertput.dto'

export const webAlertsService = {
  getList: async (param: WebAlertListRequestDto): Promise<WebAlertListResponseDto> => {
    // No se mandan los filtros vacíos
    const params = Object.fromEntries(
      Object.entries(param).filter(([, v]) => v !== undefined && v !== null && v !== '')
    )
    const { data } = await apiClient.get<WebAlertListResponseDto>(WEB_ALERTS_ENDPOINTS.v1.get, { params })
    return data
  },

  getById: async (id: number): Promise<WebAlertGetByIdResponseDto> => {
    const { data } = await apiClient.get<WebAlertGetByIdResponseDto>(WEB_ALERTS_ENDPOINTS.v1.getById(id))
    return data
  },

  post: async (param: WebAlertPostRequestDto): Promise<WebAlertPostResponseDto> => {
    const { data } = await apiClient.post<WebAlertPostResponseDto>(WEB_ALERTS_ENDPOINTS.v1.post, param)
    return data
  },

  put: async (id: number, param: WebAlertPutRequestDto): Promise<WebAlertPutResponseDto> => {
    const { data } = await apiClient.put<WebAlertPutResponseDto>(WEB_ALERTS_ENDPOINTS.v1.put(id), param)
    return data
  },

  /** Cambia solo algunos campos (lo usa el interruptor "Activada" de la lista). */
  patch: async (id: number, param: Partial<WebAlertPutRequestDto>): Promise<WebAlertPutResponseDto> => {
    const { data } = await apiClient.patch<WebAlertPutResponseDto>(WEB_ALERTS_ENDPOINTS.v1.patch(id), param)
    return data
  },

  delete: async (id: number): Promise<boolean> => {
    const { data } = await apiClient.delete(WEB_ALERTS_ENDPOINTS.v1.delete(id))
    return data.success
  },

  reorder: async (param: WebAlertReorderRequestDto): Promise<WebAlertReorderResponseDto> => {
    const { data } = await apiClient.post<WebAlertReorderResponseDto>(WEB_ALERTS_ENDPOINTS.v1.reorder, param)
    return data
  },
}
