// src/features/proformas/lib/proforma-cart/row-actions/saveEditedCartItem.ts
import { toastError, toastSuccess } from '@/shared/lib/toast'
import { useProformaDetailFormStore, type ProformaDetail } from '@/features/proforma-details'
import type { CartItem } from '../types'

interface SaveEditedCartItemDeps {
  row: ProformaDetail
  proformaId: number
  values: CartItem
}

/**
 * Lógica completa del botón "guardar" (✓) de un producto ya guardado que se está editando.
 * Llama directo al store de edición (`useProformaDetailFormStore`) — no lo recibe como parámetro.
 * Devuelve true/false para que el botón sepa si debe quitar la fila del modo edición.
 */
export async function saveEditedCartItem(deps: SaveEditedCartItemDeps): Promise<boolean> {
  const { row, proformaId, values } = deps
  const ok = await useProformaDetailFormStore.getState().update(row.id, {
    proforma_id: proformaId,
    product_service_id: values.productServiceId ?? undefined,
    description: values.description,
    unit: values.unit || undefined,
    quantity: values.quantity,
    unit_price: values.unitPrice,
    tax: values.tax,
  })

  if (ok) {
    toastSuccess('Producto actualizado', values.description)
  } else {
    toastError('Error', 'No se pudo actualizar el producto.')
  }
  return ok
}
