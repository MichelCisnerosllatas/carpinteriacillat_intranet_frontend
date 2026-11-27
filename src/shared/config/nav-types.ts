// ─── User & Team types ───────────────────────────────────────────────────────

export type NavUser = {
  name: string
  email: string
  avatar: string
}

// ─── Control de acceso por permisos ──────────────────────────────────────────
//
// Cada item del menú puede declarar qué permiso necesita para verse:
//
//   permission: 'clients.view'                 → solo quien tenga 'clients.view'
//   permission: ['sales.view', 'sales.create'] → basta con tener UNO de la lista
//   superadminOnly: true                       → solo el superadmin (páginas de demo)
//   (sin permission ni superadminOnly)         → lo ven todos (ej. Ajustes personales)
//
// Las keys son las mismas que define el backend en config/permissions.php.
// Más detalle en ROLES_Y_PERMISOS.md (raíz del proyecto).

type AccessRules = {
  /** Permiso(s) necesarios para ver el item. Varias keys = basta con tener una. */
  permission?: string | string[]
  /** Si es true, solo lo ve el superadmin. */
  superadminOnly?: boolean
}

// ─── Nav item types ──────────────────────────────────────────────────────────

type BaseNavItem = {
  title: string
  badge?: string
  icon?: React.ElementType
} & AccessRules

/** Sub-item dentro de un collapsible (siempre tiene url). */
export type NavSubItem = BaseNavItem & {
  url: string
}

export type NavLink = BaseNavItem & {
  url: string
  items?: never
}

export type NavCollapsible = BaseNavItem & {
  items: NavSubItem[]
  url?: never
}

export type NavItem = NavCollapsible | NavLink

export type NavGroup = {
  title: string
  items: NavItem[]
} & AccessRules

export type SidebarData = {
  user: NavUser
  navGroups: NavGroup[]
}

// ─── Filtro por permisos ─────────────────────────────────────────────────────
//
// `shared/` no puede importar de `features/`, por eso esta función no conoce el
// store de auth: recibe una función `can` que responde "¿tiene este permiso?".
//
// Uso (en un componente del sidebar):
//
//   const session = useAuthStore((s) => s.session)
//   const isSuperAdmin = useIsSuperAdmin()
//   const groups = filterNavByPermission(
//     sidebarData.navGroups,
//     (perm) => hasPermission(session, perm),
//     isSuperAdmin,
//   )

/** ¿Este item (o grupo) pasa sus propias reglas? No mira a sus hijos. */
function passesRules(
  rules: AccessRules,
  can: (permission: string | string[]) => boolean,
  isSuperAdmin: boolean
): boolean {
  // Páginas solo para el superadmin (demos)
  if (rules.superadminOnly && !isSuperAdmin) return false

  // Con permiso declarado → hay que tenerlo
  if (rules.permission) return can(rules.permission)

  // Sin reglas → visible para todos
  return true
}

export function filterNavByPermission(
  groups: NavGroup[],
  can: (permission: string | string[]) => boolean,
  isSuperAdmin: boolean
): NavGroup[] {
  const result: NavGroup[] = []

  for (const group of groups) {
    if (!passesRules(group, can, isSuperAdmin)) continue

    const visibleItems: NavItem[] = []

    for (const item of group.items) {
      if (!passesRules(item, can, isSuperAdmin)) continue

      // Link simple: ya pasó sus reglas
      if (!item.items) {
        visibleItems.push(item)
        continue
      }

      // Collapsible: se queda solo con los hijos visibles
      const visibleChildren = item.items.filter((sub) => passesRules(sub, can, isSuperAdmin))

      // Si no le queda ningún hijo, el collapsible se oculta
      if (visibleChildren.length > 0) {
        visibleItems.push({ ...item, items: visibleChildren })
      }
    }

    // El grupo se muestra solo si le queda algún item
    if (visibleItems.length > 0) {
      result.push({ ...group, items: visibleItems })
    }
  }

  return result
}
