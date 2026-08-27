import { z } from 'zod'
import { headerLayoutSchema } from '../../data/schema'
import { PDF_TEMPLATE_MODULE } from '../../data/data'
import type { ProformaTemplatePostRequestDto } from '../../model/proformatemplatepost.dto'

const HEX_COLOR_REGEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/

const requiredHexColor = (label: string) =>
  z
    .string()
    .min(1, `${label} es requerido.`)
    .regex(HEX_COLOR_REGEX, `${label} debe ser un color hexadecimal válido (ej: #243FC4).`)

const requiredPositiveSize = (label: string) => z.number().min(1, `${label} debe ser mayor a 0.`)

export const proformaTemplateFormSchema = z.object({
  moduleTypeId: z.number().nullable(),
  name: z.string().min(1, 'El nombre es requerido.').max(150),

  headerBgColor: requiredHexColor('El color de fondo del encabezado'),
  headerTextColor: requiredHexColor('El color de texto del encabezado'),
  headerTitleSize: requiredPositiveSize('El tamaño del título'),
  headerHeight: requiredPositiveSize('El alto del encabezado'),
  headerLogoWidth: requiredPositiveSize('El ancho del logo'),
  headerLogoHeight: requiredPositiveSize('El alto del logo'),
  headerLayout: headerLayoutSchema,
  headerFontFamily: z.string().min(1, 'La tipografía es requerida.'),

  bodyBgColor: requiredHexColor('El color de fondo del cuerpo'),
  bodyTextColor: requiredHexColor('El color de texto del cuerpo'),
  bodyBorderColor: requiredHexColor('El color de borde'),
  bodyFontFamily: z.string().min(1, 'La tipografía es requerida.'),
  bodySubtitleSize: requiredPositiveSize('El tamaño del subtítulo'),
  bodyTextSize: requiredPositiveSize('El tamaño del texto'),
  bodyTableSize: requiredPositiveSize('El tamaño de la tabla'),

  footerBgColor: requiredHexColor('El color de fondo del pie de página'),
  footerTextColor: requiredHexColor('El color de texto del pie de página'),
  footerTextSize: requiredPositiveSize('El tamaño del texto del pie de página'),
  footerFontFamily: z.string().min(1, 'La tipografía es requerida.'),
  footerText: z.string().max(255).optional(),

  showLogo: z.boolean(),
  showDate: z.boolean(),
  showCompanyName: z.boolean(),

  showClientName: z.boolean(),
  showClientDocument: z.boolean(),
  showClientAddress: z.boolean(),
  showClientAttention: z.boolean(),

  showIntroText: z.boolean(),
  showItemsTable: z.boolean(),
  showSummaryTotal: z.boolean(),
  showDeliveryTime: z.boolean(),
  showAdditionalNotes: z.boolean(),

  showCompanyData: z.boolean(),
  showCompanyTaxId: z.boolean(),
  showCompanyAddress: z.boolean(),
  showCompanyBusinessName: z.boolean(),
  showCompanySocialNetworks: z.boolean(),
  showCompanyContacts: z.boolean(),

  showBranches: z.boolean(),
  showPaymentMethod: z.boolean(),
  showBankAccounts: z.boolean(),

  showFinalText: z.boolean(),
  showFinalGreeting: z.boolean(),
  showSignature: z.boolean(),
  showFooter: z.boolean(),

  status: z.number(),
})

export type ProformaTemplateFormValues = z.infer<typeof proformaTemplateFormSchema>

