// Vista agrupada (hero de Servicios y carrusel de categorías).
// Funciones puras (sin React ni HTTP) para ordenar las fotos con "las ocultas al final".
// Lo general de imágenes de sección vive fuera de esta carpeta (ver grouped/README.md).

/** Datos mínimos de una foto para ordenarla. */
type PhotoForOrder = {
  id: number
  idSectionItem: number | null
  stateValue: number
}

/**
 * Ordena las fotos de UN item (servicio / categoría) (ya vienen en su orden actual) así:
 *   1) visibles que no cambiaron
 *   2) las que se acaban de MOSTRAR  -> quedan al final de las visibles
 *   3) ocultas que no cambiaron
 *   4) las que se acaban de OCULTAR  -> quedan al final de todo
 * Dentro de cada bloque se respeta el orden que tenían.
 *
 * `changedIds`: fotos a las que se les cambia el estado. `newState`: 1 = mostrar, 0 = ocultar.
 */
export function sortHiddenLast<T extends PhotoForOrder>(photos: T[], changedIds: number[], newState: number): T[] {
  // Estado que tendrá cada foto después del cambio
  const finalState = (p: T) => (changedIds.includes(p.id) ? newState : p.stateValue)
  const changed = (p: T) => changedIds.includes(p.id)

  const visibleKept   = photos.filter((p) => finalState(p) === 1 && !changed(p))
  const visibleNew    = photos.filter((p) => finalState(p) === 1 && changed(p))
  const hiddenKept    = photos.filter((p) => finalState(p) !== 1 && !changed(p))
  const hiddenNew     = photos.filter((p) => finalState(p) !== 1 && changed(p))

  return [...visibleKept, ...visibleNew, ...hiddenKept, ...hiddenNew]
}

/**
 * Orden COMPLETO de la sección (lista de ids) para el endpoint de reorden:
 * los items en su orden, dentro de cada uno `sortHiddenLast`, y al final las fotos
 * sin item asignado (o cuyo item ya no existe).
 *
 * `photos` debe venir ya ordenada (sortByOrder).
 */
export function buildGroupedOrderIds<T extends PhotoForOrder>(
  photos: T[],
  itemIds: number[],
  changedIds: number[],
  newState: number,
): number[] {
  const ids: number[] = []

  // 1) Un item tras otro
  for (const idItem of itemIds) {
    const itemPhotos = photos.filter((p) => p.idSectionItem === idItem)
    sortHiddenLast(itemPhotos, changedIds, newState).forEach((p) => ids.push(p.id))
  }

  // 2) Al final, las fotos sin item
  const unassigned = photos.filter((p) => p.idSectionItem == null || !itemIds.includes(p.idSectionItem))
  sortHiddenLast(unassigned, changedIds, newState).forEach((p) => ids.push(p.id))

  return ids
}
