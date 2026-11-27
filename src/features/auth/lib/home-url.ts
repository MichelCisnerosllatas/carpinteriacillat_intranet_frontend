import { filterNavByPermission } from '@/shared/config/nav-types'
import { sidebarData } from '@/shared/config/sidebar-data'
import type { AuthSession } from '../model/session.type'
import { hasPermission, isSuperAdminSession } from '../hooks/usePermission'

/**
 * "Pantalla de inicio" de cada usuario, según los permisos de su rol:
 *
 *   1. El dashboard, si su rol puede verlo.
 *   2. Si no, el PRIMER módulo del menú que tiene permitido
 *      (ej. un rol que solo tiene "Sitio Web" entra a Navegaciones).
 *   3. Si no tiene ningún módulo, su perfil (siempre está permitido).
 *
 * Se usa al iniciar sesión, en la página "/" y en todos los botones "Ir al inicio".
 * Por eso esos botones apuntan a "/": la página raíz llama a esta función y redirige.
 */
export function getHomeUrl(session: AuthSession | null | undefined): string {
  if (!session) return '/sign-in'

  if (hasPermission(session, 'dashboard_summary.view')) return '/dashboard'

  const groups = filterNavByPermission(
    sidebarData.navGroups,
    (permission) => hasPermission(session, permission),
    isSuperAdminSession(session)
  )

  for (const group of groups) {
    for (const item of group.items) {
      if (item.url) return item.url
      if (item.items?.[0]) return item.items[0].url
    }
  }

  return '/profile'
}
