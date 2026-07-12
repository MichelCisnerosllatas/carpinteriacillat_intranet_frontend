// src/features/proformas/lib/proforma-cart/autofillFromProductService.ts
import type { CartItem, ProductServiceOption } from './types'

/** Autocompleta descripción/unidad/precio a partir del producto/servicio elegido del catálogo —
 * sin pisar una descripción que el usuario ya haya escrito a mano. */
export function autofillFromProductService<T extends CartItem>(
  item: T,
  picked: ProductServiceOption | undefined,
  productServiceId: number | null
): T {
  return {
    ...item,
    productServiceId,
    description: picked && !item.description ? picked.name : item.description,
    unit: picked?.unit ?? item.unit,
    unitPrice: picked ? Number(picked.default_price) : item.unitPrice,
  }
}
