// src/feature/auth/model/login/refreshtoken.dto.ts
export type RefreshTokenRequestDTO = {
  refresh_token: string;
};

export type RefreshTokenResponseDTO = {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
};