import { z } from 'zod'

export const proformaTemplateStatusSchema = z.union([z.literal('active'), z.literal('inactive')])
export type ProformaTemplateStatus = z.infer<typeof proformaTemplateStatusSchema>

export const proformaTemplateTextSchema = z.object({
  id: z.number(),
  key: z.string(),
  title: z.string().nullable(),
  content: z.string().nullable(),
  visible: z.boolean(),
  order: z.number(),
})

export const proformaTemplateSchema = z.object({
  id: z.number(),
  proformaTypeId: z.number().nullable(),
  proformaTypeName: z.string().nullable(),
  proformaTypeCode: z.string().nullable(),
  name: z.string(),
  colorPrimary: z.string(),
  colorSecondary: z.string().nullable(),
  colorText: z.string(),
  colorBorder: z.string(),
  fontFamily: z.string(),
  titleSize: z.number(),
  subtitleSize: z.number(),
  textSize: z.number(),
  tableSize: z.number(),
  headerHeight: z.number(),
  logoWidth: z.number(),
  logoHeight: z.number(),
  showLogo: z.boolean(),
  showDate: z.boolean(),
  showCompanyData: z.boolean(),
  showBranches: z.boolean(),
  showPaymentMethod: z.boolean(),
  showBankAccounts: z.boolean(),
  showSignature: z.boolean(),
  showFooter: z.boolean(),
  footerText: z.string().nullable(),
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
