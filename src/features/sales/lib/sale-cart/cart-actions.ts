// src/features/sales/lib/sale-cart/cart-actions.ts
//
// Todas las acciones del carrito de líneas de una venta, en un solo archivo — antes vivían en
// 11 archivos separados bajo `row-actions/` (uno por columna editable + uno por acción), lo cual
// hacía difícil seguir el flujo completo de "agregar/editar/quitar un producto". Se agrupan acá
// porque todas operan sobre las mismas 3 piezas de estado (`useCartDraftsStore`,
// `usePendingCartItemsStore`, `useSaleDetailListStore`/`useSaleDetailFormStore`) y ninguna es lo
// bastante grande como para justificar su propio archivo.
//
// Regla de negocio que atraviesa TODO este archivo: `tax` NUNCA se envía al backend — lo calcula
// siempre el servidor a partir de `sale.igv_rate_applied` (ver sale-details.md). Es la diferencia
// clave frente a `proforma-cart`, cuyo `CartItem` sí incluye un `tax` editable por el cliente.

import { toastError, toastSuccess } from '@/shared/lib/toast'
import { swalDeleteConfirm } from '@/shared/lib/swal'
import { useProductServiceSelectStore } from '@/features/products-services'
import {
  saleDetailsService,
  useSaleDetailFormStore,
  useSaleDetailListStore,
  type SaleDetail,
} from '@/features/sale-details'
import { useCartDraftsStore } from '../../stores/useCartDraftsStore'
import { usePendingCartItemsStore } from '../../stores/usePendingCartItemsStore'
import type { CartItem, ProductServiceOption } from './types'

// ── Helpers de lectura/autocompletado ──────────────────────────────────────────────────────────

/** Valor actual de una fila ya guardada: si tiene una edición en curso (en `useCartDraftsStore`),
 * esa; si no, el valor tal cual vino del backend. Sin `tax` — ese campo es de solo lectura, se
 * lee directo de `row.tax`, nunca de este `CartItem` editable. */
export function getSavedItemValue(row: SaleDetail, savedItemEdits: Record<number, CartItem>): CartItem {
  return savedItemEdits[row.id] ?? {
    productServiceId: row.productServiceId,
    description: row.description,
    unit: row.unit ?? '',
    quantity: row.quantity,
    unitPrice: row.unitPrice,
  }
}

/** Autocompleta descripción/unidad/precio a partir del producto/servicio elegido del catálogo —
 * sin pisar una descripción que el usuario ya haya escrito a mano. */
