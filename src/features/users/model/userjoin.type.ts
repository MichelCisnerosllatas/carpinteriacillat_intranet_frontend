import { TypeDocType } from '@/shared/type/type_doc.type'

export type UserJoinType = {
  id: number;
  email: string;
  /** 'password' (creado desde el módulo de usuarios) o 'google' (aprobado desde Accesos Google). */
  registration_provider: string;
  email_verified_at: string | null;
  user_state: number;
  user_created_at: string;
  user_updated_at: string;
  user_created_at_format: string;
  user_updated_at_format: string;
  person: UserPersonType | null;
  role: UserRoleType | null;
  /** true = trabaja en TODAS las sucursales. */
  all_branches?: boolean;
  /** Sucursal por defecto (con la que arranca la sesión). */
  default_branch_id?: number | null;
  /** Sucursales asignadas (tabla branch_user). */
  branches?: UserBranchType[];
}

export type UserBranchType = {
  id: number;
  name: string;
  status: number;
  is_default: boolean;
}

type UserPersonType = {
  id_person: number;
  person_name: string;
  person_email: string | null;
  photo_url: string | null;
  person_lastname: string;
  id_typedoc: number | null;
  type_doc: TypeDocType | null;
  person_numdoc: string | null;
  person_state: number;
}

type UserRoleType = {
  id_rol: number;
  role_name: string;
  role_description: string | null;
  role_state: number;
}
