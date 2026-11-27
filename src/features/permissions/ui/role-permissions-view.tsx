'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ChevronDown,
  ChevronsDownUp,
  ChevronsUpDown,
  Copy,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Search,
  Sparkles,
  Zap,
} from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Accordion } from '@/shared/ui/accordion'
import { Tabs, TabsList, TabsTrigger } from '@/shared/ui/tabs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { BackButton } from '@/shared/ui/back-button'
import { toastError, toastSuccess } from '@/shared/lib/toast'
import { swalConfirm } from '@/shared/lib/swal'
import { AlertError } from '@/widgets/alerts_components'
import { useCan } from '@/features/auth/hooks/usePermission'
import { useAuthStore } from '@/features/auth/stores/auth.store'
import { usePermissionTreeStore } from '../stores/usePermissionTreeStore'
import { useRolePermissionsStore } from '../stores/useRolePermissionsStore'
import {
  collectKeys,
  collectViewKeys,
  copyKeysBetweenPlatforms,
  countChanges,
  countModules,
  filterNodes,
  type AccessFilter,
} from '../lib/permission-tree'
import { PLATFORM_INFO } from '../data/data'
import type { PermissionEditor } from './editor-types'
import { FilterTabs } from './filter-tabs'
import { PermissionGroup } from './permission-group'

/**
 * Pantalla /roles/{id}/permissions: qué puede ver y hacer un rol.
 *
 *   ← Volver   Permisos de «vendedor»
 *   [Intranet | Móvil]   Buscar…   [Todos|Con acceso|Sin acceso]   [⚡ Acciones rápidas ▾]
 *   ▼ Grupo (switch)  →  cards de módulos con un switch por acción
 *                                                     [Cancelar] [Guardar]
 */
