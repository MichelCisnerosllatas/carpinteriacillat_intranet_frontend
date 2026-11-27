'use client'

import { useAuthStore } from '../stores/auth.store'
import type { AuthSession } from '../model/session.type'

/**
 * Permisos del usuario en el intranet.
 *
 * Los permisos llegan del backend en GET verify, dentro de session.user.role.permissions,
 * como keys cortas 'modulo.accion':
 *   ['clients.view', 'clients.create', 'sales.view', ...]
 *
 * Ejemplos de uso en un componente:
 *
 *   const canCreate = useCan('clients.create')
 *   {canCreate && <Button>Nuevo cliente</Button>}
 *
 *   // Varias keys = basta con tener UNA (OR)
 *   const canChange = useCan(['clients.update', 'clients.state'])
 *
 * OJO: esto solo oculta cosas en pantalla. La seguridad real la pone el backend
 * (middleware 'permission:'), que responde 403 si no tienes el permiso.
 */

/** ¿La sesión es de un superadmin? (rol con slug 'superadmin') */
export function isSuperAdminSession(session: AuthSession | null | undefined): boolean {
  return session?.user.role?.role_slug === 'superadmin'
}

/**
 * Función normal (no es hook): sirve fuera de componentes, por ejemplo para filtrar el sidebar.
 * Devuelve true si el usuario tiene AL MENOS UNO de los permisos pedidos.
 */
export function hasPermission(
  session: AuthSession | null | undefined,
  permission: string | string[],
): boolean {
  if (!session) return false

  // El superadmin puede todo.
  if (isSuperAdminSession(session)) return true

  const userPermissions = session.user.role?.permissions ?? []
  const required = Array.isArray(permission) ? permission : [permission]

  return required.some((key) => userPermissions.includes(key))
}

/** ¿El usuario es superadmin? */
export function useIsSuperAdmin(): boolean {
  return useAuthStore((state) => isSuperAdminSession(state.session))
}

/** Hook: ¿el usuario tiene este permiso? (o alguno de la lista) */
export function useCan(permission: string | string[]): boolean {
  const session = useAuthStore((state) => state.session)
  return hasPermission(session, permission)
}
