// src/shared/config/route-permissions.ts
//
// ¿Qué permiso necesita una página del intranet?
//
// Se calcula a partir de sidebar-data.ts (así no hay que mantener otra lista aparte):
//   1. Se busca el item del sidebar cuya url sea el PREFIJO MÁS LARGO del pathname.
//      Ej: '/images/storage' gana sobre '/images' para la ruta '/images/storage'.
//   2. Del permiso de ese item ('clients.view') se saca el módulo ('clients') y se
//      elige la acción según el resto de la ruta:
//        /clients/create      → 'clients.create'   (/images/upload también es 'create')
//        /clients/edit/5      → 'clients.update'
//        /clients, /clients/5 → 'clients.view'   (listado, detalle, reorder, etc.)
//   3. Si ningún item coincide (profile, settings, help-center...) → la página es libre.
//
// Lo usa RoutePermissionGuard (src/features/auth/ui/route-permission-guard.tsx).

import { sidebarData } from './sidebar-data'

type RouteRule = {
  url: string
  permission?: string | string[]
  superadminOnly?: boolean
}

/** Resultado: qué se necesita para ver la página. null = página libre. */
export type RouteRequirement = {
  /** Permiso(s) necesarios (basta con tener uno). */
  permission?: string | string[]
  /** true = solo el superadmin. */
  superadminOnly?: boolean
}

/**
 * Rutas que NO aparecen en el sidebar pero pertenecen a un módulo.
 * Si creas una página "escondida" (sin item en el menú), agrégala aquí.
 */
const EXTRA_ROUTES: RouteRule[] = [
  { url: '/furniture-images',     permission: 'furnitures.view' },
  { url: '/section-item-details', permission: 'section_items.view' },
]

/** Todas las urls del sidebar (links y sub-items) con sus reglas, en una lista plana. */
function getAllRules(): RouteRule[] {
  const rules: RouteRule[] = []

  for (const group of sidebarData.navGroups) {
    for (const item of group.items) {
      if (item.url) {
        rules.push({
          url: item.url,
          permission: item.permission,
          superadminOnly: item.superadminOnly || group.superadminOnly,
        })
      }

      for (const sub of item.items ?? []) {
        rules.push({
          url: sub.url,
          permission: sub.permission,
          superadminOnly: sub.superadminOnly || item.superadminOnly || group.superadminOnly,
        })
      }
    }
  }

  return [...rules, ...EXTRA_ROUTES]
}

/** ¿El pathname es esta url o una sub-ruta de ella? ('/clients/5' sí, '/clients-x' no) */
function matchesUrl(pathname: string, url: string): boolean {
  return pathname === url || pathname.startsWith(`${url}/`)
}

/** Acción según lo que viene después de la url del módulo. */
function getActionFromRest(rest: string): 'create' | 'update' | 'view' {
  if (rest === '/create' || rest.startsWith('/create/')) return 'create'
  if (rest === '/upload') return 'create' // /images/upload sube imágenes nuevas
  if (rest === '/edit' || rest.startsWith('/edit/')) return 'update'
  return 'view'
}

/** Cambia 'clients.view' por 'clients.<action>'. Si la key no termina en '.view', se deja igual. */
function changeAction(permission: string, action: string): string {
  if (!permission.endsWith('.view')) return permission
  const moduleKey = permission.slice(0, -'.view'.length)
  return `${moduleKey}.${action}`
}

export function getRouteRequirement(pathname: string): RouteRequirement | null {
  // 1) Buscar el item con la url más larga que coincida
  let best: RouteRule | null = null
  for (const rule of getAllRules()) {
    if (!matchesUrl(pathname, rule.url)) continue
    if (!best || rule.url.length > best.url.length) best = rule
  }

  // Ningún item del menú coincide → página libre
  if (!best) return null

  if (best.superadminOnly) return { superadminOnly: true }

  // Item sin permiso (ej. Ajustes) → página libre
  if (!best.permission) return null

  // 2) Elegir la acción según el resto de la ruta
  const rest = pathname.slice(best.url.length) // ej: '/create', '/edit/5', '/5', ''
  const action = getActionFromRest(rest)

  const permission = Array.isArray(best.permission)
    ? best.permission.map((p) => changeAction(p, action))
    : changeAction(best.permission, action)

  return { permission }
}
