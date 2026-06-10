import { UserType } from '@/shared/type/user/user.type'

export type UserPostRequestDto = {
  id_person: number;
  id_role: number;
  email: string;
  password: string;
  user_state: number;
}

export type UserPostResponseDto = {
  success: boolean;
  status: number;
  message: string;
  data: UserType;
}