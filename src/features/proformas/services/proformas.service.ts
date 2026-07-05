import apiClient from '@/shared/api/apiClient'
import { PROFORMAS_ENDPOINTS } from './proformas.endpoint'
import type {
  ProformaListRequestDto,
  ProformaJoinListResponseDto,
  ProformaGetByIdResponseDto,
} from '../model/proformaget.dto'
import type { ProformaPostRequestDto, ProformaPostResponseDto } from '../model/proformapost.dto'
import type { ProformaPutRequestDto, ProformaPutResponseDto } from '../model/proformaput.dto'

export const proformasService = {
  // Tabla principal y detalle: usa el endpoint -join (cliente, plantilla, firma, tipo y detalles).
  getList: async (param: ProformaListRequestDto): Promise<ProformaJoinListResponseDto> => {
    const params = Object.fromEntries(
      Object.entries(param).filter(([, v]) => v !== undefined && v !== null && v !== '')
    )
    const { data } = await apiClient.get<ProformaJoinListResponseDto>(PROFORMAS_ENDPOINTS.v1.getJoin, { params })
    return data
  },

  getById: async (id: number): Promise<ProformaGetByIdResponseDto> => {
    const { data } = await apiClient.get<ProformaGetByIdResponseDto>(`${PROFORMAS_ENDPOINTS.v1.getJoin}/${id}`)
    return data
  },

  post: async (param: ProformaPostRequestDto): Promise<ProformaPostResponseDto> => {
    const { data } = await apiClient.post<ProformaPostResponseDto>(PROFORMAS_ENDPOINTS.v1.post, param)
    return data
  },

  put: async (id: number, param: ProformaPutRequestDto): Promise<ProformaPutResponseDto> => {
    const { data } = await apiClient.put<ProformaPutResponseDto>(PROFORMAS_ENDPOINTS.v1.put(id), param)
    return data
  },

  patch: async (id: number, param: Partial<ProformaPutRequestDto>): Promise<ProformaPutResponseDto> => {
    const { data } = await apiClient.patch<ProformaPutResponseDto>(PROFORMAS_ENDPOINTS.v1.patch(id), param)
    return data
  },

  delete: async (id: number): Promise<boolean> => {
    const { data } = await apiClient.delete(PROFORMAS_ENDPOINTS.v1.delete(id))
    return data.success
  },

  // GET /proformas/{id}/pdf — devuelve el PDF binario directo, no usa el sobre JSON estándar.
  downloadPdf: async (id: number, download = false): Promise<Blob> => {
    const { data } = await apiClient.get(PROFORMAS_ENDPOINTS.v1.pdf(id), {
      params: download ? { download: 1 } : {},
      responseType: 'blob',
    })
    return data
  },
}
