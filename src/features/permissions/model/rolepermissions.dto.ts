// GET y PUT /v1/intranet/role/{id}/permissions

export type RolePermissionsDto = {
  id_rol: number
  role_name: string
  role_slug: string | null
  /** 1 = rol del sistema (superadmin): sus permisos no se editan. */
  role_is_system: number
  /** Keys COMPLETAS marcadas: ['intranet.clients.view', 'mobile.sales.view', ...] */
  permissions: string[]
}

export type RolePermissionsGetResponseDto = {
  success: boolean
  status: number
  message: string
  data: RolePermissionsDto
}

export type RolePermissionsPutRequestDto = {
  /** Keys COMPLETAS de las dos plataformas (reemplaza las anteriores). */
  permissions: string[]
}

export type RolePermissionsPutResponseDto = {
  success: boolean
  status: number
  message: string
  data: {
    id_rol: number
    permissions: string[]
  }
  errors?: Record<string, string[]>
}
