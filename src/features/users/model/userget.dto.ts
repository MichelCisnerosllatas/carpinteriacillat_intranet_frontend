// src/features/users/model/userget.dto.ts
import { LinksPaginationType } from '@/shared/type/linksPagination.type'
import { MetaPaginationType } from '@/shared/type/metaPagination.type'
import { UserJoinType } from '@/features/users/model/userjoin.type'

export type UserGetRequestDto = {
  /** Trae un solo usuario por su id exacto — usado para refrescar el formulario de edición sin depender de que la lista ya esté cargada en el store. */
  id?: number;
  search?: string;
  state?: number;
  role?: number;
  per_page?: number;
  page?: number;
  date_from?: string;
  date_to?: string;
}

export type UserGetResponseDto = {
  success: boolean;
  status: number;
  message: string;
  data: UserJoinType[];
  links: LinksPaginationType;
  meta: MetaPaginationType;
}