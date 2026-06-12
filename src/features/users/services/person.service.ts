import apiClient from '@/shared/api/apiClient'
import { PERSON_ENDPOINTS } from './person.endpoint'
import type { PersonPostRequestDto, PersonPostResponseDto } from '@/entities/person/model/personpost.dto'
import type { PersonPatchRequestDto, PersonPatchResponseDto } from '@/entities/person/model/personpatch.dto'

export const personService = {
  post: async (param: PersonPostRequestDto): Promise<PersonPostResponseDto> => {
    const { data } = await apiClient.post<PersonPostResponseDto>(
      PERSON_ENDPOINTS.v1.post,
      param
    )
    return data
  },

  patch: async (id: number, param: PersonPatchRequestDto): Promise<PersonPatchResponseDto> => {
    const { data } = await apiClient.patch<PersonPatchResponseDto>(
      PERSON_ENDPOINTS.v1.patch(id),
      param
    )
    return data
  },
}