export function RolePermissionsView({ roleId }: { roleId: number }) {
  const router = useRouter()
  const tree = usePermissionTreeStore()
  const rolePermissions = useRolePermissionsStore()
  const canSave = useCan('roles.permissions')

  const [platformKey, setPlatformKey] = useState('intranet')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<AccessFilter>('all')
  // Grupos CERRADOS por plataforma (al inicio todos abiertos)
  const [closedByPlatform, setClosedByPlatform] = useState<Record<string, string[]>>({})

  // 1) Cargar el árbol y luego los permisos del rol
  useEffect(() => {
    void tree.load().then((ok) => {
      if (ok) void useRolePermissionsStore.getState().load(roleId)
    })
    return () => useRolePermissionsStore.getState().reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleId])

  const changes = countChanges(rolePermissions.originalKeys, rolePermissions.selectedKeys)
  const changeCount = changes.added + changes.removed

  // 2) Aviso del navegador si se cierra la pestaña con cambios sin guardar
  useEffect(() => {
    if (changeCount === 0) return
    const handler = (event: BeforeUnloadEvent) => event.preventDefault()
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [changeCount])

  const selected = useMemo(() => new Set(rolePermissions.selectedKeys), [rolePermissions.selectedKeys])

  // ── Estados de carga ──────────────────────────────────────────────────────
  if (tree.isError || rolePermissions.isError) {
    return (
      <div className="flex flex-col items-start gap-3">
        <AlertError
          title="No se pudieron cargar los permisos"
          message={(tree.message ?? rolePermissions.message) ?? undefined}
        />
        <Button variant="outline" onClick={() => router.refresh()}>Reintentar</Button>
      </div>
    )
  }

  if (!tree.tree || rolePermissions.isLoading || !rolePermissions.roleName) {
    return (
      <div className="flex items-center justify-center gap-2 p-16 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" /> Cargando permisos...
      </div>
    )
  }

  // El superadmin no se edita
  if (rolePermissions.isSystem) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border p-12 text-center">
        <Lock className="size-8 text-muted-foreground" />
        <p className="font-medium">«{rolePermissions.roleName}» tiene acceso total</p>
        <BackButton fallbackHref="/roles" label="Volver a roles" />
      </div>
    )
  }

  // ── Datos de la plataforma elegida ────────────────────────────────────────
  const platforms = tree.tree.platforms
  const platform = platforms.find((p) => p.key === platformKey) ?? platforms[0]
  const otherPlatform = platforms.find((p) => p.key !== platform.key)
  const platformKeys = collectKeys(platform.modules)

  const editor: PermissionEditor = {
    selected,
    disabled: !canSave || rolePermissions.isSaving,
    actionLabels: tree.tree.actions,
    toggle: rolePermissions.toggleKeys,
  }

  const visibleGroups = filterNodes(platform.modules, search, filter, selected)
  const isFiltering = search.trim() !== '' || filter !== 'all'
  const closed = closedByPlatform[platform.key] ?? []
  // Mientras se busca o filtra, todo lo encontrado queda abierto
  const openGroups = isFiltering
    ? visibleGroups.map((g) => g.key)
    : platform.modules.map((g) => g.key).filter((key) => !closed.includes(key))

  const setOpenGroups = (open: string[]) =>
    setClosedByPlatform((previous) => ({
      ...previous,
      [platform.key]: platform.modules.map((g) => g.key).filter((key) => !open.includes(key)),
    }))

  // ── Acciones rápidas ──────────────────────────────────────────────────────
  const platformName = PLATFORM_INFO[platform.key]?.title ?? platform.name
  const otherName = otherPlatform ? (PLATFORM_INFO[otherPlatform.key]?.title ?? otherPlatform.name) : ''

  const giveAll = () => editor.toggle(platformKeys, true)
  const removeAll = () => editor.toggle(platformKeys, false)
  const viewOnly = () => {
    const viewKeys = collectViewKeys(platform.modules)
    const viewSet = new Set(viewKeys)
    editor.toggle(platformKeys.filter((key) => !viewSet.has(key)), false)
    editor.toggle(viewKeys, true)
  }
  const copyFromOther = () => {
    if (!otherPlatform) return
    const copied = copyKeysBetweenPlatforms(
      rolePermissions.selectedKeys,
      otherPlatform.key,
      platform.key,
      new Set(platformKeys)
    )
    rolePermissions.replacePlatformKeys(platform.key, copied)
  }

  // ── Guardar / Cancelar ────────────────────────────────────────────────────
  const handleSave = async () => {
    const result = await rolePermissions.save()
    if (!result.ok) {
      toastError('No se guardaron los permisos', result.message)
      return
    }
    toastSuccess('Permisos guardados')

    // Si edité MI propio rol, refresco mi sesión para que el menú cambie al instante.
    const session = useAuthStore.getState().session
    const myRoleId = session?.user.role?.id_rol
    if (myRoleId === roleId) void useAuthStore.getState().verify()
  }

  const handleCancel = async () => {
    if (changeCount > 0) {
      const confirmed = await swalConfirm({
        title: '¿Descartar los cambios?',
        text: 'Los cambios que no guardaste se perderán.',
        confirmText: 'Sí, descartar',
        cancelText: 'Seguir editando',
      })
      if (!confirmed) return
      rolePermissions.discard()
    }
    router.push('/roles')
  }

  return (
    <div className="flex min-w-0 flex-col gap-4">
      {/* Título */}
      <div className="flex items-center gap-3">
        <BackButton fallbackHref="/roles" label="Volver a roles" />
        <h2 className="text-xl font-semibold tracking-tight">
          Permisos de <span className="text-primary capitalize">«{rolePermissions.roleName}»</span>
        </h2>
      </div>

      {/* Barra de herramientas */}
      <div className="flex flex-col gap-3 rounded-xl border bg-card p-3 lg:flex-row lg:items-center">
        {/* Plataforma */}
        <Tabs value={platform.key} onValueChange={setPlatformKey}>
          <TabsList>
            {platforms.map((p) => {
              const info = PLATFORM_INFO[p.key]
              const PlatformIcon = info?.icon
              const { withAccess, total } = countModules(p.modules, selected)
              return (
                <TabsTrigger key={p.key} value={p.key} className="gap-1.5 px-3">
                  {PlatformIcon && <PlatformIcon className="size-4" />}
                  {info?.title ?? p.name}
                  <span className="text-xs text-muted-foreground">{withAccess}/{total}</span>
                </TabsTrigger>
              )
            })}
          </TabsList>
        </Tabs>

        {/* Buscador */}
        <div className="relative w-full lg:w-64">
          <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar módulo..."
            className="h-9 pl-8"
          />
        </div>

        {/* Filtro */}
        <FilterTabs value={filter} onChange={setFilter} />

        {/* Acciones rápidas (menú desplegable) */}
        <div className="lg:ml-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full gap-2 lg:w-auto">
                <Zap className="size-4 text-amber-500" />
                Acciones rápidas
                <ChevronDown className="size-4 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60">
              <DropdownMenuLabel>{platformName}</DropdownMenuLabel>
              <DropdownMenuItem onClick={giveAll} disabled={editor.disabled}>
                <Sparkles className="mr-2 size-4" /> Activar todo
              </DropdownMenuItem>
              <DropdownMenuItem onClick={viewOnly} disabled={editor.disabled}>
                <Eye className="mr-2 size-4" /> Solo ver
              </DropdownMenuItem>
              <DropdownMenuItem onClick={removeAll} disabled={editor.disabled}>
                <EyeOff className="mr-2 size-4" /> Quitar todo
              </DropdownMenuItem>
              {otherPlatform && (
                <DropdownMenuItem onClick={copyFromOther} disabled={editor.disabled}>
                  <Copy className="mr-2 size-4" /> Copiar de {otherName}
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setOpenGroups(platform.modules.map((g) => g.key))} disabled={isFiltering}>
                <ChevronsUpDown className="mr-2 size-4" /> Expandir grupos
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setOpenGroups([])} disabled={isFiltering}>
                <ChevronsDownUp className="mr-2 size-4" /> Contraer grupos
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Grupos */}
      {visibleGroups.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
          Sin resultados
        </div>
      ) : (
        <Accordion
          type="multiple"
          value={openGroups}
          onValueChange={(value) => {
            if (!isFiltering) setOpenGroups(value)
          }}
          className="flex flex-col gap-3"
        >
          {visibleGroups.map((group) => (
            <PermissionGroup key={group.key} node={group} editor={editor} />
          ))}
        </Accordion>
      )}

      {/* Cancelar / Guardar */}
      {canSave && (
        <div className="sticky bottom-4 z-20 flex justify-end">
          <div className="flex gap-2 rounded-xl border bg-background/95 p-2 shadow-lg backdrop-blur">
            <Button variant="outline" onClick={() => void handleCancel()} disabled={rolePermissions.isSaving}>
              Cancelar
            </Button>
            <Button onClick={() => void handleSave()} disabled={changeCount === 0 || rolePermissions.isSaving}>
              {rolePermissions.isSaving && <Loader2 className="mr-2 size-4 animate-spin" />}
              Guardar
              {changeCount > 0 && (
                <span className="ml-2 rounded-full bg-primary-foreground/20 px-1.5 text-xs">{changeCount}</span>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
