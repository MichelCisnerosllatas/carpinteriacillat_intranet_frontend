'use client'

import { useEffect } from 'react'
import {
  Globe,
  HardDrive,
  Loader2,
  MonitorSmall,
  Smartphone,
  Tablet,
  Terminal,
  Wifi,
  WifiOff,
} from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { toastError, toastSuccess } from '@/shared/lib/toast'
import { swalConfirm } from '@/shared/lib/swal'
import { useMyDevicesStore } from '../../stores/useMyDevicesStore'
import { UserDevicesError } from '../user-devices-error'
import type { UserDevice, DeviceType } from '../../data/schema'

function DeviceIcon({ type, platform }: { type: DeviceType; platform: UserDevice['platform'] }) {
  const cls = 'size-5 text-muted-foreground'
  if (platform === 'ios' || platform === 'android') return <Smartphone className={cls} />
  if (type === 'tablet')  return <Tablet className={cls} />
  if (type === 'desktop') return <MonitorSmall className={cls} />
  if (type === 'api')     return <Terminal className={cls} />
  if (platform === 'web') return <Globe className={cls} />
  return <HardDrive className={cls} />
}

function deviceDisplayName(device: UserDevice): string {
  if (device.deviceName) return device.deviceName
  if (device.browser)    return `${device.browser}${device.browserVersion ? ` ${device.browserVersion}` : ''}`
  return `Dispositivo #${device.id}`
}

function deviceSubline(device: UserDevice): string {
  const parts: string[] = []
  if (device.os)        parts.push([device.os, device.osVersion].filter(Boolean).join(' '))
  if (device.deviceBrand || device.deviceModel)
    parts.push([device.deviceBrand, device.deviceModel].filter(Boolean).join(' '))
  if (device.ipAddress) parts.push(device.ipAddress)
  if (device.lastSeenAt) parts.push(`Último acceso: ${device.lastSeenAt}`)
  return parts.join(' · ')
}

export function MyDevicesList() {
  const { devices, hasLoaded, isLoading, isError, message, isRevoking, load, revoke } = useMyDevicesStore()

  useEffect(() => { void load() }, [])

  if (isLoading && !hasLoaded) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (isError) {
    return (
      <UserDevicesError
        title="Error al cargar tus dispositivos"
        message={message ?? 'No se pudieron cargar tus sesiones.'}
        isLoading={isLoading}
        showRetryButton
        onRetry={async () => { await load() }}
      />
    )
  }

  if (!devices.length) {
    return (
      <div className="flex min-h-[200px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed p-8 text-center">
        <WifiOff className="size-8 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">No tienes sesiones registradas.</p>
      </div>
    )
  }

  const handleRevoke = async (device: UserDevice) => {
    const name = deviceDisplayName(device)
    const confirmed = await swalConfirm({
      title: '¿Cerrar sesión?',
      text: `Se cerrará la sesión en "${name}".`,
      confirmText: 'Sí, cerrar sesión',
      cancelText: 'Cancelar',
      danger: true,
    })
    if (!confirmed) return

    const ok = await revoke(device.id)
    if (ok) toastSuccess('Sesión cerrada', `La sesión en "${name}" fue cerrada.`)
    else toastError('Error', 'No se pudo cerrar la sesión. Intenta nuevamente.')
  }

  const active   = devices.filter((d) => d.isActive)
  const inactive = devices.filter((d) => !d.isActive)

  return (
    <div className="flex flex-col gap-6">
      {active.length > 0 && (
        <section className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-foreground">
            Sesiones activas
            <Badge variant="outline" className="ml-2 text-xs">{active.length}</Badge>
          </h3>
          <div className="flex flex-col gap-2">
            {active.map((device) => (
              <div
                key={device.id}
                className="flex items-center gap-4 rounded-xl border bg-card p-4 transition-colors hover:bg-muted/40"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-muted">
                  <DeviceIcon type={device.deviceType} platform={device.platform} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {deviceDisplayName(device)}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {deviceSubline(device)}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-teal-500 shadow-[0_0_6px_theme(colors.teal.500)]" />
                    <Wifi className="size-3.5 text-teal-600 dark:text-teal-400" />
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                    disabled={isRevoking === device.id}
                    onClick={() => void handleRevoke(device)}
                  >
                    {isRevoking === device.id ? (
                      <Loader2 className="mr-1.5 size-3 animate-spin" />
                    ) : null}
                    Cerrar sesión
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {inactive.length > 0 && (
        <section className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-muted-foreground">
            Sesiones cerradas
            <Badge variant="outline" className="ml-2 text-xs">{inactive.length}</Badge>
          </h3>
          <div className="flex flex-col gap-2">
            {inactive.map((device) => (
              <div
                key={device.id}
                className={cn(
                  'flex items-center gap-4 rounded-xl border bg-card p-4 opacity-60'
                )}
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-muted">
                  <DeviceIcon type={device.deviceType} platform={device.platform} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {deviceDisplayName(device)}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {deviceSubline(device)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <WifiOff className="size-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Cerrada</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
