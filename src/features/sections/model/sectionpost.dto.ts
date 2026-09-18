export type SectionPostRequestDto = {
  section_name?: string
  section_title?: string
  section_subtitle?: string
  section_description?: string
  section_content?: string
  section_variant?: string
  /** Config técnica de esta sección (`sections_web_settings`, 1 a 1) — ver `section-form.tsx`. */
  tab_images?: boolean
  tab_buttons?: boolean
  tab_items?: boolean
  images_add?: boolean
  images_reorder?: boolean
  images_delete?: boolean
  buttons_add?: boolean
  buttons_reorder?: boolean
  buttons_delete?: boolean
  items_add?: boolean
  items_reorder?: boolean
  items_delete?: boolean
  section_state: number
  id_type_section: number
  id_navigation: number
  section_created_at: string
}

export type SectionPostResponseDto = {
  success: boolean
  status: number
  message: string
  data: { id_section: number }
  errors?: Record<string, string[]>
}
