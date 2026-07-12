// src/features/proformas/lib/proforma-cart/types.ts

/** Un producto/servicio del carrito — sin importar si ya está guardado en el backend o no. */
export type CartItem = {
  productServiceId: number | null
  description: string
  unit: string
  quantity: number
  unitPrice: number
  tax: number
}

/** Un producto agregado ANTES de que la proforma tenga id — solo vive en memoria, todavía no
 * tiene un id real del backend, por eso usa un `tempId` propio para identificarlo en pantalla. */
export type PendingCartItem = CartItem & { tempId: string }

export const emptyCartItem: CartItem = {
  productServiceId: null, description: '', unit: '', quantity: 1, unitPrice: 0, tax: 0,
}

/** Forma mínima de un producto/servicio del catálogo — lo necesario para autocompletar. */
export type ProductServiceOption = {
  id: number
  name: string
  unit: string | null
  default_price: number | string
}

export type CartTotals = { subtotal: number; tax: number; total: number }
