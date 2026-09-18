import type { LinksPaginationType } from '@/shared/type/linksPagination.type'
import type { MetaPaginationType } from '@/shared/type/metaPagination.type'

export type SectionImageApiItem = {
  id_section_image: number
  id_section: number
  id_image: number
  sectionimage_fix: string | null
  sectionimage_order: number | null
  sectionimage_state: number
  sectionimage_created_at: string
  sectionimage_created_at_format?: string | null
  sectionimage_updated_at: string | null
  sectionimage_updated_at_format?: string | null
}

// `Omit<..., 'id_section' | 'id_image'>`: el endpoint `_join` (el único que usa este módulo,
// tanto para lista como para detalle) NO trae esos dos campos a nivel raíz como sí hace el
// endpoint plano — vienen anidados dentro de `section.id_section` / `image.id_image`. Heredarlos
// tal cual de `SectionImageApiItem` sugería (falsamente) que existían sueltos también acá, lo
// que llevó a leer `item.id_section`/`item.id_image` directo y obtener siempre `undefined`.
export type SectionImageJoinApiItem = Omit<SectionImageApiItem, 'id_section' | 'id_image'> & {
  section: { id_section: number; section_name: string }
  // El endpoint `_join` devuelve `image_patch` (ruta relativa de storage), no una URL absoluta
  // — hay que resolverla con `buildImageUrl()` antes de usarla en un <img>.
  image: { id_image: number; image_name: string; image_patch: string }
}

export type SectionImageListRequestDto = {
  id_section?: number
  search?: string
  state?: number
  date_from?: string
  date_to?: string
  per_page?: number
  page?: number
}

export type SectionImageListResponseDto = {
  success: boolean
  status: number
  message: string
  data: SectionImageApiItem[]
  links: LinksPaginationType
  meta: MetaPaginationType
}

export type SectionImageJoinListResponseDto = {
  success: boolean
  status: number
  message: string
  data: SectionImageJoinApiItem[]
  links: LinksPaginationType
  meta: MetaPaginationType
}

export type SectionImageGetByIdResponseDto = {
  success: boolean
  status: number
  message: string
  data: SectionImageJoinApiItem
}
