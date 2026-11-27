export type SectionButtonPutRequestDto = {
  id_section: number
  sectionbutton_label: string
  sectionbutton_url?: string
  sectionbutton_icon?: string
  sectionbutton_variant?: string
  sectionbutton_state: number
  sectionbutton_updated_at: string
}

export type SectionButtonPutResponseDto = {
  success: boolean
  status: number
  message: string
  data: { id_section_button: number }
  errors?: Record<string, string[]>
}
