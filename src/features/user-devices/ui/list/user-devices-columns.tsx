import { type ColumnDef } from '@tanstack/react-table'
import {
  Globe,
  HardDrive,
  Monitor,
  Smartphone,
  Tablet,
  Terminal,
  Wifi,
  WifiOff,
} from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'
import { DataTableColumnHeader } from '@/shared/ui/data-table/column-header'
import type { UserDevice, DeviceType, DevicePlatform } from '../../data/schema'
import { UserDevicesRowActions } from './user-devices-row-actions'

// ─── Helpers de presentación ──────────────────────────────────────────────────

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

function DeviceTypeIcon({ type }: { type: DeviceType }) {
  const cls = 'size-3.5 text-muted-foreground'
  switch (type) {
    case 'mobile':  return <Smartphone className={cls} />
    case 'tablet':  return <Tablet className={cls} />
    case 'desktop': return <Monitor className={cls} />
    case 'api':     return <Terminal className={cls} />
    default:        return <HardDrive className={cls} />
  }
}

// ─── Columnas ─────────────────────────────────────────────────────────────────

export const userDevicesColumns: ColumnDef<UserDevice>[] = [
  // Usuario
  {
    id: 'user',
    accessorFn: (row) => `${row.user?.personName ?? ''} ${row.user?.personLastname ?? ''} ${row.user?.email ?? ''}`,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Usuario" />,
    cell: ({ row }) => {
      const { user } = row.original
      if (!user) return <span className="text-xs text-muted-foreground">—</span>
      return (
        <div className="flex min-w-[200px] flex-col gap-0.5 py-1 text-xs leading-5">
          <span className="font-semibold text-foreground">
            {user.personName} {user.personLastname}
          </span>
          <span className="text-muted-foreground">{user.email}</span>
          {user.roleName && (
            <Badge variant="outline" className="mt-0.5 w-fit text-[10px]">
              {user.roleName}
            </Badge>
          )}
        </div>
      )
    },
    enableSorting: false,
    meta: { className: 'min-w-[200px]' },
  },

  // Dispositivo
  {
    id: 'device',
    accessorFn: (row) => `${row.deviceName ?? ''} ${row.browser ?? ''} ${row.os ?? ''}`,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Dispositivo" />,
    cell: ({ row }) => {
      const d = row.original
      const name = d.deviceName ?? (d.browser ? `${d.browser}` : null) ?? `ID ${d.id}`
      const osLine = [d.os, d.osVersion].filter(Boolean).join(' ')
      const hardware = [d.deviceBrand, d.deviceModel].filter(Boolean).join(' · ')
      const browserLine = d.browser ? [d.browser, d.browserVersion].filter(Boolean).join(' ') : null

      return (
        <div className="flex min-w-[220px] flex-col gap-0.5 py-1 text-xs leading-5">
          <div className="flex items-center gap-1.5">
            <DeviceTypeIcon type={d.deviceType} />
            <span className="font-semibold text-foreground">{name}</span>
          </div>
          {osLine && <span className="text-muted-foreground">{osLine}</span>}
          {hardware && <span className="text-muted-foreground">{hardware}</span>}
          {browserLine && <span className="text-muted-foreground">{browserLine}</span>}
          {d.ipAddress && (
            <span className="font-mono text-[10px] text-muted-foreground">{d.ipAddress}</span>
          )}
        </div>
      )
    },
    enableSorting: false,
    meta: { className: 'min-w-[220px]' },
  },

  // Plataforma
  {
    accessorKey: 'platform',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Plataforma" />,
    cell: ({ row }) => {
      const platform = row.original.platform
      return (
        <Badge variant="outline" className={cn('text-xs', platformBadgeClass[platform])}>
          {platformLabel[platform]}
        </Badge>
      )
    },
    enableSorting: false,
    meta: { className: 'w-[110px]' },
  },

  // Estado
  {
    accessorKey: 'isActive',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Estado" />,
    cell: ({ row }) => {
      const active = row.original.isActive
      return (
        <div className="flex items-center gap-1.5">
          {active
            ? <Wifi className="size-3.5 text-teal-600 dark:text-teal-400" />
            : <WifiOff className="size-3.5 text-muted-foreground" />}
          <Badge
            variant="outline"
            className={cn(
              'text-xs',
              active
                ? 'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200'
                : 'bg-neutral-300/40 text-neutral-700 dark:text-neutral-300 border-neutral-300'
            )}
          >
            {active ? 'Activa' : 'Cerrada'}
          </Badge>
        </div>
      )
    },
    enableSorting: false,
    meta: { className: 'w-[120px]' },
  },

  // Fechas
  {
    id: 'dates',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Acceso" />,
    cell: ({ row }) => {
      const d = row.original
      return (
        <div className="flex w-[180px] flex-col gap-1 text-xs leading-5">
          <div className="flex flex-col">
            <span className="text-muted-foreground">Login</span>
            <span className="font-medium text-foreground">{d.loginAt ?? '—'}</span>
          </div>
          {d.lastSeenAt && (
            <div className="flex flex-col">
              <span className="text-muted-foreground">Último acceso</span>
              <span className="font-medium text-foreground">{d.lastSeenAt}</span>
            </div>
          )}
        </div>
      )
    },
    enableSorting: false,
    meta: { className: 'w-[180px] min-w-[180px]' },
  },

  // Acciones
  {
    id: 'actions',
    cell: UserDevicesRowActions,
    enableSorting: false,
    enableHiding: false,
    meta: { className: 'w-[100px]' },
  },
]
