export type SectionItemDetailPostRequestDto = {
  id_section_item: number
  sectionitemdetail_title?: string
  sectionitemdetail_description?: string
  sectionitemdetail_state?: number
  sectionitemdetail_created_at: string
}

export type SectionItemDetailPostResponseDto = {
  success: boolean
  status: number
  message: string
  data: { id_section_item_detail: number }
  errors?: Record<string, string[]>
}
