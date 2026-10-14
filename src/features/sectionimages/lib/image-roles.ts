// Reglas de cómo el sitio web usa las fotos de una sección (ver ServiceShowcase en la web):
// - Las fotos se agrupan por item (id_section_item). Las fotos sin item forman su propio grupo.
// - Solo cuentan las fotos visibles (state 1), en orden de sectionimage_order.
// - En un grupo con item: la 1ª es la PRINCIPAL (las siguientes se calculan como 'thumb').
// - Si la sección no tiene items: la 1ª foto es la PRINCIPAL.
// En pantalla solo se pinta el badge "Principal ★" y "Oculta" (ver isRoleBadgeVisible):
// las etiquetas "Miniatura N" ya no se muestran.
// Nota: antes la web mostraba como máximo 4 fotos por item (y la 5ª salía como "No se muestra").
// Ahora la web muestra TODAS las fotos visibles, así que ya no hay tope ni rol "sobra".

/** main = principal, thumb = miniatura, hidden = oculta, none = sin rol. */
export type ImageRoleKind = 'main' | 'thumb' | 'hidden' | 'none'

export type ImageRole = { kind: ImageRoleKind; label: string }

/** Datos mínimos de una foto para calcular su rol. */
export type ImageRoleInput = {
  id: number
  idSection: number
  idSectionItem: number | null
  order: number | null
  stateValue: number
}

/** Ordena igual que el backend: sectionimage_order ascendente y, si empatan, id descendente. */
export function sortByOrder<T extends { id: number; order: number | null }>(list: T[]): T[] {
  return [...list].sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || b.id - a.id)
}

/** true si el rol lleva badge en pantalla: solo "Principal ★" y "Oculta". */
export function isRoleBadgeVisible(role?: ImageRole | null): boolean {
  return role?.kind === 'main' || role?.kind === 'hidden'
}

/** Rol según la posición (1, 2, 3...) de la foto visible dentro de su grupo. */
function getRoleForPosition(position: number, hasItem: boolean, sectionHasItems: boolean): ImageRole {
  // Fotos sin item en una sección que SÍ tiene items: no tienen un rol claro en la web
  if (!hasItem && sectionHasItems) return { kind: 'none', label: '' }
  if (position === 1) return { kind: 'main', label: 'Principal' }
  if (!hasItem) return { kind: 'none', label: '' }
  // Sin tope: las demás fotos visibles (no llevan badge)
  return { kind: 'thumb', label: `Foto ${position}` }
}

/**
 * Calcula el rol de cada foto: { [idFoto]: rol }.
 * `sectionHasItems(idSection)` dice si esa sección tiene items (para tratar las fotos sin item).
 */
export function getImageRoles(
  images: ImageRoleInput[],
  sectionHasItems: (idSection: number) => boolean = () => false,
): Record<number, ImageRole> {
  const roles: Record<number, ImageRole> = {}
  // Contador de fotos visibles por grupo (sección + item)
  const counters: Record<string, number> = {}

  for (const image of sortByOrder(images)) {
    if (image.stateValue !== 1) {
      roles[image.id] = { kind: 'hidden', label: 'Oculta' }
      continue
    }
    const key = `${image.idSection}-${image.idSectionItem ?? 'none'}`
    const position = (counters[key] ?? 0) + 1
    counters[key] = position
    roles[image.id] = getRoleForPosition(position, image.idSectionItem != null, sectionHasItems(image.idSection))
  }

  return roles
}
