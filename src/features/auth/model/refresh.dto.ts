// POST /v1/intranet/auth/refresh — pedir un token nuevo cuando el actual venció
// Lo usa solo src/shared/api/apiClient.ts. No trae usuario ni permisos.

// Lo que se envía
export type RefreshTokenRequestDTO = {
  refresh_token: string
}

// Lo que responde
export type RefreshTokenResponseDTO = {
  access_token: string
  refresh_token?: string
  expires_in?: number
}
