// src/features/proformas/lib/proforma-cart/row-actions/addProductToCart.ts
import { toastError, toastSuccess } from '@/shared/lib/toast'
import { useProformaDetailFormStore } from '@/features/proforma-details'
import { usePendingCartItemsStore } from '../../../stores/usePendingCartItemsStore'
import { useCartDraftsStore } from '../../../stores/useCartDraftsStore'
import { validateNewCartItem } from './validateNewCartItem'

interface AddProductToCartProps {
  proformaId: number | null
}

/**
 * Lógica completa del botón "Agregar producto". Toma el producto del formulario directo de
 * `useCartDraftsStore` (`newItem`) — no lo recibe como parámetro.
 *
 * Antes de nada, valida con `validateNewCartItem` (producto/servicio seleccionado, cantidad y
 * precio > 0, no repetido en el carrito).
 *
 * SIN PROFORMA REGISTRADA: mete el producto en la lista temporal del carrito
 * (`usePendingCartItemsStore`), sin ninguna petición al backend.
 *
 * CON PROFORMA YA REGISTRADA: lo persiste directo contra `/proforma-details`, llamando al store
 * de creación (`useProformaDetailFormStore`) directamente.
 *
 * En ambos casos, si se agrega bien, limpia el formulario (`resetNewItem`).
 */
export async function addProductToCart(deps: AddProductToCartProps): Promise<boolean> {
  const { proformaId } = deps
  const { newItem, resetNewItem } = useCartDraftsStore.getState()

  if (!validateNewCartItem(newItem)) return false

  // SIN PROFORMA REGISTRADA — se guarda en memoria, no hay petición al backend
  if (!proformaId) {
    usePendingCartItemsStore.getState().addPendingCartItem(newItem)
    resetNewItem()
    return true
  }

  // CON PROFORMA YA REGISTRADA — se persiste directo contra el backend
  const ok = await useProformaDetailFormStore.getState().create({
    proforma_id: proformaId,
    product_service_id: newItem.productServiceId ?? undefined,
    description: newItem.description,
    unit: newItem.unit || undefined,
    quantity: newItem.quantity,
    unit_price: newItem.unitPrice,
    tax: newItem.tax,
  })

  if (ok) {
    toastSuccess('Producto agregado', newItem.description)
    resetNewItem()
  } else {
    toastError('Error', 'No se pudo agregar el producto.')
  }
  return ok
}
