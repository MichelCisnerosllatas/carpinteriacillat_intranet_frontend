// src/features/sales/lib/sale-pos/build-payload.ts
import { round2, todayLocal } from './calculate'
import type { CartLine, PaymentMode, PosClient } from './types'
import type {
  SaleFullDetailDto,
  SaleFullPaymentDto,
  SaleFullPostRequestDto,
  SaleFullPutRequestDto,
} from '../../model/salefull.dto'

type PayloadInput = {
  client: PosClient | null
  documentTypeId: number
  issueDate: string
  currency: string
  observation: string
  proformaId: number | null
  lines: CartLine[]
  paymentMode: PaymentMode
  paymentAmount: number
  paymentMethod: string | null
  /** Vendedor a asignar — null = no se manda y el backend usa al usuario autenticado. */
  sellerId: number | null
  /** Total calculado en pantalla — en "Completo" se paga exactamente esto. */
  total: number
}

/** Líneas en el formato del backend. `withIds` solo en edición: así el PUT sabe qué línea
 * actualizar y cuál es nueva. */
function buildDetails(lines: CartLine[], withIds: boolean): SaleFullDetailDto[] {
  return lines.map((l) => ({
    ...(withIds && l.detailId ? { id: l.detailId } : {}),
    product_service_id: l.productServiceId,
    description: l.description.trim(),
    unit: l.unit.trim() || null,
    quantity: l.quantity,
    unit_price: l.unitPrice,
    discount: round2(l.discount || 0),
  }))
}

function buildPayments(input: PayloadInput): SaleFullPaymentDto[] {
  if (input.paymentMode === 'none' || !input.paymentMethod) return []
  const amount = input.paymentMode === 'full' ? input.total : round2(input.paymentAmount)
  if (amount <= 0) return []
  // El pago se registra con la fecha de hoy (cuándo entró el dinero), no con la de emisión.
  return [
    { amount, payment_date: todayLocal(), payment_method: input.paymentMethod, observation: null },
  ]
}

/** Body de POST /sales/full — siempre se emite (status EMITIDA). */
export function buildCreatePayload(input: PayloadInput): SaleFullPostRequestDto {
  return {
    client_id: input.client?.id ?? null,
    sale_document_type_id: input.documentTypeId,
    issue_date: input.issueDate,
    currency: input.currency,
    ...(input.sellerId ? { user_id: input.sellerId } : {}),
    observation: input.observation.trim() || undefined,
    ...(input.proformaId ? { proforma_id: input.proformaId } : {}),
    status: 'EMITIDA',
    details: buildDetails(input.lines, false),
    payments: buildPayments(input),
  }
}

/** Body de PUT /sales/{id}/full. `emit` = true lo pasa a EMITIDA; false solo guarda cambios. */
export function buildUpdatePayload(input: PayloadInput, emit: boolean): SaleFullPutRequestDto {
  return {
    client_id: input.client?.id ?? null,
    sale_document_type_id: input.documentTypeId,
    issue_date: input.issueDate,
    currency: input.currency,
    ...(input.sellerId ? { user_id: input.sellerId } : {}),
    observation: input.observation.trim() || undefined,
    ...(emit ? { status: 'EMITIDA' as const } : {}),
    details: buildDetails(input.lines, true),
  }
}
