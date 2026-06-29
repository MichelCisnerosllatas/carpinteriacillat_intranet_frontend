'use client'

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/shared/ui/sheet'
import { Badge } from '@/shared/ui/badge'
import { Separator } from '@/shared/ui/separator'
import { cn } from '@/shared/lib/utils'
import { Wifi, WifiOff } from 'lucide-react'
import type { UserDevice, DevicePlatform } from '../../data/schema'

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

function Row({ label, value }: { label: string; value?: string | null | boolean }) {
  if (value === undefined || value === null || value === '') return null
  const display = typeof value === 'boolean' ? (value ? 'Sí' : 'No') : value
  return (
    <div className="grid grid-cols-[160px_1fr] gap-x-3 py-1.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="break-all font-medium text-foreground">{display}</span>
    </div>
  )
}

// ─── Componente ───────────────────────────────────────────────────────────────

type Props = {
  device: UserDevice | null
  open: boolean
  onClose: () => void
}

export function UserDeviceDetailSheet({ device, open, onClose }: Props) {
  if (!device) return null

  const sessionName =
    device.deviceName ??
    (device.browser ? `${device.browser}${device.browserVersion ? ` ${device.browserVersion}` : ''}` : null) ??
    `Dispositivo #${device.id}`

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader className="pb-2">
          <SheetTitle className="flex items-center gap-2">
            {device.isActive
              ? <Wifi className="size-4 text-teal-500" />
              : <WifiOff className="size-4 text-muted-foreground" />}
            {sessionName}
          </SheetTitle>
          <SheetDescription>
            ID #{device.id} · {device.isActive ? 'Sesión activa' : 'Sesión cerrada'}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-4 flex flex-col gap-5">

          {/* Usuario */}
          {device.user && (
            <section>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Usuario</p>
              <Separator className="mb-2" />
              <Row label="Nombre" value={`${device.user.personName} ${device.user.personLastname}`.trim() || null} />
              <Row label="Correo" value={device.user.email} />
              <Row label="Documento" value={device.user.personNumdoc} />
              <Row label="Rol" value={device.user.roleName} />
            </section>
          )}

          {/* Dispositivo */}
          <section>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Dispositivo</p>
            <Separator className="mb-2" />
            <Row label="Nombre" value={device.deviceName} />
            <Row label="UUID" value={device.deviceUuid} />
            <Row label="Tipo" value={device.deviceType} />
            <Row label="Marca" value={device.deviceBrand} />
            <Row label="Modelo" value={device.deviceModel} />
          </section>

          {/* Plataforma y sistema */}
          <section>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Plataforma y sistema</p>
            <Separator className="mb-2" />
            <div className="grid grid-cols-[160px_1fr] gap-x-3 py-1.5 text-sm">
              <span className="text-muted-foreground">Plataforma</span>
              <Badge
                variant="outline"
                className={cn('w-fit text-xs', platformBadgeClass[device.platform])}
              >
                {platformLabel[device.platform]}
              </Badge>
            </div>
            <Row label="Sistema operativo" value={[device.os, device.osVersion].filter(Boolean).join(' ') || null} />
            <Row label="Navegador" value={[device.browser, device.browserVersion].filter(Boolean).join(' ') || null} />
            <Row label="App / Cliente" value={[device.appName, device.appVersion].filter(Boolean).join(' ') || null} />
          </section>

          {/* Conexión */}
          <section>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Conexión</p>
            <Separator className="mb-2" />
            <Row label="IP" value={device.ipAddress} />
            <Row label="Access token ID" value={device.accessTokenId} />
          </section>

          {/* Sesión */}
          <section>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Sesión</p>
            <Separator className="mb-2" />
            <Row label="Inicio de sesión" value={device.loginAt} />
            <Row label="Último acceso" value={device.lastSeenAt} />
            <Row label="Cierre de sesión" value={device.logoutAt} />
          </section>

        </div>
      </SheetContent>
    </Sheet>
  )
}
