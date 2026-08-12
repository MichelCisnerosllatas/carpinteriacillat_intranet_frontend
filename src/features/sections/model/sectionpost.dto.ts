export type SectionPostRequestDto = {
  section_name: string
  section_title?: string
  section_description?: string
  section_content?: string
  section_state: number
  id_typesection: number
  id_navigation?: number | null
  section_created_at: string
}

export type SectionPostResponseDto = {
  success: boolean
  status: number
  message: string
  data: { id_section: number }
  errors?: Record<string, string[]>
}
