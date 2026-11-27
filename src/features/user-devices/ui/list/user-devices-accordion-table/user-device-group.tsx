'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import NProgress from 'nprogress'
import { useCan } from '@/features/auth/hooks/usePermission'
import {
  ChevronDown,
  Eye,
  Loader2,
  MoreHorizontal,
  ShieldOff,
  Trash2,
  Wifi,
  WifiOff,
} from 'lucide-react'
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/shared/ui/accordion'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Checkbox } from '@/shared/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { cn } from '@/shared/lib/utils'
import { swalConfirmAction, swalDeleteConfirm } from '@/shared/lib/swal'
import { toastError, toastSuccess } from '@/shared/lib/toast'
import { useUserDeviceListStore } from '../../../stores/useUserDeviceListStore'
import type { UserDevice, DevicePlatform } from '../../../data/schema'
import type { UserGroup } from './types'
import { UserAvatar } from './user-avatar'
import { DeviceIcon } from './device-icon'

// ─── Helpers visuales ────────────────────────────────────────────────────────

const platformBadgeClass: Record<DevicePlatform, string> = {
  ios:     'bg-purple-100/30 text-purple-900 dark:text-purple-200 border-purple-300',
  android: 'bg-green-100/30 text-green-900 dark:text-green-200 border-green-300',
  web:     'bg-blue-100/30 text-blue-900 dark:text-blue-200 border-blue-300',
  desktop: 'bg-slate-100/30 text-slate-700 dark:text-slate-300 border-slate-300',
  unknown: 'bg-neutral-300/40 text-neutral-700 dark:text-neutral-300 border-neutral-300',
}

const platformLabel: Record<DevicePlatform, string> = {
  ios: 'iOS', android: 'Android', web: 'Web', desktop: 'Desktop', unknown: '—',
}

