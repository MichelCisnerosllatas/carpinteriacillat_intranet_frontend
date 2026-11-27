// GET /v1/intranet/auth/profile — "Mi perfil" (este endpoint NO cambió: sigue con la forma plana).
// Por eso tiene sus propios tipos y no usa los de la sesión (verify.dto.ts).

// Rol del usuario en el perfil
export type ProfileRoleDto = {
  id_rol: number
  role_name: string
  role_slug: string
  role_is_system: number
}

// Empresa en el perfil
export type ProfileCompanyDto = {
  business_name: string
  trade_name: string | null
  tax_id: string | null
  logo: string | null
  logo_url: string | null
}

// Sucursal donde trabaja
export type ProfileBranchDto = {
  id: number
  name: string
  address: string | null
  is_default: boolean
}

export type ProfileDto = {
  id: number
  email: string
  registration_provider: string
  /** false para cuentas creadas desde Google (no tienen una contraseña conocida). */
  can_change_password: boolean
  user_state: number
  user_created_at: string | null
  person: {
    id_person: number
    person_name: string
    person_lastname: string
    person_email: string | null
    person_numdoc: string | null
    id_typedoc: number | null
    typedoc_name: string | null
    photo_url: string | null
  } | null
  role: ProfileRoleDto | null
  is_superadmin: boolean
  company: ProfileCompanyDto | null
  all_branches: boolean
  can_view_all_branches: boolean
  default_branch_id: number | null
  branches: ProfileBranchDto[]
}

export type ProfileResponseDto = {
  success: boolean
  message: string
  data: ProfileDto
}

/** GET /v1/intranet/auth/profile/type-docs — opciones del selector de tipo de documento. */
export type ProfileTypeDocDto = {
  id_typedoc: number
  typedoc_name: string
}

export type ProfileTypeDocsResponseDto = {
  success: boolean
  message: string
  data: ProfileTypeDocDto[]
}

/** PUT /v1/intranet/auth/profile — mis datos personales. Responde el perfil completo actualizado. */
export type UpdateProfileRequestDto = {
  person_name: string
  person_lastname: string
  person_email: string | null
  id_typedoc: number
  person_numdoc: string
}

export type UpdateProfileResponseDto = {
  success: boolean
  message: string
  data?: ProfileDto
  errors?: Record<string, string[]>
}

/** PUT /v1/intranet/auth/profile/email — mi correo de acceso (pide la contraseña actual). */
export type ChangeLoginEmailRequestDto = {
  email: string
  current_password: string
}

export type ChangeLoginEmailResponseDto = {
  success: boolean
  message: string
  data?: { email: string }
  errors?: Record<string, string[]>
}

/**
 * POST   /v1/intranet/auth/profile/photo  (multipart, campo `photo`) → sube/cambia mi foto
 * DELETE /v1/intranet/auth/profile/photo                             → quita mi foto
 * En los dos casos `data.photo_url` trae la foto nueva (null si se quitó).
 */
export type ProfilePhotoResponseDto = {
  success: boolean
  message: string
  data: {
    photo_url: string | null
  } | null
  errors?: Record<string, string[]>
}

/** PUT /v1/intranet/auth/change-password */
export type ChangePasswordRequestDto = {
  current_password: string
  password: string
  password_confirmation: string
}

export type ChangePasswordResponseDto = {
  success: boolean
  message: string
  errors?: Record<string, string[]>
}
