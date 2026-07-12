// src/features/proformas/lib/proforma-cart/row-actions/validateNewCartItem.ts
import { toastError } from '@/shared/lib/toast'
import { useProformaDetailListStore } from '@/features/proforma-details'
import { usePendingCartItemsStore } from '../../../stores/usePendingCartItemsStore'
import type { CartItem } from '../types'

/**
 * Valida el producto del formulario "Agregar producto" antes de agregarlo al carrito:
 * - debe tener un producto/servicio del catálogo seleccionado (no basta con escribir la
 *   descripción a mano — así no se puede colar un producto sin id real);
 * - la cantidad y el precio unitario deben ser mayores a 0;
 * - ese mismo producto/servicio no debe estar ya en el carrito (ni guardado, ni pendiente).
 *
 * Devuelve true si pasa todas las validaciones; si no, muestra el toast correspondiente y
 * devuelve false.
 */
export function validateNewCartItem(newItem: CartItem): boolean {
  if (!newItem.productServiceId) {
    toastError('Falta el producto/servicio', 'Selecciona uno del catálogo — no basta con escribir la descripción.')
    return false
  }

  if (!newItem.description.trim()) {
    toastError('Falta la descripción', 'Escribe una descripción para el producto.')
    return false
  }

  if (newItem.quantity <= 0) {
    toastError('Cantidad inválida', 'La cantidad debe ser mayor a 0.')
    return false
  }

  if (newItem.unitPrice <= 0) {
    toastError('Precio inválido', 'El precio unitario debe ser mayor a 0.')
    return false
  }

  const alreadyInCart = [
    ...useProformaDetailListStore.getState().items,
    ...usePendingCartItemsStore.getState().pendingCartItems,
  ].some((item) => item.productServiceId === newItem.productServiceId)

  if (alreadyInCart) {
    toastError('Producto repetido', 'Ese producto/servicio ya está en el carrito.')
    return false
  }

  return true
}
