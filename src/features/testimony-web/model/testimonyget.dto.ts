import type { LinksPaginationType } from '@/shared/type/linksPagination.type'
import type { MetaPaginationType } from '@/shared/type/metaPagination.type'

/**
 * A diferencia de `sectionbuttons` (sin `_join`), este módulo SÍ usa el endpoint `_join`
 * (`testimony_join` / `testimony_join/{id}`) tanto para lista como para detalle, igual que
 * `sectionimages` — es la única forma de traer `section.section_name` e `image.image_patch`
 * junto con el testimonio. Por eso `section`/`image` son opcionales acá: en los endpoints
 * planos (`/testimony`, usados solo para post/put/patch/delete) no vienen.
 */
export type TestimonyApiItem = {
  id_testimony_web: number
  id_section: number
  id_image: number | null
  testimony_name: string
  testimony_role: string | null
  testimony_city: string | null
  testimony_email: string | null
  testimony_rating: number | null
  testimony_message: string
  testimony_is_delivered: boolean
  testimony_is_verified: boolean
  testimony_order: number | null
  testimony_state: number
  testimony_created_at: string
  testimony_created_at_formatted: string | null
  testimony_updated_at: string | null
  testimony_updated_at_formatted: string | null
  created_at: string
  created_at_formatted: string | null
  updated_at: string | null
  updated_at_formatted: string | null
  section?: { id_section: number; section_name: string }
  image?: { id_image: number; image_name: string | null; image_alt: string | null; image_patch: string } | null
}

export type TestimonyListRequestDto = {
  id_section?: number
  search?: string
  state?: number
  per_page?: number
  page?: number
}

export type TestimonyListResponseDto = {
  success: boolean
  status: number
  message: string
  data: TestimonyApiItem[]
  links: LinksPaginationType
  meta: MetaPaginationType
}

export type TestimonyGetByIdResponseDto = {
  success: boolean
  status: number
  message: string
  data: TestimonyApiItem
}
