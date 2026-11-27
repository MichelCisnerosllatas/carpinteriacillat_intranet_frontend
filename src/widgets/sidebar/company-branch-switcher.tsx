'use client'

import Link from 'next/link'
import { Check, ChevronDown, MapPin, PanelLeft, UserRound } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/shared/ui/sidebar'
import { useAuthStore } from '@/features/auth/stores/auth.store'
import { toastSuccess } from '@/shared/lib/toast'
import { CompanyLogo } from './company-logo'

/**
 * Encabezado del sidebar: logo + nombre de la empresa y la SUCURSAL ACTIVA de la sesión.
 * Si el usuario puede trabajar en más de una sucursal, el desplegable permite cambiarla (se
 * envía al backend como header X-Branch-Id y define dónde se registran ventas y proformas).
 * Contraído (desktop) solo muestra el logo, que al pasar el mouse se convierte en "expandir".
 */
export function CompanyBranchSwitcher() {
  const { isMobile, state, toggleSidebar } = useSidebar()
  const session = useAuthStore((s) => s.session)
  const activeBranchId = useAuthStore((s) => s.activeBranchId)
  const setActiveBranch = useAuthStore((s) => s.setActiveBranch)
  const isCollapsed = state === 'collapsed' && !isMobile

  const company = session?.company ?? null
  const companyName = company?.trade_name || company?.business_name || 'Mi empresa'
  const branches = session?.user.branches ?? []
  const activeBranch = branches.find((b) => b.id === activeBranchId) ?? null
  const branchLabel = activeBranch?.name ?? (branches.length === 0 ? 'Sin sucursal asignada' : 'Elegir sucursal')

  if (isCollapsed) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            onClick={toggleSidebar}
            tooltip="Expandir menú (Ctrl B)"
            aria-label="Expandir menú"
            className="group/logo justify-center group-data-[collapsible=icon]:p-1!"
          >
            <CompanyLogo
              url={company?.logo_url}
              className="group-hover/logo:hidden group-focus-visible/logo:hidden"
            />
            <PanelLeft className="hidden group-hover/logo:block group-focus-visible/logo:block" />
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  const handleSelect = (id: number, name: string) => {
    if (id === activeBranchId) return
    setActiveBranch(id)
    toastSuccess('Sucursal activa', `Ahora registras en: ${name}`)
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="h-auto w-full max-w-full gap-2 p-1 pe-2 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <CompanyLogo url={company?.logo_url} className="size-8" />
              <span className="grid min-w-0 flex-1 text-start leading-tight">
                <span className="truncate font-semibold">{companyName}</span>
                <span className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                  <MapPin className="size-3 shrink-0" />
                  <span className="truncate">{branchLabel}</span>
                </span>
              </span>
              <ChevronDown className="size-3.5! shrink-0 text-muted-foreground" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="min-w-60 rounded-lg" align="start" side="bottom" sideOffset={4}>
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              {branches.length > 1 ? 'Sucursal activa (donde registras)' : 'Tu sucursal'}
            </DropdownMenuLabel>

            {branches.length === 0 && (
              <div className="px-2 py-1.5 text-sm text-muted-foreground">
                No tienes sucursales asignadas. Pide a un administrador que te asigne una.
              </div>
            )}

            {branches.map((branch) => {
              const isActive = branch.id === activeBranchId
              return (
                <DropdownMenuItem
                  key={branch.id}
                  onClick={() => handleSelect(branch.id, branch.name)}
                  className="gap-2 p-2"
                >
                  <div className="flex size-6 items-center justify-center rounded-sm border">
                    <MapPin className="size-3.5 shrink-0" />
                  </div>
                  <div className="grid min-w-0 flex-1 leading-tight">
                    <span className="truncate">{branch.name}</span>
                    {branch.address && (
                      <span className="truncate text-xs text-muted-foreground">{branch.address}</span>
                    )}
                  </div>
                  {isActive && <Check className="size-4 shrink-0 text-primary" />}
                </DropdownMenuItem>
              )
            })}

            {session?.user.all_branches && (
              <div className="px-2 pb-1 text-xs text-muted-foreground">Trabajas en todas las sucursales.</div>
            )}

            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="gap-2 p-2">
              <Link href="/profile">
                <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                  <UserRound className="size-4" />
                </div>
                <span className="font-medium text-muted-foreground">Mi perfil</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
