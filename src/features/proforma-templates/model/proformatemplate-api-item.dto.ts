// src/features/proforma-templates/model/proformatemplate-api-item.dto.ts
// Consume el módulo genérico PdfTemplate (/v1/intranet/pdf-templates) filtrado por module="proforma".
export type PdfTemplateHeaderLayout = 'logo_izquierda' | 'logo_derecha'

export type PdfTemplateSections = {
  show_logo?: boolean
  show_date?: boolean
  show_company_data?: boolean
  show_branches?: boolean
  show_payment_method?: boolean
  show_bank_accounts?: boolean
  show_company_social_networks?: boolean
  show_company_contacts?: boolean
  show_signature?: boolean
  show_footer?: boolean
}

export type ProformaTemplateApiItem = {
  id: number
  module: string
  module_type_id: number | null
  name: string
  status: number
  header: {
    background_color: string
    text_color: string
    title_size: number
    height: number
    logo_width: number
    logo_height: number
    layout: PdfTemplateHeaderLayout
    font_family: string
  }
  body: {
    background_color: string
    text_color: string
    border_color: string
    font_family: string
    subtitle_size: number
    text_size: number
    table_size: number
  }
  footer: {
    background_color: string
    text_color: string
    text_size: number
    font_family: string
    text: string | null
  }
  sections: PdfTemplateSections | null
  created_at: string
  updated_at: string | null
}

export type ProformaTemplateJoinApiItem = ProformaTemplateApiItem & {
  texts: Array<{
    id: number
    key: string
    title: string | null
    content: string | null
    visible: boolean
    order: number
  }>
}
