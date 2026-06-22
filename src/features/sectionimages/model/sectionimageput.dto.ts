export type SectionImagePutRequestDto = {
  id_section: number
  id_image: number
  sectionimage_state: number
  sectionimage_updated_at: string
}

export type SectionImagePutResponseDto = {
  success: boolean
  status: number
  message: string
  data: { id_sectionimage: number }
  errors?: Record<string, string[]>
}
