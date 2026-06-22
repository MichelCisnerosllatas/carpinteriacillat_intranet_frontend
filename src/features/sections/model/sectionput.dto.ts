export type SectionPutRequestDto = {
  section_name: string
  section_description?: string
  section_state: number
  id_typesection: number
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
