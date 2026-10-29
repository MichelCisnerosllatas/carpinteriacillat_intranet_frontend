import type { LinksPaginationType } from '@/shared/type/linksPagination.type'
import type { MetaPaginationType } from '@/shared/type/metaPagination.type'

/** Claves que usa el código (web e intranet). No se pueden cambiar desde la intranet. */
export const TYPEWORK_KEYS = {
  manufacture: 'manufacture',
  restoration: 'restoration',
} as const

export type TypeWorkApiItem = {
  id_typework: number
  typework_key: string
  typework_name: string
  /** Nota interna: para qué sirve este tipo. */
  typework_description: string | null
  typework_state: number
  typework_created_at: string
  typework_created_at_formatted?: string | null
  typework_updated_at: string | null
  typework_updated_at_formatted?: string | null
  /** Cantidad de trabajos de la galería que usan este tipo. */
  web_works_count?: number
}

export type TypeWorkListRequestDto = {
  search?: string
  state?: number
  date_from?: string
  date_to?: string
  per_page?: number
  page?: number
}

export type TypeWorkListResponseDto = {
  success: boolean
  status: number
  message: string
  data: TypeWorkApiItem[]
  links: LinksPaginationType
  meta: MetaPaginationType
}
