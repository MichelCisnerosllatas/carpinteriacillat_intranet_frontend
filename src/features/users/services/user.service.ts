// src/features/users/services/user.service.ts
import apiClient from '@/shared/api/apiClient'
import { USER_ENDPOINTS } from '@/features/users/services/user.endpoint'
import { userGetRequestDto, userGetResponseDto } from '@/features/users/model/userget.dto'
import { UserPostRequestDto, UserPostResponseDto } from '@/features/users/model/userpost.dto'

export const userService = {
  get: async (param: userGetRequestDto): Promise<userGetResponseDto> => {
    const params = Object.fromEntries(
      Object.entries(param).filter(([_, value]) => {
        return value !== undefined && value !== null && value !== ''
      })
    )

    const { data } = await apiClient.get<userGetResponseDto>(
      USER_ENDPOINTS.v1.get,
      { params }
    )

    return data
  },

  post: async (param: UserPostRequestDto): Promise<UserPostResponseDto> => {
    const {data} = await apiClient.post<UserPostResponseDto>(
      USER_ENDPOINTS.v1.post,
      param
    );
    return data;
  },

  patch: () => {},
  
  delete: async (id: number): Promise<boolean> => {
    const {data} = await apiClient.delete(USER_ENDPOINTS.v1.delete(id));
    return data.success;
  },
}