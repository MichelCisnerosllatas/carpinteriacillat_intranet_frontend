// src/features/proformas/lib/proforma-cart/row-actions/index.ts
// Lógica de las acciones que operan sobre UNA fila de la tabla del carrito (agregar, editar cada
// columna, autocompletar, guardar, eliminar) — separada de los helpers de todo el carrito
// (totales, tipos). `applyCartItemFieldChange` es un helper interno de los 4 `updateXField`, no
// se expone acá.
export { getSavedItemValue } from './getSavedItemValue'
export { addProductToCart } from './addProductToCart'
export { updateDescriptionField } from './updateDescriptionField'
export { updateUnitField } from './updateUnitField'
export { updateQuantityField } from './updateQuantityField'
export { updateUnitPriceField } from './updateUnitPriceField'
export { autofillCartItem } from './autofillCartItem'
export { removeProductFromCart } from './removeProductFromCart'
export { saveEditedCartItem } from './saveEditedCartItem'
