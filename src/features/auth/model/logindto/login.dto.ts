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


// AUTH PROVEEDOR-------------------------//
export type LoginWithGoogleRequestDTO = {
  id_token: string;
  name: string | null;
  email: string;
  photo_url: string | null;
};

export type LoginWithGoogleResponseDTO = {
  success: boolean;
  message: string;
  data: LoginDataDTO | GoogleAuthRejectionDataDTO | null;
};


/** Lo que Google/Firebase devolvió, para cuando el login falla (correo no registrado o cuenta
 * inactiva) — permite mostrar al visitante esos datos junto al rechazo, en vez de un error
 * genérico sin contexto (ver GoogleAccessPendingAlert). */
export type GoogleAuthRejectionDataDTO = {
  name: string | null;
  email: string;
  photo_url: string | null;
};