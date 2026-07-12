// src/features/proformas/lib/proforma-cart/uploadPendingItems.ts
import { toastError } from '@/shared/lib/toast'
import { useProformaDetailFormStore } from '@/features/proforma-details'
import { usePendingCartItemsStore } from '../../stores/usePendingCartItemsStore'

interface UploadPendingItemsDeps {
  proformaId: number
}

/**
 * Se dispara sola en cuanto la proforma obtiene su id real (ver el useEffect en useProformaCart).
 * Recorre `usePendingCartItemsStore().pendingCartItems` y sube al backend, uno por uno, los
 * productos que se armaron en memoria mientras la proforma no existía — llamando directo al
 * store de creación (`useProformaDetailFormStore`). Secuencial (no en paralelo) porque cada
 * creación regenera el PDF en el servidor y puede tardar. Cada producto se quita de la lista
 * temporal en cuanto se sube bien.
 */
export async function uploadPendingItems(deps: UploadPendingItemsDeps): Promise<void> {
  const { proformaId } = deps
  const tempIds = usePendingCartItemsStore.getState().pendingCartItems.map((p) => p.tempId)

  for (const tempId of tempIds) {
    const item = usePendingCartItemsStore.getState().pendingCartItems.find((p) => p.tempId === tempId)
    if (!item) continue // el usuario lo borró mientras esperaba su turno

    usePendingCartItemsStore.getState().setUploadingTempId(tempId)
    const ok = await useProformaDetailFormStore.getState().create({
      proforma_id: proformaId,
      product_service_id: item.productServiceId ?? undefined,
      description: item.description,
      unit: item.unit || undefined,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      tax: item.tax,
    })

    if (ok) {
      usePendingCartItemsStore.getState().removePendingCartItem(tempId)
    } else {
      toastError('Error', `No se pudo guardar el producto "${item.description}".`)
    }
  }

  usePendingCartItemsStore.getState().setUploadingTempId(null)
}
