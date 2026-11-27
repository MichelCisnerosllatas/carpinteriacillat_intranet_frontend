export type RoleType = {
  id_role: number
  role_name: string
  /** Identificador fijo del rol, ej: 'superadmin', 'admin'. */
  role_slug?: string | null
  role_description: string | null
  /** 1 = rol del sistema (superadmin): no se edita, no se borra y sus permisos no se cambian. */
  role_is_system?: number
  role_state: number
  role_created_at: string
  role_updated_at: string
}
