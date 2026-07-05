import type { ProformaTemplateApiItem } from './proformatemplate-api-item.dto'

export type ProformaTemplatePostRequestDto = {
  proforma_type_id?: number | null
  name: string
  color_primary?: string
  color_secondary?: string
  color_text?: string
  color_border?: string
  font_family?: string
  title_size?: number
  subtitle_size?: number
  text_size?: number
  table_size?: number
  header_height?: number
  logo_width?: number
  logo_height?: number
  show_logo?: number
  show_date?: number
  show_company_data?: number
  show_branches?: number
  show_payment_method?: number
  show_bank_accounts?: number
  show_signature?: number
  show_footer?: number
  footer_text?: string
  status?: number
}

export type ProformaTemplatePostResponseDto = {
  success: boolean
  status: number
  message: string
  data: ProformaTemplateApiItem
  errors?: Record<string, string[]>
}
