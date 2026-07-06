import type { ProformaTemplateApiItem, PdfTemplateHeaderLayout, PdfTemplateSections } from './proformatemplate-api-item.dto'

export type ProformaTemplatePostRequestDto = {
  module: string
  module_type_id?: number | null
  name: string
  header_bg_color?: string
  header_text_color?: string
  header_title_size?: number
  header_height?: number
  header_logo_width?: number
  header_logo_height?: number
  header_layout?: PdfTemplateHeaderLayout
  body_bg_color?: string
  body_text_color?: string
  body_border_color?: string
  body_font_family?: string
  body_subtitle_size?: number
  body_text_size?: number
  body_table_size?: number
  footer_bg_color?: string
  footer_text_color?: string
  footer_text_size?: number
  footer_text?: string
  sections?: PdfTemplateSections
  status?: number
}

export type ProformaTemplatePostResponseDto = {
  success: boolean
  status: number
  message: string
  data: ProformaTemplateApiItem
  errors?: Record<string, string[]>
}
