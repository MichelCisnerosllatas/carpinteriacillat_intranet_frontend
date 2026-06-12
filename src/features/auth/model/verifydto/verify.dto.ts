// src/feature/auth/model/login/loginDTO.ts
import { PersonType } from '@/entities/person/model/person.type'
import { UserType } from '@/shared/type/user/user.type'

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