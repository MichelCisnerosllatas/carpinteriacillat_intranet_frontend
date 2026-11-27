// POST /v1/intranet/auth/google — iniciar sesión con Google
//
// Si entra: responde igual que el login normal (solo tokens, LoginDataDTO),
// pero con refresh_token = null.
//   { "success": true, "message": "...", "data": { "access_token": "eyJ...", "refresh_token": null, ... } }
//
// Si no entra (correo no registrado, cuenta inactiva, rol sin acceso):
//   responde 401 y en "data" vienen los datos de Google para mostrarlos en una alerta.
//   { "success": false, "message": "...", "data": { "name": "Ana", "email": "ana@gmail.com", "photo_url": "https://..." } }
import type { LoginDataDTO } from './login.dto'

// Lo que se envía
export type LoginWithGoogleRequestDTO = {
  id_token: string
  name: string | null
  email: string
  photo_url: string | null
}

// Lo que responde: los tokens (si entró) o los datos de Google (si fue rechazado)
export type LoginWithGoogleResponseDTO = {
  success: boolean
  message: string
  data: LoginDataDTO | GoogleAuthRejectionDataDTO | null
}

// Datos de Google cuando el login fue rechazado
export type GoogleAuthRejectionDataDTO = {
  name: string | null
  email: string
  photo_url: string | null
}
