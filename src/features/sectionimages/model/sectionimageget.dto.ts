import type { LinksPaginationType } from '@/shared/type/linksPagination.type'
import type { MetaPaginationType } from '@/shared/type/metaPagination.type'

export type SectionImageApiItem = {
  id_section_image: number
  id_section: number
  id_image: number
  sectionimage_fix: string | null
  // Textos opcionales que acompañan a la foto en el sitio (pie, categoría, botón, etc.)
  sectionimage_title: string | null
  sectionimage_description: string | null
  sectionimage_label: string | null
  sectionimage_link: string | null
  sectionimage_link_label: string | null
  sectionimage_variant: string | null
  /** Item de la sección al que pertenece la foto (ej. cada servicio del hero) — null = de la sección. */
  id_section_item: number | null
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
  section: {
    id_section: number
    section_name: string
    /** Página (navegación) a la que pertenece la sección — para el encabezado "Servicios › Hero...". */
    navigation?: { id_navigation: number; navigation_name: string } | null
  }
  // El endpoint `_join` devuelve `image_patch` (ruta relativa de storage), no una URL absoluta
  // — hay que resolverla con `buildImageUrl()` antes de usarla en un <img>.
  image: { id_image: number; image_name: string; image_patch: string }
  /** Item al que está asignada la foto (solo en `_join`). */
  section_item?: { id_section_item: number; sectionitem_title: string | null } | null
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
