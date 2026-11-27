import { UserType } from '@/shared/type/user/user.type'

export type UserPatchRequestDto = {
  id_person?: number;
  id_rol?: number;
  email?: string;
  /** Solo se envía cuando el admin escribe una nueva — en blanco no toca la contraseña actual. */
  password?: string;
  user_state?: number;
  /** true = trabaja en todas las sucursales (branch_ids se ignora). */
  all_branches?: boolean;
  branch_ids?: number[];
  default_branch_id?: number | null;
}

export type UserPatchResponseDto = {
  success: boolean;
  status: number;
  message: string;
  data: UserType;
  errors?: Record<string, string[]>;
}
