export type SectionPutRequestDto = {
  section_name: string
  section_title?: string
  section_description?: string
  section_content?: string
  section_state: number
  id_type_section: number
  id_navigation?: number | null
  section_updated_at: string
}

export type SectionPutResponseDto = {
  success: boolean
  status: number
  message: string
  data: { id_section: number }
  errors?: Record<string, string[]>
}