function autofillFromProductService<T extends CartItem>(
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

// ── Edición de un campo de una fila (nueva / guardada / pendiente) ────────────────────────────

interface FieldChangeDeps {
  savedRow?: SaleDetail
  pendingTempId?: string
}

/** Helper interno compartido por los 4 `updateXField` de abajo — el branching por
 * nuevo/guardado/pendiente es igual para las 4 columnas, solo cambia qué campo se escribe. */
function applyCartItemFieldChange(deps: FieldChangeDeps & { field: keyof CartItem; value: CartItem[keyof CartItem] }) {
  const { field, value, savedRow, pendingTempId } = deps

  if (savedRow) {
    const { savedItemEdits, setSavedItemEdit } = useCartDraftsStore.getState()
    const current = getSavedItemValue(savedRow, savedItemEdits)
    setSavedItemEdit(savedRow.id, { ...current, [field]: value })
    return
  }

  if (pendingTempId) {
    usePendingCartItemsStore.getState().updatePendingCartItem(pendingTempId, { [field]: value })
    return
  }

  const { newItem, setNewItem } = useCartDraftsStore.getState()
  setNewItem({ ...newItem, [field]: value })
}

export function updateDescriptionField(deps: FieldChangeDeps & { value: string }) {
  applyCartItemFieldChange({ field: 'description', ...deps })
}

export function updateUnitField(deps: FieldChangeDeps & { value: string }) {
  applyCartItemFieldChange({ field: 'unit', ...deps })
}

export function updateQuantityField(deps: FieldChangeDeps & { value: number }) {
  applyCartItemFieldChange({ field: 'quantity', ...deps })
}

export function updateUnitPriceField(deps: FieldChangeDeps & { value: number }) {
  applyCartItemFieldChange({ field: 'unitPrice', ...deps })
}

/**
 * Autocompleta descripción/unidad/precio según el producto/servicio elegido del catálogo, sin
 * importar en cuál de los 3 lugares está el producto: NUEVO (formulario "Agregar producto", el
 * caso por defecto), GUARDADO (edición en curso de una fila ya persistida, pasando `savedRow`) o
 * PENDIENTE (producto en memoria antes de registrar, pasando `pendingTempId`).
 */
export function autofillCartItem(deps: FieldChangeDeps & { productServiceId: number | null }) {
  const { productServiceId, savedRow, pendingTempId } = deps
  const picked = useProductServiceSelectStore.getState().options.find((o) => o.id === productServiceId)

  if (savedRow) {
    const { savedItemEdits, setSavedItemEdit } = useCartDraftsStore.getState()
    const current = getSavedItemValue(savedRow, savedItemEdits)
    setSavedItemEdit(savedRow.id, autofillFromProductService(current, picked, productServiceId))
    return
  }

  if (pendingTempId) {
    const { pendingCartItems, updatePendingCartItem } = usePendingCartItemsStore.getState()
    const current = pendingCartItems.find((p) => p.tempId === pendingTempId)
    if (!current) return
    updatePendingCartItem(pendingTempId, autofillFromProductService(current, picked, productServiceId))
    return
  }

  const { newItem, setNewItem } = useCartDraftsStore.getState()
  setNewItem(autofillFromProductService(newItem, picked, productServiceId))
}

// ── Agregar / guardar / quitar ─────────────────────────────────────────────────────────────────

/**
 * Valida el producto del formulario "Agregar producto" antes de agregarlo al carrito: debe tener
 * un producto/servicio del catálogo seleccionado (no basta con escribir la descripción a mano),
 * cantidad > 0 y precio unitario >= 0, y no debe estar ya en el carrito (ni guardado, ni
 * pendiente). Devuelve true/false y muestra el toast correspondiente si falla.
 */
function validateNewCartItem(newItem: CartItem): boolean {
  if (!newItem.productServiceId) {
    toastError('Falta el producto/servicio', 'Selecciona uno del catálogo — no basta con escribir la descripción.')
    return false
  }
  if (!newItem.description.trim()) {
    toastError('Falta la descripción', 'Escribe una descripción para el producto.')
    return false
  }
  if (newItem.quantity < 0.01) {
    toastError('Cantidad inválida', 'La cantidad debe ser mayor a 0.')
    return false
  }
  if (newItem.unitPrice < 0) {
    toastError('Precio inválido', 'El precio unitario no puede ser negativo.')
    return false
  }

  const alreadyInCart = [
    ...useSaleDetailListStore.getState().items,
    ...usePendingCartItemsStore.getState().pendingCartItems,
  ].some((item) => item.productServiceId === newItem.productServiceId)

  if (alreadyInCart) {
    toastError('Producto repetido', 'Ese producto/servicio ya está en el carrito.')
    return false
  }

  return true
}

/**
 * Lógica completa del botón "Agregar producto". Toma el producto del formulario directo de
 * `useCartDraftsStore` (`newItem`). SIN VENTA REGISTRADA: lo mete en la lista temporal del
 * carrito, sin petición al backend. CON VENTA YA REGISTRADA: lo persiste directo contra
 * `/sale-details` (sin `tax`). En ambos casos, si sale bien, limpia el formulario.
 */
export async function addProductToCart(deps: { saleId: number | null }): Promise<boolean> {
  const { saleId } = deps
  const { newItem, resetNewItem } = useCartDraftsStore.getState()

  if (!validateNewCartItem(newItem)) return false

  if (!saleId) {
    usePendingCartItemsStore.getState().addPendingCartItem(newItem)
    resetNewItem()
    return true
  }

  const ok = await useSaleDetailFormStore.getState().create({
    sale_id: saleId,
    product_service_id: newItem.productServiceId ?? undefined,
    description: newItem.description,
    unit: newItem.unit || undefined,
    quantity: newItem.quantity,
    unit_price: newItem.unitPrice,
  })

  if (ok) {
    toastSuccess('Producto agregado', newItem.description)
    resetNewItem()
  } else {
    toastError('Error', 'No se pudo agregar el producto.')
  }
  return ok
}

/** Lógica completa del botón "guardar" (✓) de un producto ya guardado que se está editando. El
 * payload NUNCA incluye `tax`. Devuelve true/false para que el botón sepa si debe quitar la fila
 * del modo edición. */
export async function saveEditedCartItem(deps: { row: SaleDetail; saleId: number; values: CartItem }): Promise<boolean> {
  const { row, saleId, values } = deps
  const ok = await useSaleDetailFormStore.getState().update(row.id, {
    sale_id: saleId,
    product_service_id: values.productServiceId ?? undefined,
    description: values.description,
    unit: values.unit || undefined,
    quantity: values.quantity,
    unit_price: values.unitPrice,
  })

  if (ok) toastSuccess('Producto actualizado', values.description)
  else toastError('Error', 'No se pudo actualizar el producto.')
  return ok
}

/**
 * Lógica completa del botón de eliminar (🗑) un producto del carrito, sea cual sea su estado:
 * PENDIENTE (sin venta registrada todavía) se quita directo de la lista en memoria, sin
 * confirmación ni petición al backend. GUARDADO (ya persistido en `/sale-details`) confirma con
 * el usuario y borra en el backend.
 */
export async function removeProductFromCart(deps: {
  saleId: number | null
  savedRow?: SaleDetail
  pendingTempId?: string
}): Promise<void> {
  const { saleId, savedRow, pendingTempId } = deps

  if (pendingTempId) {
    usePendingCartItemsStore.getState().removePendingCartItem(pendingTempId)
    return
  }

  if (!savedRow || !saleId) return

  await swalDeleteConfirm(
    `¿Eliminar el producto "${savedRow.description}"?`, 'Esta acción no se puede deshacer.',
    async ({ close, showError }) => {
      try {
        await saleDetailsService.delete(savedRow.id)
        await useSaleDetailListStore.getState().loadBySale(saleId)
        toastSuccess('Producto eliminado', savedRow.description)
        close()
      } catch {
        showError('No se pudo eliminar el producto.')
      }
    },
    { title: 'Eliminando...' }
  )
}

// ── Subida de los productos pendientes al registrar la venta ──────────────────────────────────

/**
 * Se dispara sola en cuanto la venta obtiene su id real (desde `submitSaleHeader`). Recorre
 * `usePendingCartItemsStore().pendingCartItems` y sube al backend, uno por uno (no en paralelo:
 * cada creación recalcula `subtotal`/`tax`/`total` de la cabecera sumando TODOS los detalles
 * existentes, y dos altas simultáneas podrían pisarse ese recálculo). `tax` NUNCA se envía. Cada
 * producto se quita de la lista temporal en cuanto se sube bien.
 */
export async function uploadPendingItems(deps: { saleId: number }): Promise<void> {
  const { saleId } = deps
  const tempIds = usePendingCartItemsStore.getState().pendingCartItems.map((p) => p.tempId)

  for (const tempId of tempIds) {
    const item = usePendingCartItemsStore.getState().pendingCartItems.find((p) => p.tempId === tempId)
    if (!item) continue // el usuario lo borró mientras esperaba su turno

    usePendingCartItemsStore.getState().setUploadingTempId(tempId)
    const ok = await useSaleDetailFormStore.getState().create({
      sale_id: saleId,
      product_service_id: item.productServiceId ?? undefined,
      description: item.description,
      unit: item.unit || undefined,
      quantity: item.quantity,
      unit_price: item.unitPrice,
    })

    if (ok) usePendingCartItemsStore.getState().removePendingCartItem(tempId)
    else toastError('Error', `No se pudo guardar el producto "${item.description}".`)
  }

  usePendingCartItemsStore.getState().setUploadingTempId(null)
}
