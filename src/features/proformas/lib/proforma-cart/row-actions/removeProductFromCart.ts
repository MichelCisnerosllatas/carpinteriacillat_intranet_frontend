// src/features/proformas/lib/proforma-cart/row-actions/removeProductFromCart.ts
import { swalDeleteConfirm } from '@/shared/lib/swal'
import { toastSuccess } from '@/shared/lib/toast'
import { useProformaDetailDeleteStore, type ProformaDetail } from '@/features/proforma-details'
import { usePendingCartItemsStore } from '../../../stores/usePendingCartItemsStore'

interface RemoveProductFromCartDeps {
  proformaId: number | null
  /** Fila ya guardada en el backend (de `savedItems`) — pásala cuando el producto YA existe ahí. */
  savedRow?: ProformaDetail
  /** tempId de un producto pendiente (de `pendingCartItems`) — pásalo cuando SOLO vive en memoria. */
  pendingTempId?: string
}

/**
 * Lógica completa del botón de eliminar (🗑) un producto del carrito, sea cual sea su estado:
 *
 * PENDIENTE (sin proforma registrada todavía, en `usePendingCartItemsStore`): se quita directo de
 * la lista en memoria — sin confirmación ni petición al backend, porque nunca se guardó.
 *
 * GUARDADO (ya persistido en `/proforma-details`): confirma con el usuario y borra en el backend,
 * llamando directo al store de borrado (`useProformaDetailDeleteStore`).
 */
export async function removeProductFromCart(deps: RemoveProductFromCartDeps): Promise<void> {
  const { proformaId, savedRow, pendingTempId } = deps

  // PENDIENTE
  if (pendingTempId) {
    usePendingCartItemsStore.getState().removePendingCartItem(pendingTempId)
    return
  }

  // GUARDADO
  if (!savedRow || !proformaId) return

  await swalDeleteConfirm(
    `¿Eliminar el producto "${savedRow.description}"?`, 'Esta acción no se puede deshacer.',
    async ({ close, showError }) => {
      const ok = await useProformaDetailDeleteStore.getState().deleteItem(savedRow.id, proformaId)
      if (ok) {
        toastSuccess('Producto eliminado', savedRow.description)
        close()
      } else {
        showError('No se pudo eliminar el producto.')
      }
    },
    { title: 'Eliminando...' }
  )
}