export function UserDeviceGroup({ group }: { group: UserGroup }) {
  const router = useRouter()
  const { revoke, deleteDevice, revokeAllByUser, deleteAllByUser, setCurrentDevice } =
    useUserDeviceListStore()

  // Revocar y eliminar usan el permiso 'delete' de dispositivos (ver ROLES_Y_PERMISOS.md)
  const canView = useCan('user_devices.view')
  const canDelete = useCan('user_devices.delete')

  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [busyRevoke, setBusyRevoke] = useState(false)
  const [busyDelete, setBusyDelete] = useState(false)

  const activeSessions = group.devices.filter((d) => d.isActive)
  const allIds = group.devices.map((d) => d.id)
  const allSelected = allIds.length > 0 && allIds.every((id) => selected.has(id))
  const someSelected = selected.size > 0 && !allSelected

  const toggleAll = () => {
    if (allSelected) {
      setSelected(new Set())
    } else {
      setSelected(new Set(allIds))
    }
  }

  const toggleOne = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const handleView = (device: UserDevice) => {
    setCurrentDevice(device)
    NProgress.start()
    router.push(`/user-devices/${device.id}`)
  }

  const handleRevokeOne = async (device: UserDevice) => {
    const label = device.deviceName ?? device.browser ?? `Dispositivo #${device.id}`
    const ok = await revoke(device.id)
    if (ok) toastSuccess('Sesión revocada', `"${label}" fue cerrada.`)
    else toastError('Error', 'No se pudo revocar la sesión.')
  }

  const handleDeleteOne = async (device: UserDevice) => {
    const label = device.deviceName ?? device.browser ?? `Dispositivo #${device.id}`
    await swalDeleteConfirm(
      '¿Eliminar dispositivo?', `Se eliminará "${label}".`,
      async ({ close, showError }) => {
        const ok = await deleteDevice(device.id)
        if (ok) {
          toastSuccess('Eliminado', `"${label}" fue eliminado.`)
          close()
        } else {
          showError('No se pudo eliminar.')
        }
      },
      { title: 'Eliminando...' }
    )
  }

  const handleRevokeAll = async () => {
    if (activeSessions.length === 0) return
    await swalConfirmAction({
      title: `¿Revocar ${activeSessions.length} sesión${activeSessions.length > 1 ? 'es' : ''}?`,
      text: `Se cerrarán todas las sesiones activas de ${group.userName}.`,
      confirmText: 'Sí, revocar todas',
      cancelText: 'Cancelar',
      danger: true,
      loading: { title: 'Revocando...' },
      action: async ({ close, showError }) => {
        setBusyRevoke(true)
        const ok = await revokeAllByUser(group.userId)
        setBusyRevoke(false)
        if (ok) {
          toastSuccess('Sesiones revocadas', `Todas las sesiones de ${group.userName} fueron cerradas.`)
          close()
        } else {
          showError('Algunas sesiones no pudieron ser revocadas.')
        }
      },
    })
  }

  const handleDeleteAll = async () => {
    await swalDeleteConfirm(
      `¿Eliminar ${group.devices.length} dispositivo${group.devices.length > 1 ? 's' : ''}?`,
      `Se eliminarán todos los registros de ${group.userName}.`,
      async ({ close, showError }) => {
        setBusyDelete(true)
        const ok = await deleteAllByUser(group.userId)
        setBusyDelete(false)
        if (ok) {
          toastSuccess('Eliminados', `Todos los dispositivos de ${group.userName} fueron eliminados.`)
          close()
        } else {
          showError('Algunos dispositivos no pudieron ser eliminados.')
        }
      },
      { title: 'Eliminando...' }
    )
  }

  return (
    <AccordionItem value={String(group.userId)} className="rounded-lg border bg-card">
      {/* Wrapper con group para hover — los botones de acción son hermanos del trigger, no hijos */}
      <div className="group flex items-center">
        <AccordionTrigger className="flex flex-1 items-center gap-3 px-4 py-3 hover:no-underline [&>svg]:hidden">
          <UserAvatar name={group.userName} />

          <div className="flex flex-1 flex-col items-start gap-0.5 text-left">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold">{group.userName}</span>
              <Badge variant="outline" className="text-[10px]">{group.userRole}</Badge>
            </div>
            <span className="text-xs text-muted-foreground">{group.userEmail}</span>
          </div>

          <div className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
            <Wifi className="size-3.5 text-teal-500" />
            <span>{activeSessions.length} activa{activeSessions.length !== 1 ? 's' : ''}</span>
            <span className="text-border">·</span>
            <span>{group.devices.length} total</span>
            <ChevronDown className="ml-1 size-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
          </div>
        </AccordionTrigger>

        {/* Botones de acción — fuera del trigger para evitar <button> dentro de <button>.
            En touch siempre visibles (pointer-coarse) y con más alto para el dedo; en
            mouse siguen apareciendo solo al hacer hover, como antes. */}
        <div className="flex shrink-0 items-center gap-1 pr-3 opacity-0 transition-opacity group-hover:opacity-100 pointer-coarse:opacity-100">
          {canDelete && activeSessions.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive pointer-coarse:h-9"
              onClick={() => void handleRevokeAll()}
              disabled={busyRevoke}
            >
              {busyRevoke ? <Loader2 className="size-3.5 animate-spin" /> : <ShieldOff className="size-3.5" />}
              Revocar todas
            </Button>
          )}
          {canDelete && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive pointer-coarse:h-9"
              onClick={() => void handleDeleteAll()}
              disabled={busyDelete}
            >
              {busyDelete ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
              Eliminar todas
            </Button>
          )}
        </div>
      </div>

      <AccordionContent className="px-0 pb-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-t bg-muted/40">
                <th className="w-10 px-4 py-2">
                  <Checkbox
                    checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                    onCheckedChange={toggleAll}
                    aria-label="Seleccionar todos"
                  />
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Dispositivo</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Plataforma</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Estado</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Acceso</th>
                <th className="w-12 px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {group.devices.map((device) => {
                const name =
                  device.deviceName ??
                  (device.browser ? `${device.browser} ${device.browserVersion ?? ''}`.trim() : null) ??
                  `ID ${device.id}`
                const osLine = [device.os, device.osVersion].filter(Boolean).join(' ')
                const isSelected = selected.has(device.id)

                return (
                  <tr
                    key={device.id}
                    className={cn(
                      'border-t transition-colors',
                      isSelected ? 'bg-muted/60' : 'hover:bg-muted/30'
                    )}
                  >
                    {/* Checkbox */}
                    <td className="px-4 py-2.5">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleOne(device.id)}
                        aria-label={`Seleccionar ${name}`}
                      />
                    </td>

                    {/* Dispositivo */}
                    <td className="px-3 py-2.5">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1.5">
                          <DeviceIcon type={device.deviceType} />
                          <span className="font-medium">{name}</span>
                        </div>
                        {osLine && <span className="text-xs text-muted-foreground">{osLine}</span>}
                        {device.ipAddress && (
                          <span className="font-mono text-[10px] text-muted-foreground">{device.ipAddress}</span>
                        )}
                      </div>
                    </td>

                    {/* Plataforma */}
                    <td className="px-3 py-2.5">
                      <Badge variant="outline" className={cn('text-xs', platformBadgeClass[device.platform])}>
                        {platformLabel[device.platform]}
                      </Badge>
                    </td>

                    {/* Estado */}
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-1.5">
                        {device.isActive
                          ? <Wifi className="size-3.5 text-teal-500" />
                          : <WifiOff className="size-3.5 text-muted-foreground" />}
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-xs',
                            device.isActive
                              ? 'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200'
                              : 'bg-neutral-300/40 text-neutral-600 dark:text-neutral-300 border-neutral-300'
                          )}
                        >
                          {device.isActive ? 'Activa' : 'Cerrada'}
                        </Badge>
                      </div>
                    </td>

                    {/* Acceso */}
                    <td className="px-3 py-2.5">
                      <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
                        <span>{device.loginAt}</span>
                        {device.lastSeenAt && (
                          <span className="text-[10px]">Último: {device.lastSeenAt}</span>
                        )}
                      </div>
                    </td>

                    {/* Acciones */}
                    <td className="px-3 py-2.5">
                      {(canView || canDelete) && (
                      <DropdownMenu modal={false}>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 data-[state=open]:bg-muted">
                            <MoreHorizontal className="size-4" />
                            <span className="sr-only">Acciones</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          {canView && (
                            <DropdownMenuItem onClick={() => handleView(device)}>
                              Ver detalle <DropdownMenuShortcut><Eye size={16} /></DropdownMenuShortcut>
                            </DropdownMenuItem>
                          )}
                          {canDelete && device.isActive && (
                            <>
                              {canView && <DropdownMenuSeparator />}
                              <DropdownMenuItem
                                className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                                onClick={() => void handleRevokeOne(device)}
                              >
                                Revocar <DropdownMenuShortcut><ShieldOff size={16} /></DropdownMenuShortcut>
                              </DropdownMenuItem>
                            </>
                          )}
                          {canDelete && (
                            <>
                              {(canView || device.isActive) && <DropdownMenuSeparator />}
                              <DropdownMenuItem
                                className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                                onClick={() => void handleDeleteOne(device)}
                              >
                                Eliminar <DropdownMenuShortcut><Trash2 size={16} /></DropdownMenuShortcut>
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {selected.size > 0 && (
            <div className="flex items-center gap-3 border-t px-4 py-2 text-xs text-muted-foreground">
              <span>{selected.size} seleccionado{selected.size !== 1 ? 's' : ''} de {group.devices.length}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs text-muted-foreground"
                onClick={() => setSelected(new Set())}
              >
                Limpiar selección
              </Button>
            </div>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}
