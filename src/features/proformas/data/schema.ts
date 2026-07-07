import { z } from 'zod'

export const proformaStatusSchema = z.union([
  z.literal('PENDIENTE'),
  z.literal('ACEPTADA'),
  z.literal('RECHAZADA'),
  z.literal('ANULADA'),
  z.literal('VENCIDA'),
  z.literal('CONVERTIDA'),
])
export type ProformaStatus = z.infer<typeof proformaStatusSchema>

// Línea de detalle tal como viene del join (solo lectura, usada en el detalle/documento)
export const proformaDetailViewSchema = z.object({
  id: z.number(),
  productServiceId: z.number().nullable(),
  description: z.string(),
  unit: z.string().nullable(),
  quantity: z.number(),
  unitPrice: z.number(),
  subtotal: z.number(),
  tax: z.number().nullable(),
  total: z.number(),
  order: z.number().nullable(),
})
export type ProformaDetailView = z.infer<typeof proformaDetailViewSchema>

export const proformaSchema = z.object({
  id: z.number(),
  clientId: z.number().nullable(),
  clientBusinessName: z.string().nullable(),
  templateId: z.number().nullable(),
  templateName: z.string().nullable(),
  signatureId: z.number().nullable(),
  signerName: z.string().nullable(),
  proformaTypeId: z.number().nullable(),
  proformaTypeCode: z.string().nullable(),
  series: z.string(),
  correlative: z.number(),
  code: z.string(),
  issueDate: z.string(),
  dueDate: z.string().nullable(),
  placeOfIssue: z.string().nullable(),
  clientAttention: z.string().nullable(),
  clientName: z.string().nullable(),
  clientDocument: z.string().nullable(),
  clientAddress: z.string().nullable(),
  companyBusinessName: z.string().nullable(),
  companyTradeName: z.string().nullable(),
  companyTaxId: z.string().nullable(),
  companyTaxAddress: z.string().nullable(),
  companyLogo: z.string().nullable(),
  introText: z.string().nullable(),
  finalText: z.string().nullable(),
  finalGreeting: z.string().nullable(),
  paymentMethod: z.string().nullable(),
  deliveryTime: z.string().nullable(),
  subtotal: z.number(),
  tax: z.number(),
  total: z.number(),
  currency: z.string(),
  status: proformaStatusSchema,
  observation: z.string().nullable(),
  details: z.array(proformaDetailViewSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type Proforma = z.infer<typeof proformaSchema>
