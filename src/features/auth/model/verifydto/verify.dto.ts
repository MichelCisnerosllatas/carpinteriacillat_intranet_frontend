// src/feature/auth/model/login/loginDTO.ts
import { PersonType } from '@/shared/type/person.type'
import { UserType } from '@/shared/type/user.type'

export type VerifyResponseDTO = {
  success: boolean;
  message: string;
  data : LoginDataDTO | null;
};

export type LoginDataDTO = {
  user: null | UserType;
  person: null | PersonType;
  expires_in: number
};