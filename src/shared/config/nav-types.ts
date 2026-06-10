// ─── User & Team types ───────────────────────────────────────────────────────

export type NavUser = {
  name: string
  email: string
  avatar: string
}

export type NavTeam = {
  name: string
  logo: React.ElementType
  plan: string
}

// ─── Role-based access control ───────────────────────────────────────────────
//
// Each nav item can declare which roles are allowed to see it.
// If `roles` is undefined or empty, the item is visible to everyone.
// When you implement auth, filter navGroups through filterNavByRole(navGroups, userRole).
//
// Example:
//   roles: ['admin']           → only admins see this item
//   roles: ['admin', 'editor'] → admins and editors see this item
//   roles: undefined           → everyone sees this item
//
export type UserRole = 'admin' | 'editor' | 'viewer' | string

// ─── Nav item types ──────────────────────────────────────────────────────────

type BaseNavItem = {
  title: string
  badge?: string
  icon?: React.ElementType
  /** Roles allowed to see this item. undefined = visible to all. */
  roles?: UserRole[]
}

export type NavLink = BaseNavItem & {
  url: string
  items?: never
}

export type NavCollapsible = BaseNavItem & {
  items: (BaseNavItem & { url: string; roles?: UserRole[] })[]
  url?: never
}

export type NavItem = NavCollapsible | NavLink

export type NavGroup = {
  title: string
  items: NavItem[]
  /** Roles allowed to see this entire group. undefined = visible to all. */
  roles?: UserRole[]
}

export type SidebarData = {
  user: NavUser
  teams: NavTeam[]
  navGroups: NavGroup[]
}

// ─── Role filter utility ─────────────────────────────────────────────────────
//
// Call this function when you have the logged-in user's role.
// Use it inside your sidebar/nav ui:
//
//   const filteredGroups = filterNavByRole(sidebarData.navGroups, currentUserRole)
//
export function filterNavByRole(groups: NavGroup[], userRole?: UserRole): NavGroup[] {
  if (!userRole) return groups // no auth yet → show everything

  return groups
    .filter((group) => !group.roles || group.roles.includes(userRole))
    .map((group) => ({
      ...group,
      items: group.items
        .filter((item) => !item.roles || item.roles.includes(userRole))
        .map((item) => {
          if (!item.items) return item
          return {
            ...item,
            items: item.items.filter(
              (sub) => !sub.roles || sub.roles.includes(userRole)
            ),
          }
        })
        .filter((item) => {
          // Remove collapsible items that ended up with 0 children
          if (item.items) return item.items.length > 0
          return true
        }),
    }))
    .filter((group) => group.items.length > 0)
}
