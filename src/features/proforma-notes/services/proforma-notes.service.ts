import apiClient from '@/shared/api/apiClient'
import { PROFORMA_NOTES_ENDPOINTS } from './proforma-notes.endpoint'
import type { ProformaNoteListRequestDto, ProformaNoteListResponseDto } from '../model/proformanoteget.dto'
import type { ProformaNotePostRequestDto, ProformaNotePostResponseDto } from '../model/proformanotepost.dto'
import type { ProformaNotePutRequestDto, ProformaNotePutResponseDto } from '../model/proformanoteput.dto'

export const proformaNotesService = {
  getList: async (param: ProformaNoteListRequestDto): Promise<ProformaNoteListResponseDto> => {
    const params = Object.fromEntries(
      Object.entries(param).filter(([_, v]) => v !== undefined && v !== null && v !== '')
    )
    const { data } = await apiClient.get<ProformaNoteListResponseDto>(PROFORMA_NOTES_ENDPOINTS.v1.get, { params })
    return data
  },

  post: async (param: ProformaNotePostRequestDto): Promise<ProformaNotePostResponseDto> => {
    const { data } = await apiClient.post<ProformaNotePostResponseDto>(PROFORMA_NOTES_ENDPOINTS.v1.post, param)
    return data
  },

  put: async (id: number, param: ProformaNotePutRequestDto): Promise<ProformaNotePutResponseDto> => {
    const { data } = await apiClient.put<ProformaNotePutResponseDto>(PROFORMA_NOTES_ENDPOINTS.v1.put(id), param)
    return data
  },

  patch: async (id: number, param: Partial<ProformaNotePutRequestDto>): Promise<ProformaNotePutResponseDto> => {
    const { data } = await apiClient.patch<ProformaNotePutResponseDto>(PROFORMA_NOTES_ENDPOINTS.v1.patch(id), param)
    return data
  },

  delete: async (id: number): Promise<boolean> => {
    const { data } = await apiClient.delete(PROFORMA_NOTES_ENDPOINTS.v1.delete(id))
    return data.success
  },
}
