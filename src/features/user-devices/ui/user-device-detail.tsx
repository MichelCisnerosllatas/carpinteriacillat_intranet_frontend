'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  CalendarDays,
  Globe,
  HardDrive,
  Monitor,
  Network,
  ShieldOff,
  Smartphone,
  Tablet,
  Terminal,
  Wifi,
  WifiOff,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Badge } from '@/shared/ui/badge'
import { Separator } from '@/shared/ui/separator'
import { cn } from '@/shared/lib/utils'
import { useUserDeviceListStore } from '../stores/useUserDeviceListStore'
import type { DevicePlatform, DeviceType, UserDevice } from '../data/schema'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const platformLabel: Record<DevicePlatform, string> = {
  ios: 'iOS', android: 'Android', web: 'Web', desktop: 'Desktop', unknown: '—',
}

const platformBadgeClass: Record<DevicePlatform, string> = {
  ios:     'bg-purple-100/30 text-purple-900 dark:text-purple-200 border-purple-300',
  android: 'bg-green-100/30 text-green-900 dark:text-green-200 border-green-300',
  web:     'bg-blue-100/30 text-blue-900 dark:text-blue-200 border-blue-300',
  desktop: 'bg-slate-100/30 text-slate-700 dark:text-slate-300 border-slate-300',
  unknown: 'bg-neutral-300/40 text-neutral-700 dark:text-neutral-300 border-neutral-300',
}

function DeviceTypeIcon({ type, className }: { type: DeviceType; className?: string }) {
  const cls = cn('size-8', className)
  switch (type) {
    case 'mobile':  return <Smartphone className={cls} />
    case 'tablet':  return <Tablet className={cls} />
    case 'desktop': return <Monitor className={cls} />
    case 'api':     return <Terminal className={cls} />
    default:        return <HardDrive className={cls} />
  }
}

function Field({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  )
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function UserDeviceDetail({ id }: { id: string }) {
  const router = useRouter()
  const { currentDevice, devices, setCurrentDevice } = useUserDeviceListStore()

  useEffect(() => {
    if (!currentDevice || String(currentDevice.id) !== id) {
      const found = devices.find((d) => String(d.id) === id)
      if (found) {
        setCurrentDevice(found)
      } else {
        router.replace('/user-devices')
      }
    }
  }, [id, currentDevice, devices, setCurrentDevice, router])

  const device: UserDevice | null =
    currentDevice && String(currentDevice.id) === id ? currentDevice : null

  if (!device) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
        Cargando detalle del dispositivo...
      </div>
    )
  }

  const sessionName =
    device.deviceName ??
    (device.browser ? `${device.browser} ${device.browserVersion ?? ''}`.trim() : null) ??
    `Dispositivo #${device.id}`

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <DeviceTypeIcon type={device.deviceType} />
            </div>
            <div className="flex flex-1 flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-xl font-semibold">{sessionName}</h3>
                {device.isActive ? (
                  <Badge className="gap-1 bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-400">
                    <Wifi className="size-3" /> Activa
                  </Badge>
                ) : (
                  <Badge variant="outline" className="gap-1 text-muted-foreground">
                    <WifiOff className="size-3" /> Cerrada
                  </Badge>
                )}
                <Badge variant="outline" className={cn(platformBadgeClass[device.platform])}>
                  {platformLabel[device.platform]}
                </Badge>
              </div>
              {device.user && (
                <p className="text-sm text-muted-foreground">
                  {device.user.personName} {device.user.personLastname} · {device.user.email}
                </p>
              )}
              {device.ipAddress && (
                <span className="font-mono text-xs text-muted-foreground">{device.ipAddress}</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 sm:grid-cols-2">

        {/* Usuario */}
        {device.user && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Usuario</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Field label="Nombre completo" value={`${device.user.personName} ${device.user.personLastname}`.trim() || null} />
              <Separator />
              <Field label="Correo electrónico" value={device.user.email} />
              <Separator />
              <Field label="Documento" value={device.user.personNumdoc} />
              <Separator />
              <Field label="Rol" value={device.user.roleName} />
            </CardContent>
          </Card>
        )}

        {/* Dispositivo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <HardDrive className="size-4" />
              Dispositivo
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Field label="Nombre" value={device.deviceName} />
            {device.deviceName && <Separator />}
            <Field label="Tipo" value={device.deviceType} />
            <Separator />
            <Field label="Marca" value={device.deviceBrand} />
            {device.deviceBrand && <Separator />}
            <Field label="Modelo" value={device.deviceModel} />
            {device.deviceModel && <Separator />}
            <Field label="UUID" value={device.deviceUuid} />
          </CardContent>
        </Card>

        {/* Plataforma */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Globe className="size-4" />
              Plataforma y sistema
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground">Plataforma</span>
              <Badge variant="outline" className={cn('w-fit text-xs', platformBadgeClass[device.platform])}>
                {platformLabel[device.platform]}
              </Badge>
            </div>
            <Separator />
            <Field label="Sistema operativo" value={[device.os, device.osVersion].filter(Boolean).join(' ') || null} />
            {(device.os || device.osVersion) && <Separator />}
            <Field label="Navegador" value={[device.browser, device.browserVersion].filter(Boolean).join(' ') || null} />
            {(device.browser || device.browserVersion) && <Separator />}
            <Field label="App / Cliente" value={[device.appName, device.appVersion].filter(Boolean).join(' ') || null} />
          </CardContent>
        </Card>

        {/* Conexión */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Network className="size-4" />
              Conexión
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Field label="Dirección IP" value={device.ipAddress} />
            {device.ipAddress && <Separator />}
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground">Access Token ID</span>
              <span className="break-all font-mono text-xs">{device.accessTokenId ?? '—'}</span>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Sesión */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CalendarDays className="size-4" />
            Historial de sesión
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <Field label="Inicio de sesión" value={device.loginAt} />
          <Field label="Último acceso" value={device.lastSeenAt ?? '—'} />
          <Field label="Cierre de sesión" value={device.logoutAt ?? '—'} />
        </CardContent>
      </Card>

    </div>
  )
}
