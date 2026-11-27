// POST /v1/intranet/auth/login — iniciar sesión con correo y contraseña
//
// Solo devuelve los TOKENS. El usuario, rol, permisos, empresa y sucursales
// se piden después con GET verify (ver verify.dto.ts).
//
// Ejemplo de respuesta:
// {
//   "success": true, "message": "Login correcto",
//   "data": {
//     "access_token": "eyJ...", "refresh_token": "def...",
//     "token_type": "Bearer", "expires_in": 31536000, "device_id": 7
//   }
// }
//
// Si falla (contraseña incorrecta, usuario o rol inactivo, rol sin acceso al intranet),
// responde 401 con { success: false, message: "..." }.

// Lo que se envía
export type LoginRequestDTO = {
  email: string
  password: string
}

// Lo que responde
export type LoginResponseDTO = {
  success: boolean
  message: string
  data: LoginDataDTO | null
}

// El contenido de "data": solo tokens
export type LoginDataDTO = {
  access_token: string
  refresh_token: string | null  // con Google viene null
  token_type: string            // 'Bearer'
  expires_in: number            // segundos que dura el access_token
  device_id: number | null      // dispositivo registrado para esta sesión
}
