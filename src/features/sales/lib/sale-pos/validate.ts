// src/features/sales/lib/sale-pos/validate.ts
import { calculateLine, round2, type CartTotals } from './calculate'
import type { CartLine, PaymentMode, PosClient, TaxConfig } from './types'

export type PosValidationInput = {
  isEdit: boolean
  client: PosClient | null
  isGenericClient: boolean
  /** true si el comprobante elegido es factura (code "01") — exige cliente. */
  isInvoice: boolean
  documentTypeId: number | null
  issueDate: string
  lines: CartLine[]
  taxConfig: TaxConfig
  totals: CartTotals
  paymentMode: PaymentMode
  paymentAmount: number
  paymentMethod: string | null
}

/**
 * Valida en el front lo mismo que valida el backend, para avisar ANTES de enviar. Las claves
 * son las mismas que usaría Laravel en un 422 ("client_id", "details.0.discount", "payments"...)
 * así la pantalla pinta igual un error local que uno del servidor.
 */
export function validatePosSale(input: PosValidationInput): Record<string, string> {
  const errors: Record<string, string> = {}

  if (input.isInvoice && !input.client) {
    errors.client_id = 'La factura requiere un cliente.'
  } else if (!input.client && !input.isGenericClient) {
    errors.client_id = 'Elige un cliente o "Cliente varios".'
  }

  if (!input.documentTypeId) errors.sale_document_type_id = 'Elige el tipo de comprobante.'
  if (!input.issueDate) errors.issue_date = 'La fecha es requerida.'

  if (input.lines.length === 0) {
    errors.details = 'Agrega al menos un producto o servicio.'
  }

  input.lines.forEach((line, i) => {
    if (!line.description.trim()) errors[`details.${i}.description`] = 'Escribe una descripción.'
    if (!(line.quantity > 0)) errors[`details.${i}.quantity`] = 'La cantidad debe ser mayor a 0.'
    if (line.unitPrice < 0) errors[`details.${i}.unit_price`] = 'El precio no puede ser negativo.'
    const { gross } = calculateLine(line, input.taxConfig)
    if (line.discount < 0 || round2(line.discount) > gross) {
      errors[`details.${i}.discount`] = 'El descuento no puede ser mayor al importe de la línea.'
    }
  })

  // En edición los pagos van por la sección de pagos existente, no por esta pantalla.
  if (!input.isEdit && input.paymentMode !== 'none') {
    if (input.paymentMode === 'partial') {
      if (!(input.paymentAmount > 0)) {
        errors.payments = 'Ingresa el monto del adelanto.'
      } else if (round2(input.paymentAmount) > input.totals.total) {
        errors.payments = 'Los pagos superan el total de la venta.'
      }
    }
    if (!input.paymentMethod) errors.payment_method = 'Elige el método de pago.'
  }

  return errors
}
