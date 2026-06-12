// src/feature/auth/model/login/loginDTO.ts
import { PersonType } from '@/entities/person/model/person.type'
import { UserType } from '@/shared/type/user/user.type'

export type LoginRequestDTO = {
  email: string;
  password: string;
};

export type LoginResponseDTO = {
  success: boolean;
  message: string;
  data : LoginDataDTO | null;
};

export type LoginDataDTO = {
  user: null | UserType;
  person: null | PersonType;
  access_token: string;
  refresh_token: string;
  token_type: string,
  expires_in: number
};