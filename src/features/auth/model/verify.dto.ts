// GET /v1/intranet/auth/verify — "¿quién soy y qué puedo hacer?"
//
// Se llama justo después del login y cada vez que se abre el intranet.
// No se envía nada: solo el token en el header.
// La respuesta ("data") es LA SESIÓN que se guarda en el navegador (ver session.type.ts).
//
// Ejemplo de respuesta:
// {
//   "success": true, "message": "Sesión válida",
//   "data": {
//     "platform": "intranet",
//     "expires_at": "2027-11-22 20:23:13",
//     "user": {
//       "id": 1, "email": "ana@cillat.com", "registration_provider": "password", "user_state": 1,
//       "person": { "id_person": 1, "person_name": "Ana", "person_lastname": "Pérez", "person_email": "...", "photo_url": null },
//       "role": { "id_rol": 2, "role_name": "Admin", "role_slug": "admin", "role_is_system": 0, "permissions": ["clients.view"] },
//       "all_branches": false,
//       "branches": [ { "id": 1, "name": "Principal", "address": "Av. Lima 123", "is_default": true } ]
//     },
//     "company": { "business_name": "Cillat SAC", "trade_name": "Cillat", "tax_id": "20123456789", "logo_url": "https://..." },
//     "branch_filter": { "can_view_all": false, "default_branch_id": 1, "options": [ { "id": 1, "name": "Principal", "status": 1 } ] }
//   }
// }
//
// Si el usuario o el rol está inactivo, o el rol no tiene permisos del intranet,
// responde 401 con { success: false, message: "..." } y se cierra la sesión.

// Lo que responde
export type VerifyResponseDTO = {
  success: boolean
  message: string
  data: VerifyDataDTO | null
}

// El contenido de "data"
export type VerifyDataDTO = {
  platform: string                  // siempre 'intranet'
  expires_at: string | null         // cuándo vence el token ('Y-m-d H:i:s')
  user: SessionUserDTO
  company: SessionCompanyDTO | null // null si aún no se configuró la empresa
  branch_filter: SessionBranchFilterDTO
}

// Usuario que inició sesión
export type SessionUserDTO = {
  id: number
  email: string
  registration_provider: string     // 'password' | 'google'
  user_state: number                // 1 = activo
  person: SessionPersonDTO | null
  role: SessionRoleDTO | null
  all_branches: boolean             // true = trabaja en todas las sucursales
  branches: SessionBranchDTO[]      // donde puede registrar ventas y proformas
}

// Datos personales (nombre y foto)
export type SessionPersonDTO = {
  id_person: number
  person_name: string
  person_lastname: string
  person_email: string | null
  photo_url: string | null          // URL lista para <img>; null = mostrar iniciales
}

// Rol del usuario y sus permisos en el intranet
export type SessionRoleDTO = {
  id_rol: number
  role_name: string
  role_slug: string                 // 'superadmin' = acceso total
  role_is_system: number            // 1 = rol del sistema (no editable)
  permissions: string[]             // ej: ['clients.view', 'clients.create']
}

// Sucursal donde el usuario registra ventas/proformas
export type SessionBranchDTO = {
  id: number
  name: string
  address: string | null
  is_default: boolean               // la sucursal con la que arranca la sesión
}

// Empresa (encabezado del sidebar)
export type SessionCompanyDTO = {
  business_name: string             // razón social
  trade_name: string | null         // nombre comercial
  tax_id: string | null             // RUC
  logo_url: string | null           // URL lista para <img>
}

// Filtro de sucursales: qué datos puede VER (ventas, proformas, dashboard, reportes)
export type SessionBranchFilterDTO = {
  can_view_all: boolean             // true = ve los datos de todas las sucursales
  default_branch_id: number | null  // sucursal marcada al abrir los filtros
  options: SessionBranchOptionDTO[]
}

// Opción del filtro de sucursales
export type SessionBranchOptionDTO = {
  id: number
  name: string
  status: number                    // 1 = activa, 0 = inactiva
}
