import { z } from 'zod'

export const saleStatusSchema = z.union([
  z.literal('GUARDADA'),
  z.literal('EMITIDA'),
  z.literal('ANULADA'),
])
export type SaleStatus = z.infer<typeof saleStatusSchema>

export const salePaymentStatusSchema = z.union([
  z.literal('PENDIENTE'),
  z.literal('PARCIAL'),
  z.literal('PAGADO'),
])
export type SalePaymentStatus = z.infer<typeof salePaymentStatusSchema>

// Línea de detalle tal como viene del join (solo lectura, usada en el detalle/documento)
export const saleDetailViewSchema = z.object({
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
export type SaleDetailView = z.infer<typeof saleDetailViewSchema>

// Pago tal como viene del join — de solo lectura por ahora (ver TODO(sale-payments) en
// sale-detail.tsx, se reemplaza por un CRUD interactivo en un paso posterior).
export const salePaymentViewSchema = z.object({
  id: z.number(),
  amount: z.number(),
  paymentDate: z.string(),
  paymentMethod: z.string().nullable(),
  observation: z.string().nullable(),
})
export type SalePaymentView = z.infer<typeof salePaymentViewSchema>

export const saleSchema = z.object({
  id: z.number(),
  clientId: z.number().nullable(),
  clientBusinessName: z.string().nullable(),
  saleDocumentTypeId: z.number().nullable(),
  saleDocumentTypeName: z.string().nullable(),
  saleDocumentTypeCode: z.string().nullable(),
  series: z.string(),
  correlative: z.number(),
  code: z.string(),
  issueDate: z.string(),
  // Ya vienen formateadas desde el backend — usarlas en la UI en vez de formatear las fechas
  // ISO en el propio front (mismo criterio que proformas).
  issueDateFormatted: z.string().nullable(),
  dueDate: z.string().nullable(),
  dueDateFormatted: z.string().nullable(),
  isTaxed: z.boolean(),
  igvRateApplied: z.number().nullable(),
  paymentMethod: z.string().nullable(),
  subtotal: z.number(),
  tax: z.number(),
  total: z.number(),
  amountPaid: z.number(),
  balance: z.number(),
  paymentStatus: salePaymentStatusSchema,
  currency: z.string(),
  status: saleStatusSchema,
  observation: z.string().nullable(),
  details: z.array(saleDetailViewSchema),
  payments: z.array(salePaymentViewSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type Sale = z.infer<typeof saleSchema>
