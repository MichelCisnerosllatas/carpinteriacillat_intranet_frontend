'use client'

import { useMemo, type ElementType } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowRight, Home, LogIn, SearchX } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { ErrorPage } from '@/shared/ui/error-page'
import { GoBackButton } from '@/shared/ui/go-back-button'
import { filterNavByPermission } from '@/shared/config/nav-types'
import { sidebarData } from '@/shared/config/sidebar-data'
import { Header } from '@/widgets/header/header'
import { useAuthStore } from '@/features/auth/stores/auth.store'
import { hasPermission, isSuperAdminSession } from '@/features/auth/hooks/usePermission'

/** Módulos que se ofrecen como acceso rápido, en este orden (solo los que el usuario puede ver). */
const PREFERRED_URLS = [
  '/dashboard',
  '/proformas',
  '/sales',
  '/clients',
  '/products-services',
  '/reports',
  '/web-works',
  '/roles',
  '/users',
  '/navigations',
]
const MAX_SHORTCUTS = 6

type Shortcut = { title: string; url: string; icon?: ElementType }

/**
 * 404 DENTRO del intranet (con sidebar y header).
 * Muestra la dirección que no existe y accesos rápidos a los módulos que el usuario tiene permitidos.
 */
export function IntranetNotFound() {
  const pathname = usePathname()
  const session = useAuthStore((state) => state.session)
  const isLoggedIn = Boolean(session)

  // Accesos rápidos: items del menú que el usuario puede ver, en el orden de PREFERRED_URLS
  const shortcuts = useMemo<Shortcut[]>(() => {
    const groups = filterNavByPermission(
      sidebarData.navGroups,
      (perm) => hasPermission(session, perm),
      isSuperAdminSession(session)
    )

    // Todos los items permitidos en una lista plana (los collapsibles aportan sus sub-items)
    const allowed: Shortcut[] = groups.flatMap((group) =>
      group.items.flatMap((item): Shortcut[] =>
        item.items
          ? item.items.map((sub) => ({ title: sub.title, url: sub.url, icon: sub.icon ?? item.icon }))
          : [{ title: item.title, url: item.url, icon: item.icon }]
      )
    )

    return PREFERRED_URLS.map((url) => allowed.find((item) => item.url === url))
      .filter((item): item is Shortcut => Boolean(item))
      .slice(0, MAX_SHORTCUTS)
  }, [session])

  return (
    <>
      {/* El header trae el botón para abrir el sidebar en el celular */}
      <Header fixed title="Página no encontrada" />

      <ErrorPage
        fullScreen={false}
        code="404"
        title="Ups, esta pantalla no está en el taller"
        description={
          <>
            No encontramos{' '}
            <code className="rounded-md bg-muted px-1.5 py-0.5 text-sm text-foreground">{pathname}</code>. Puede
            que el enlace haya cambiado o que la pantalla ya no exista.
          </>
        }
        icon={<SearchX className="size-10" />}
        actions={
          isLoggedIn ? (
            <>
              <GoBackButton />
              <Button asChild>
                <Link href="/">
                  <Home className="mr-2 size-4" />
                  Ir al inicio
                </Link>
              </Button>
            </>
          ) : (
            <Button asChild>
              <Link href="/sign-in">
                <LogIn className="mr-2 size-4" />
                Iniciar sesión
              </Link>
            </Button>
          )
        }
      >
        {isLoggedIn && shortcuts.length > 0 && (
          <div className="flex w-full flex-col gap-3">
            <p className="text-sm font-medium">¿A dónde quieres ir?</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {shortcuts.map((shortcut) => {
                const Icon = shortcut.icon
                return (
                  <Link
                    key={shortcut.url}
                    href={shortcut.url}
                    className="group flex items-center gap-3 rounded-xl border bg-card p-3 text-left text-sm font-medium shadow-xs transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md"
                  >
                    {Icon && (
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="size-4" />
                      </span>
                    )}
                    <span className="min-w-0 flex-1 truncate">{shortcut.title}</span>
                    <ArrowRight className="size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </ErrorPage>
    </>
  )
}
