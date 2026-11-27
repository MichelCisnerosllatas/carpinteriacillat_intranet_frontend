// src/features/sale-payments/data/data.ts

// Lista FIJA de métodos de pago (contrato §2). El backend valida `payment_method` con
// `Rule::in(...)`, así que el front solo puede ofrecer estos valores — nunca texto libre.
export const SALE_PAYMENT_METHODS = [
  { value: 'EFECTIVO', label: 'Efectivo' },
  { value: 'YAPE', label: 'Yape' },
  { value: 'PLIN', label: 'Plin' },
  { value: 'TRANSFERENCIA', label: 'Transferencia' },
  { value: 'TARJETA', label: 'Tarjeta' },
  { value: 'OTRO', label: 'Otro' },
] as const

export type SalePaymentMethod = (typeof SALE_PAYMENT_METHODS)[number]['value']

/** Etiqueta legible de un método. Los pagos antiguos pueden traer texto libre ("Contado"...),
 * por eso si no está en la lista se devuelve tal cual en vez de esconderlo. */
export const getSalePaymentMethodLabel = (value: string | null | undefined): string => {
  if (!value) return 'Pago'
  return SALE_PAYMENT_METHODS.find((m) => m.value === value)?.label ?? value
}
