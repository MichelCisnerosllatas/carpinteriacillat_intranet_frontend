import apiClient from '@/shared/api/apiClient'
import { CONTACT_MESSAGES_ENDPOINTS } from './contact-messages.endpoint'
import type {
  ContactMessageListRequestDto,
  ContactMessageListResponseDto,
  ContactMessageDetailResponseDto,
} from '../model/contactmessageget.dto'
import type { ContactMessageStatusRequestDto, ContactMessageStatusResponseDto } from '../model/contactmessagestatus.dto'

export const contactMessagesService = {
  getList: async (param: ContactMessageListRequestDto): Promise<ContactMessageListResponseDto> => {
    const params = Object.fromEntries(
      Object.entries(param).filter(([_, v]) => v !== undefined && v !== null && v !== '')
    )
    const { data } = await apiClient.get<ContactMessageListResponseDto>(CONTACT_MESSAGES_ENDPOINTS.v1.get, { params })
    return data
  },

  getById: async (id: number): Promise<ContactMessageDetailResponseDto> => {
    const { data } = await apiClient.get<ContactMessageDetailResponseDto>(CONTACT_MESSAGES_ENDPOINTS.v1.getById(id))
    return data
  },

  patchStatus: async (
    id: number,
    param: ContactMessageStatusRequestDto
  ): Promise<ContactMessageStatusResponseDto> => {
    const { data } = await apiClient.patch<ContactMessageStatusResponseDto>(
      CONTACT_MESSAGES_ENDPOINTS.v1.patchStatus(id),
      param
    )
    return data
  },

  delete: async (id: number): Promise<boolean> => {
    const { data } = await apiClient.delete(CONTACT_MESSAGES_ENDPOINTS.v1.delete(id))
    return data.success
  },
}
