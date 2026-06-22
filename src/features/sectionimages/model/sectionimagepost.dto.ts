export type SectionImagePostRequestDto = {
  id_section: number
  id_image: number
  sectionimage_state: number
  sectionimage_created_at: string
}

export type SectionImagePostResponseDto = {
  success: boolean
  status: number
  message: string
  data: { id_sectionimage: number }
  errors?: Record<string, string[]>
}
