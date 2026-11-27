'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Loader2, ShieldX } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { ErrorPage } from '@/shared/ui/error-page'
import { GoBackButton } from '@/shared/ui/go-back-button'
import { Header } from '@/widgets/header/header'
import { getRouteRequirement } from '@/shared/config/route-permissions'
import { useAuthStore } from '../stores/auth.store'
import { hasPermission, isSuperAdminSession } from '../hooks/usePermission'
import { getHomeUrl } from '../lib/home-url'

/**
 * Protege las páginas del intranet según los permisos del usuario.
 *
 * Mira el pathname, calcula qué permiso pide la página (getRouteRequirement, que se basa
 * en sidebar-data.ts) y:
 *   - si no tiene permiso → muestra "No tienes permiso para ver esta página"
 *   - si lo tiene (o la página es libre) → muestra la página normal
 *
 * Esto solo es para la experiencia de usuario: el backend igual responde 403 si se
 * intenta usar una API sin permiso.
 */
export function RoutePermissionGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const session = useAuthStore((state) => state.session)
  const accessChecked = useAuthStore((state) => state.accessChecked)

  const requirement = getRouteRequirement(pathname)

  // ¿Ya sabemos qué permisos tiene? Sí, si ya hay sesión (siempre trae user.role.permissions)
  // o si ya terminó la consulta GET verify al backend.
  const accessKnown = Boolean(session) || accessChecked

  const isSuperAdmin = isSuperAdminSession(session)

  // Pantalla de inicio del usuario según su rol (dashboard o primer módulo permitido).
  const homeUrl = getHomeUrl(session)

  // Página libre (profile, settings, help...)
  if (!requirement) return <>{children}</>

  // Mientras la sesión carga, no mostramos el aviso todavía.
  if (!accessKnown) {
    return (
      <div className="flex flex-1 items-center justify-center p-10 text-sm text-muted-foreground">
        <Loader2 className="mr-2 size-4 animate-spin" />
        Verificando permisos...
      </div>
    )
  }

  let allowed = true
  if (requirement.superadminOnly) allowed = isSuperAdmin
  else if (requirement.permission) allowed = hasPermission(session, requirement.permission)

  if (allowed) return <>{children}</>

  // Botón del aviso: a su pantalla de inicio (nunca a la misma página → sin bucles).
  const backUrl = homeUrl !== pathname ? homeUrl : null

  return (
    <>
      {/* El header trae el botón para abrir el sidebar en móvil */}
      <Header fixed title="Sin permiso" />
      <ErrorPage
        fullScreen={false}
        code="403"
        title="Esta pantalla no está habilitada para tu rol"
        description="Si la necesitas, pide a un administrador que active el permiso en tu rol."
        icon={<ShieldX className="size-10" />}
        actions={
          <>
            <GoBackButton fallbackHref={backUrl ?? '/profile'} />
            {backUrl && (
              <Button asChild>
                <Link href={backUrl}>Ir al inicio</Link>
              </Button>
            )}
          </>
        }
      />
    </>
  )
}
