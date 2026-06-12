import { UserType } from '@/shared/type/user/user.type'

export type UserPatchRequestDto = {
  id_person?: number;
  id_rol?: number;
  email?: string;
  user_state?: number;
}

export type UserPatchResponseDto = {
  success: boolean;
  status: number;
  message: string;
  data: UserType;
  errors?: Record<string, string[]>;
}
