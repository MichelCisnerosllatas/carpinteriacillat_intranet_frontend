import { UserType } from '@/shared/type/user/user.type'

export type UserPatchRequestDto = {
  id_person?: number;
  id_rol?: number;
  email?: string;
  /** Solo se envía cuando el admin escribe una nueva — en blanco no toca la contraseña actual. */
  password?: string;
  user_state?: number;
}

export type UserPatchResponseDto = {
  success: boolean;
  status: number;
  message: string;
  data: UserType;
  errors?: Record<string, string[]>;
}