// Valores por defecto de una plantilla nueva.
export const proformaTemplateFormDefaults: ProformaTemplateFormValues = {
  moduleTypeId: null,
  name: '',

  headerBgColor: '#243FC4',
  headerTextColor: '#FFFFFF',
  headerTitleSize: 20,
  headerHeight: 30,
  headerLogoWidth: 15,
  headerLogoHeight: 15,
  headerLayout: 'logo_derecha',
  headerFontFamily: 'Arial',

  bodyBgColor: '#FFFFFF',
  bodyTextColor: '#1F2937',
  bodyBorderColor: '#D1D5DB',
  bodyFontFamily: 'Arial',
  bodySubtitleSize: 12,
  bodyTextSize: 11,
  bodyTableSize: 10,

  footerBgColor: '#243FC4',
  footerTextColor: '#FFFFFF',
  footerTextSize: 9,
  footerFontFamily: 'Arial',
  footerText: '',

  showLogo: true,
  showDate: true,
  showCompanyName: true,

  showClientName: true,
  showClientDocument: true,
  showClientAddress: true,
  showClientAttention: true,

  showIntroText: true,
  showItemsTable: true,
  showSummaryTotal: true,
  showDeliveryTime: true,
  showAdditionalNotes: true,

  showCompanyData: true,
  showCompanyTaxId: true,
  showCompanyAddress: true,
  showCompanyBusinessName: true,
  showCompanySocialNetworks: true,
  showCompanyContacts: true,

  showBranches: true,
  showPaymentMethod: true,
  showBankAccounts: true,

  showFinalText: true,
  showFinalGreeting: true,
  showSignature: true,
  showFooter: true,

  status: 1,
}

export const toProformaTemplatePayload = (
  values: ProformaTemplateFormValues
): ProformaTemplatePostRequestDto => ({
  module: PDF_TEMPLATE_MODULE,
  module_type_id: values.moduleTypeId,
  name: values.name,
  header_bg_color: values.headerBgColor,
  header_text_color: values.headerTextColor,
  header_title_size: values.headerTitleSize,
  header_height: values.headerHeight,
  header_logo_width: values.headerLogoWidth,
  header_logo_height: values.headerLogoHeight,
  header_layout: values.headerLayout,
  header_font_family: values.headerFontFamily,
  body_bg_color: values.bodyBgColor,
  body_text_color: values.bodyTextColor,
  body_border_color: values.bodyBorderColor,
  body_font_family: values.bodyFontFamily,
  body_subtitle_size: values.bodySubtitleSize,
  body_text_size: values.bodyTextSize,
  body_table_size: values.bodyTableSize,
  footer_bg_color: values.footerBgColor,
  footer_text_color: values.footerTextColor,
  footer_text_size: values.footerTextSize,
  footer_font_family: values.footerFontFamily,
  footer_text: values.footerText || undefined,
  sections: {
    show_logo: values.showLogo,
    show_date: values.showDate,
    show_company_name: values.showCompanyName,

    show_client_name: values.showClientName,
    show_client_document: values.showClientDocument,
    show_client_address: values.showClientAddress,
    show_client_attention: values.showClientAttention,

    show_intro_text: values.showIntroText,
    show_items_table: values.showItemsTable,
    show_summary_total: values.showSummaryTotal,
    show_delivery_time: values.showDeliveryTime,
    show_additional_notes: values.showAdditionalNotes,

    show_company_data: values.showCompanyData,
    show_company_tax_id: values.showCompanyTaxId,
    show_company_address: values.showCompanyAddress,
    show_company_business_name: values.showCompanyBusinessName,
    show_company_social_networks: values.showCompanySocialNetworks,
    show_company_contacts: values.showCompanyContacts,

    show_branches: values.showBranches,
    show_payment_method: values.showPaymentMethod,
    show_bank_accounts: values.showBankAccounts,

    show_final_text: values.showFinalText,
    show_final_greeting: values.showFinalGreeting,
    show_signature: values.showSignature,
    show_footer: values.showFooter,
  },
  status: values.status,
})

// Para POST /proformas/pdf-preview-style: mismos campos de estilo, sin module/module_type_id/name/status
// (ese endpoint no identifica ni crea ninguna plantilla, ver proformas.md).
export const toProformaTemplateStylePayload = (
  values: ProformaTemplateFormValues
): Record<string, unknown> => {
  const { module, module_type_id, name, status, ...style } = toProformaTemplatePayload(values)
  return style
}
