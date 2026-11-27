export type SectionItemPutRequestDto = {
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
  /** Config técnica de este item (`section_web_setting`, 1 a 1) — ver `section-item-settings-form.tsx`. */
  tab_info?: boolean
  tab_details?: boolean
  details_add?: boolean
  details_reorder?: boolean
  details_delete?: boolean
  sectionitem_state: number
  sectionitem_updated_at: string
}

export type SectionItemPutResponseDto = {
  success: boolean
  status: number
  message: string
  data: { id_section_item: number }
  errors?: Record<string, string[]>
}
