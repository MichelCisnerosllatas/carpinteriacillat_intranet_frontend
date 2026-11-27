// "La sesión" del intranet: lo que responde GET verify (VerifyDataDTO).
//
// Se guarda en localStorage ('auth_user') y en useAuthStore (campo `session`).
// Los tokens NO están aquí: van aparte en TokenStorage.
//
// Lecturas comunes:
//   session.user.person         → nombre y foto
//   session.user.role           → rol y permisos (role.permissions)
//   session.user.branches       → sucursales donde registra
//   session.company             → empresa
//   session.branch_filter       → sucursales que puede VER en los filtros
import type { VerifyDataDTO } from './verify.dto'

export type AuthSession = VerifyDataDTO
