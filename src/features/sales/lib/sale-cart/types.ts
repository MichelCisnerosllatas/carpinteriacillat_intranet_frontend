// src/features/sales/lib/sale-cart/types.ts

// Sin campo `tax` — a diferencia de proforma-cart/types.ts, sale-details NUNCA acepta un tax
// editable por el cliente, siempre lo calcula el servidor (ver sale-details.md).
/** Un producto/servicio del carrito — sin importar si ya está guardado en el backend o no. */
export type CartItem = {
  productServiceId: number | null
  description: string
  unit: string
  quantity: number
  unitPrice: number
}

/** Un producto agregado ANTES de que la venta tenga id — solo vive en memoria, todavía no
 * tiene un id real del backend, por eso usa un `tempId` propio para identificarlo en pantalla. */
export type PendingCartItem = CartItem & { tempId: string }

export const emptyCartItem: CartItem = {
  productServiceId: null, description: '', unit: '', quantity: 1, unitPrice: 0,
}

/** Forma mínima de un producto/servicio del catálogo — lo necesario para autocompletar. */
export type ProductServiceOption = {
  id: number
  name: string
  unit: string | null
  default_price: number | string
}

/**
 * Si ya se sabe si la venta va a gravar IGV (y a qué tasa — ver header-section.tsx, que lo
 * resuelve a partir del campo "¿Grava IGV?" + `sale-settings`), se puede proyectar el impuesto
 * de los ítems pendientes con confianza en vez de mostrar un "no sé todavía". `willBeTaxed: null`
 * = todavía no se sabe (ej. la configuración de ventas sigue cargando).
 */
export type CartTaxPreview = {
  willBeTaxed: boolean | null
  rate: number
}

export type CartTotals = {
  subtotal: number
  tax: number
  total: number
  /** true solo cuando NO se sabe todavía si la venta va a gravar IGV (sin `taxPreview`, o con
   * `willBeTaxed: null`) — ahí sí el `tax` mostrado es incompleto y la UI debe avisarlo. Si se
   * sabe la respuesta (aunque sea "no grava"), este flag queda en `false` y el total ya es el
   * definitivo, sin asteriscos. */
  hasPendingTax: boolean
}
