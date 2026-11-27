// Funciones de ayuda (sin React) para la pantalla de permisos.
// Todas reciben el árbol que manda el backend y la lista de keys marcadas.

import type { PermissionActionDto, PermissionNodeDto, PermissionPlatformDto } from '../model/permissiontree.dto'
import { BASE_ACTION_ORDER } from '../data/data'

// ─── Recorrer el árbol ───────────────────────────────────────────────────────

/** Un "módulo" es un nodo que tiene acciones. Los grupos solo agrupan (no tienen acciones). */
export function isModule(node: PermissionNodeDto): boolean {
  return node.actions.length > 0
}

/** Todas las keys de un nodo y de sus hijos. */
export function collectSubtreeKeys(node: PermissionNodeDto): string[] {
  const keys = node.actions.map((a) => a.key)
  for (const child of node.children) {
    keys.push(...collectSubtreeKeys(child))
  }
  return keys
}

/** Todas las keys de varios nodos. */
export function collectKeys(nodes: PermissionNodeDto[]): string[] {
  return nodes.flatMap((node) => collectSubtreeKeys(node))
}

/** Todas las keys 'view' de un nodo y de sus hijos (para el botón "Solo ver"). */
export function collectViewKeys(nodes: PermissionNodeDto[]): string[] {
  const keys: string[] = []
  for (const node of nodes) {
    const view = node.actions.find((a) => a.action === 'view')
    if (view) keys.push(view.key)
    keys.push(...collectViewKeys(node.children))
  }
  return keys
}

/** Todas las keys de una plataforma. */
export function collectPlatformKeys(platform: PermissionPlatformDto): string[] {
  return collectKeys(platform.modules)
}

/** Key de la acción 'view' de un nodo (o null si no tiene). */
export function getViewKey(node: PermissionNodeDto): string | null {
  return node.actions.find((a) => a.action === 'view')?.key ?? null
}

/** ¿El rol puede ver este módulo? (tiene 'view', o alguna acción si el módulo no tiene 'view') */
export function hasAccess(node: PermissionNodeDto, selected: Set<string>): boolean {
  const viewKey = getViewKey(node)
  if (viewKey) return selected.has(viewKey)
  return node.actions.some((a) => selected.has(a.key))
}

/** Cuenta los módulos (nodos con acciones) y cuántos tienen acceso. */
export function countModules(
  nodes: PermissionNodeDto[],
  selected: Set<string>
): { total: number; withAccess: number } {
  let total = 0
  let withAccess = 0

  for (const node of nodes) {
    if (isModule(node)) {
      total++
      if (hasAccess(node, selected)) withAccess++
    }
    const inner = countModules(node.children, selected)
    total += inner.total
    withAccess += inner.withAccess
  }

  return { total, withAccess }
}

// ─── Nivel de acceso de un grupo: Nada / Solo ver / Todo ─────────────────────

export type AccessLevel = 'none' | 'view' | 'all' | 'custom'

/**
 * Resume cómo está marcado un conjunto de nodos:
 *  - 'none'   → nada marcado
 *  - 'all'    → todo marcado
 *  - 'view'   → solo están marcados los "Ver"
 *  - 'custom' → una mezcla (algunas acciones sí y otras no)
 */
export function getAccessLevel(nodes: PermissionNodeDto[], selected: Set<string>): AccessLevel {
  const allKeys = collectKeys(nodes)
  if (allKeys.length === 0) return 'none'

  const marked = allKeys.filter((key) => selected.has(key))
  if (marked.length === 0) return 'none'
  if (marked.length === allKeys.length) return 'all'

  const viewKeys = new Set(collectViewKeys(nodes))
  const onlyViews = marked.every((key) => viewKeys.has(key)) && marked.length === viewKeys.size
  return onlyViews ? 'view' : 'custom'
}

// ─── Orden de las acciones ───────────────────────────────────────────────────

/** Ordena las acciones: view, create, update, delete, state y luego las especiales. */
export function sortActions(
  actions: PermissionActionDto[],
  actionLabels: Record<string, string>
): PermissionActionDto[] {
  const order = [...BASE_ACTION_ORDER, ...Object.keys(actionLabels)]
  const position = (action: string) => {
    const index = order.indexOf(action)
    return index === -1 ? order.length : index
  }
  return [...actions].sort((a, b) => position(a.action) - position(b.action))
}

// ─── Regla de 'view' ─────────────────────────────────────────────────────────

