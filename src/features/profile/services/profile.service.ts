import apiClient from '@/shared/api/apiClient'
import type {
  ChangeLoginEmailRequestDto,
  ChangeLoginEmailResponseDto,
  ChangePasswordRequestDto,
  ChangePasswordResponseDto,
  ProfilePhotoResponseDto,
  ProfileResponseDto,
  ProfileTypeDocsResponseDto,
  UpdateProfileRequestDto,
  UpdateProfileResponseDto,
} from '../model/profile.dto'

export const PROFILE_ENDPOINTS = {
  v1: {
    get: '/v1/intranet/auth/profile',
    changePassword: '/v1/intranet/auth/change-password',
    photo: '/v1/intranet/auth/profile/photo',
    update: '/v1/intranet/auth/profile',
    typeDocs: '/v1/intranet/auth/profile/type-docs',
    loginEmail: '/v1/intranet/auth/profile/email',
  },
}

export const profileService = {
  get: async (): Promise<ProfileResponseDto> => {
    const { data } = await apiClient.get<ProfileResponseDto>(PROFILE_ENDPOINTS.v1.get)
    return data
  },

  changePassword: async (param: ChangePasswordRequestDto): Promise<ChangePasswordResponseDto> => {
    const { data } = await apiClient.put<ChangePasswordResponseDto>(PROFILE_ENDPOINTS.v1.changePassword, param)
    return data
  },

  /** Lista de tipos de documento para el selector (no pide permisos de módulo). */
  getTypeDocs: async (): Promise<ProfileTypeDocsResponseDto> => {
    const { data } = await apiClient.get<ProfileTypeDocsResponseDto>(PROFILE_ENDPOINTS.v1.typeDocs)
    return data
  },

  /** Guarda mis datos personales. */
  update: async (param: UpdateProfileRequestDto): Promise<UpdateProfileResponseDto> => {
    const { data } = await apiClient.put<UpdateProfileResponseDto>(PROFILE_ENDPOINTS.v1.update, param)
    return data
  },

  /** Cambia mi correo de acceso (login). */
  changeLoginEmail: async (param: ChangeLoginEmailRequestDto): Promise<ChangeLoginEmailResponseDto> => {
    const { data } = await apiClient.put<ChangeLoginEmailResponseDto>(PROFILE_ENDPOINTS.v1.loginEmail, param)
    return data
  },

  /** Sube mi foto de perfil. El archivo viaja en un FormData con el nombre `photo`. */
  uploadPhoto: async (file: File): Promise<ProfilePhotoResponseDto> => {
    const formData = new FormData()
    formData.append('photo', file)

    // apiClient envía JSON por defecto: aquí indicamos que es un archivo (multipart).
    const { data } = await apiClient.post<ProfilePhotoResponseDto>(PROFILE_ENDPOINTS.v1.photo, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },

  /** Quita mi foto de perfil (vuelven a mostrarse las iniciales). */
  deletePhoto: async (): Promise<ProfilePhotoResponseDto> => {
    const { data } = await apiClient.delete<ProfilePhotoResponseDto>(PROFILE_ENDPOINTS.v1.photo)
    return data
  },
}
