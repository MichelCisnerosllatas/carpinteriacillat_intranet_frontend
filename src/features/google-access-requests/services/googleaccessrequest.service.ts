import apiClient from '@/shared/api/apiClient'
import { GOOGLE_ACCESS_REQUEST_ENDPOINTS } from './googleaccessrequest.endpoint'
import type {
  GoogleAccessRequestListRequestDto,
  GoogleAccessRequestListResponseDto,
  GoogleAccessRequestDetailResponseDto,
} from '../model/googleaccessrequestget.dto'
import type { ApproveGoogleAccessRequestDto, GoogleAccessRequestActionResponseDto } from '../model/googleaccessrequestaction.dto'

export const googleAccessRequestService = {
  getList: async (param: GoogleAccessRequestListRequestDto): Promise<GoogleAccessRequestListResponseDto> => {
    const params = Object.fromEntries(
      Object.entries(param).filter(([, v]) => v !== undefined && v !== null && v !== '')
    )
    const { data } = await apiClient.get<GoogleAccessRequestListResponseDto>(GOOGLE_ACCESS_REQUEST_ENDPOINTS.v1.get, { params })
    return data
  },

  getById: async (id: number): Promise<GoogleAccessRequestDetailResponseDto> => {
    const { data } = await apiClient.get<GoogleAccessRequestDetailResponseDto>(GOOGLE_ACCESS_REQUEST_ENDPOINTS.v1.getById(id))
    return data
  },

  approve: async (id: number, param: ApproveGoogleAccessRequestDto): Promise<GoogleAccessRequestActionResponseDto> => {
    const { data } = await apiClient.post<GoogleAccessRequestActionResponseDto>(GOOGLE_ACCESS_REQUEST_ENDPOINTS.v1.approve(id), param)
    return data
  },

  reject: async (id: number): Promise<GoogleAccessRequestActionResponseDto> => {
    const { data } = await apiClient.post<GoogleAccessRequestActionResponseDto>(GOOGLE_ACCESS_REQUEST_ENDPOINTS.v1.reject(id))
    return data
  },
}