/** Para cada key: la key 'view' de su mismo nodo y todas las keys de ese nodo. */
export type NodeKeyInfo = {
  viewKey: string | null
  allKeys: string[]
}

export type KeyIndex = Map<string, NodeKeyInfo>

/** Arma el índice key → info de su nodo, para las dos plataformas. */
export function buildKeyIndex(platforms: PermissionPlatformDto[]): KeyIndex {
  const index: KeyIndex = new Map()

  const visit = (node: PermissionNodeDto) => {
    const info: NodeKeyInfo = {
      viewKey: getViewKey(node),
      allKeys: node.actions.map((a) => a.key),
    }
    for (const key of info.allKeys) index.set(key, info)
    node.children.forEach(visit)
  }

  for (const platform of platforms) {
    platform.modules.forEach(visit)
  }

  return index
}

/**
 * Marca o desmarca un grupo de keys aplicando la regla de usabilidad:
 *   - al ACTIVAR cualquier acción → se activa también 'Ver' de ese módulo
 *     (no tiene sentido poder "Editar" algo que no puedes ver)
 *   - al QUITAR 'Ver' de un módulo → se quitan también sus otras acciones
 * Devuelve la nueva lista de keys marcadas (no modifica la original).
 */
export function applyToggle(
  selected: string[],
  keys: string[],
  checked: boolean,
  index: KeyIndex
): string[] {
  const result = new Set(selected)

  for (const key of keys) {
    const info = index.get(key)

    if (checked) {
      result.add(key)
      if (info?.viewKey) result.add(info.viewKey)
    } else {
      result.delete(key)
      if (info && info.viewKey === key) {
        info.allKeys.forEach((k) => result.delete(k))
      }
    }
  }

  return Array.from(result)
}

// ─── Buscador y filtro ───────────────────────────────────────────────────────

/** 'all' = todos, 'on' = solo módulos con acceso, 'off' = solo módulos sin acceso. */
export type AccessFilter = 'all' | 'on' | 'off'

/**
 * Deja solo los módulos que coinciden con el texto buscado y con el filtro de acceso.
 * Los grupos se mantienen si les queda algún hijo.
 */
export function filterNodes(
  nodes: PermissionNodeDto[],
  query: string,
  filter: AccessFilter,
  selected: Set<string>
): PermissionNodeDto[] {
  const text = query.trim().toLowerCase()
  const result: PermissionNodeDto[] = []

  for (const node of nodes) {
    const nameMatches = text === '' || node.name.toLowerCase().includes(text)

    if (isModule(node)) {
      const access = hasAccess(node, selected)
      const filterMatches = filter === 'all' || (filter === 'on' ? access : !access)
      if (nameMatches && filterMatches) {
        result.push(node) // el módulo se muestra con todos sus submódulos
      }
      continue
    }

    // Grupo: si su nombre coincide, se buscan sus hijos sin texto (solo con el filtro)
    const children = filterNodes(node.children, nameMatches ? '' : query, filter, selected)
    if (children.length > 0) {
      result.push({ ...node, children })
    }
  }

  return result
}

// ─── Copiar permisos entre plataformas ───────────────────────────────────────

/**
 * Copia los permisos de una plataforma a otra, para los módulos que existen en las dos.
 * Ej: 'intranet.clients.create' → 'mobile.clients.create' (solo si esa key existe en el móvil).
 */
export function copyKeysBetweenPlatforms(
  selected: string[],
  from: string,
  to: string,
  targetKeys: Set<string>
): string[] {
  const copied: string[] = []
  for (const key of selected) {
    if (!key.startsWith(`${from}.`)) continue
    const candidate = `${to}.${key.slice(from.length + 1)}`
    if (targetKeys.has(candidate)) copied.push(candidate)
  }
  return copied
}

/** ¿Hay diferencias entre lo guardado y lo marcado ahora? */
export function hasDifferences(original: string[], current: string[]): boolean {
  if (original.length !== current.length) return true
  const originalSet = new Set(original)
  return current.some((key) => !originalSet.has(key))
}

/** Cuántos permisos se agregaron y cuántos se quitaron respecto a lo guardado. */
export function countChanges(original: string[], current: string[]): { added: number; removed: number } {
  const originalSet = new Set(original)
  const currentSet = new Set(current)
  return {
    added: current.filter((key) => !originalSet.has(key)).length,
    removed: original.filter((key) => !currentSet.has(key)).length,
  }
}
