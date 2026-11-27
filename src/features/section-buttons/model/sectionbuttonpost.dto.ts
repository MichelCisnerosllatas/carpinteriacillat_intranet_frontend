export type SectionButtonPostRequestDto = {
  id_section: number
  sectionbutton_label: string
  sectionbutton_url?: string
  sectionbutton_icon?: string
  sectionbutton_variant?: string
  sectionbutton_state?: number
  sectionbutton_created_at: string
}

export type SectionButtonPostResponseDto = {
  success: boolean
  status: number
  message: string
  data: { id_section_button: number }
  errors?: Record<string, string[]>
}
