export type SectionImagePutRequestDto = {
  id_section: number
  id_image: number
  sectionimage_fix?: string | null
  sectionimage_title?: string | null
  sectionimage_description?: string | null
  sectionimage_label?: string | null
  sectionimage_link?: string | null
  sectionimage_link_label?: string | null
  sectionimage_variant?: string | null
  /** Debe ser un item de la misma sección (lo valida el backend). */
  id_section_item?: number | null
  sectionimage_state: number
  sectionimage_updated_at: string
}

export type SectionImagePutResponseDto = {
  success: boolean
  status: number
  message: string
  data: { id_section_image: number }
  errors?: Record<string, string[]>
}
