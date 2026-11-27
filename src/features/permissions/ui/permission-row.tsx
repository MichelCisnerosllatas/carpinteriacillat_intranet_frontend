'use client'

import { cn } from '@/shared/lib/utils'
import { Switch } from '@/shared/ui/switch'
import { ACTION_ICONS } from '../data/data'

/** Una fila de la card de un módulo: una acción (o widget) con su switch. */
export type PermissionRowItem = {
  key: string       // key completa: 'intranet.clients.create'
  action: string    // 'create'
  label: string     // 'Crear'
  isChild: boolean  // true = pertenece a un submódulo (se muestra con sangría)
  isWidget: boolean // true = widget del dashboard (va bajo el subtítulo "Widgets")
}

type PermissionRowProps = {
  row: PermissionRowItem
  /** Nombre del módulo (para el aria-label del switch). */
  moduleName: string
  checked: boolean
  disabled: boolean
  onToggle: (key: string, checked: boolean) => void
}

/** Fila con el nombre de la acción y su switch. */
export function PermissionRow({ row, moduleName, checked, disabled, onToggle }: PermissionRowProps) {
  // Los widgets no llevan icono: su "acción" (ej. 'kpis', 'goal') no es una acción del CRUD.
  const ActionIcon = row.isWidget ? undefined : ACTION_ICONS[row.action]

  return (
    <li>
      <label
        className={cn(
          'flex cursor-pointer items-center justify-between gap-3 px-4 py-2 text-sm hover:bg-muted/40',
          row.isChild && 'pl-8',
          disabled && 'cursor-not-allowed'
        )}
      >
        <span className={cn('flex min-w-0 items-center gap-2', !checked && 'text-muted-foreground')}>
          {ActionIcon && !row.isChild && <ActionIcon className="size-3.5 shrink-0" />}
          <span className="truncate">{row.label}</span>
        </span>
        <Switch
          checked={checked}
          disabled={disabled}
          onCheckedChange={(value) => onToggle(row.key, value)}
          aria-label={`${moduleName}: ${row.label}`}
        />
      </label>
    </li>
  )
}
