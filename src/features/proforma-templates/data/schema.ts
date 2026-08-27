import { z } from 'zod'

export const proformaTemplateStatusSchema = z.union([z.literal('active'), z.literal('inactive')])
export type ProformaTemplateStatus = z.infer<typeof proformaTemplateStatusSchema>

export const headerLayoutSchema = z.union([z.literal('logo_izquierda'), z.literal('logo_derecha')])
export type HeaderLayout = z.infer<typeof headerLayoutSchema>

export const proformaTemplateTextSchema = z.object({
  id: z.number(),
  key: z.string(),
  title: z.string().nullable(),
  content: z.string().nullable(),
  visible: z.boolean(),
  order: z.number(),
})

// Espeja App\Enums\PdfTemplateSectionKey (backend) — las 24 keys fijas de `sections`.
export const proformaTemplateSectionsSchema = z.object({
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
})

export const proformaTemplateSchema = z.object({
  id: z.number(),
  moduleTypeId: z.number().nullable(),
  // Alias de UI sobre module_type_id: se sigue seleccionando por ProformaType.
  proformaTypeId: z.number().nullable(),
  proformaTypeName: z.string().nullable(),
  proformaTypeCode: z.string().nullable(),
  name: z.string(),

  headerBgColor: z.string(),
  headerTextColor: z.string(),
  headerTitleSize: z.number(),
  headerHeight: z.number(),
  headerLogoWidth: z.number(),
  headerLogoHeight: z.number(),
  headerLayout: headerLayoutSchema,
  headerFontFamily: z.string(),

  bodyBgColor: z.string(),
  bodyTextColor: z.string(),
  bodyBorderColor: z.string(),
  bodyFontFamily: z.string(),
  bodySubtitleSize: z.number(),
  bodyTextSize: z.number(),
  bodyTableSize: z.number(),

  footerBgColor: z.string(),
  footerTextColor: z.string(),
  footerTextSize: z.number(),
  footerFontFamily: z.string(),
  footerText: z.string().nullable(),

  sections: proformaTemplateSectionsSchema,

  status: proformaTemplateStatusSchema,
  statusLabel: z.string(),
  stateValue: z.number(),
  textsCount: z.number(),
  texts: z.array(proformaTemplateTextSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type ProformaTemplate = z.infer<typeof proformaTemplateSchema>
export type ProformaTemplateText = z.infer<typeof proformaTemplateTextSchema>
export type ProformaTemplateSections = z.infer<typeof proformaTemplateSectionsSchema>
