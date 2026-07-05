// src/features/proforma-templates/model/proformatemplate-api-item.dto.ts
export type ProformaTemplateApiItem = {
  id: number
  proforma_type_id: number | null
  name: string
  color_primary: string
  color_secondary: string | null
  color_text: string
  color_border: string
  font_family: string
  title_size: number
  subtitle_size: number
  text_size: number
  table_size: number
  header_height: number
  logo_width: number
  logo_height: number
  show_logo: boolean
  show_date: boolean
  show_company_data: boolean
  show_branches: boolean
  show_payment_method: boolean
  show_bank_accounts: boolean
  show_signature: boolean
  show_footer: boolean
  footer_text: string | null
  status: number
  created_at: string
  updated_at: string | null
}

export type ProformaTemplateJoinApiItem = ProformaTemplateApiItem & {
  proforma_type: {
    id: number
    code: string | null
    name: string
  } | null

  texts: Array<{
    id: number
    key: string
    title: string | null
    content: string | null
    visible: boolean
    order: number
  }>
}
