export type SectionItemPostRequestDto = {
  id_section: number
  sectionitem_type?: string
  sectionitem_key?: string
  sectionitem_title?: string
  sectionitem_subtitle?: string
  sectionitem_description?: string
  sectionitem_label?: string
  sectionitem_value?: string
  sectionitem_suffix?: string
  sectionitem_icon?: string
  sectionitem_link?: string
  sectionitem_rating?: number
  sectionitem_variant?: string
  sectionitem_latitude?: number
  sectionitem_longitude?: number
  sectionitem_state?: number
  sectionitem_created_at: string
}

export type SectionItemPostResponseDto = {
  success: boolean
  status: number
  message: string
  data: { id_section_item: number }
  errors?: Record<string, string[]>
}
