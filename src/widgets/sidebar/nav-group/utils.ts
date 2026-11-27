import type { NavCollapsible, NavItem, NavLink } from '@/shared/config/nav-types'
import { sidebarData } from '@/shared/config/sidebar-data'

function flattenNavLinks(items: NavItem[]): NavLink[] {
  return items.flatMap((item) => {
    const link = item as NavLink
    if (link.url) return [link]
    return flattenNavLinks((item as NavCollapsible).items as NavItem[])
  })
}

const ALL_NAV_LINKS: NavLink[] = sidebarData.navGroups.flatMap((group) =>
  flattenNavLinks(group.items)
)

// Rutas que no tienen enlace propio en el sidebar pero pertenecen a otro módulo:
// se resaltan como su módulo padre (prefijo de ruta → url del enlace).
const ROUTE_ALIASES: Record<string, string> = {
  '/furniture-images': '/furnitures',
  '/section-item-details': '/section-items',
}

function resolveAlias(path: string): string {
  for (const [prefix, target] of Object.entries(ROUTE_ALIASES)) {
    if (path === prefix || path.startsWith(`${prefix}/`)) return target
  }
  return path
}

// Coincide con la ruta exacta o con cualquier subruta del módulo
// (ej. /roles/create, /roles/1, /roles/edit/1 siguen resaltando "Roles").
// Entre varias coincidencias se elige la más específica (url más larga)
// para no resaltar dos módulos a la vez (ej. /images vs /images/storage).
function getActiveUrl(pathname: string): string | undefined {
  const path = resolveAlias(pathname.split('?')[0])
  const matches = ALL_NAV_LINKS.filter(
    (link) => path === link.url || path.startsWith(`${link.url}/`)
  )
  if (!matches.length) return undefined
  return matches.reduce((best, cur) => (cur.url.length > best.url.length ? cur : best)).url
}

export function checkIsActive(pathname: string, item: NavItem): boolean {
  const activeUrl = getActiveUrl(pathname)
  const url = (item as NavLink).url
  if (url) return url === activeUrl
  return !!(item as NavCollapsible).items?.some((sub) => sub.url === activeUrl)
}
