// src/features/users/model/userget.dto.ts
import { LinksPaginationType } from '@/shared/type/linksPagination.type'
import { MetaPaginationType } from '@/shared/type/metaPagination.type'
import { UserJoinType } from '@/shared/type/user/userjoin.type'

export type userGetRequestDto = {
  search?: string;
  state?: number;
  role?: number;
  per_page?: number;
  page?: number;
  date_from?: string;
  date_to?: string;
}

export type userGetResponseDto = {
  success: boolean;
  status: number;
  message: string;
  data: UserJoinType[];
  links: LinksPaginationType;
  meta: MetaPaginationType;
}