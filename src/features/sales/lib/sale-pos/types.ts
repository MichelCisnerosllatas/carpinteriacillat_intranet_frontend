// src/features/sales/lib/sale-pos/types.ts

/** Una línea del carrito de "Realizar venta". Vive SOLO en memoria hasta que se emite la venta:
 * ya no hay líneas "guardadas" vs "pendientes", todo se manda junto en una sola petición. */
export type CartLine = {
  /** Id local para React (key) y para encontrar la línea al editarla. */
  key: string
  /** Id real de `sale_details` — solo existe al editar una venta ya guardada. En el PUT /full
   * sirve para que el backend actualice esa línea en vez de crear otra. */
  detailId: number | null
  /** null = "ítem libre" (no viene del catálogo). */
  productServiceId: number | null
  description: string
  unit: string
  quantity: number
  unitPrice: number
  /** Descuento en MONTO (no %) de toda la línea. */
  discount: number
}

/** Cliente elegido — se guarda nombre y documento para mostrarlos sin volver a buscarlo. */
export type PosClient = {
  id: number
  name: string
  document: string | null
}

/** Completo = paga todo ahora; Adelanto = paga una parte; Sin pago = queda todo como saldo. */
export type PaymentMode = 'full' | 'partial' | 'none'

/** Si la venta grava IGV y a qué tasa. Al crear sale de Configuración de Ventas (form-data);
 * al editar, de la propia venta (el IGV queda fijo desde que se creó). */
export type TaxConfig = {
  taxed: boolean
  rate: number
}

/** Producto/servicio mínimo para agregarlo al carrito (sirve tanto para lo que viene del
 * buscador como para lo que viene del modal). */
export type ProductToAdd = {
  id: number
  name: string
  unit: string | null
  default_price: number | string
}
