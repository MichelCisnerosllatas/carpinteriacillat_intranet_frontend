'use client'

// Columnas de la tabla de alertas: casilla para seleccionar varias, interruptor "Activada",
// color + texto, cómo se comporta, vigencia, estado de visibilidad y acciones.

import Link from 'next/link'
import { type ColumnDef } from '@tanstack/react-table'
import { Pin, PinOff, X } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'
import { Checkbox } from '@/shared/ui/checkbox'
import { toastError, toastSuccess } from '@/shared/lib/toast'
import { getAlertStyle, getAlertVisibilityStatus } from '../../data/data'
import type { WebAlert } from '../../data/schema'
import { useWebAlertDeleteStore } from '../../stores/useWebAlertDeleteStore'
import { WebAlertStateSwitch } from '../web-alert-state-switch'
import { WebAlertsRowActions } from './web-alerts-row-actions'

/** "2026-11-15 23:59:00" → "15/11". */
const shortDate = (value: string) => {
  const [datePart] = value.split(/[ T]/)
  const [, month, day] = datePart.split('-')
  return `${day}/${month}`
}

/** Texto de la columna "Vigencia". */
const validityText = (startsAt: string | null, endsAt: string | null) => {
  if (startsAt && endsAt) return `Del ${shortDate(startsAt)} al ${shortDate(endsAt)}`
  if (startsAt) return `Desde el ${shortDate(startsAt)}`
  if (endsAt) return `Hasta el ${shortDate(endsAt)}`
  return 'Sin fecha'
}

/** Interruptor "Activada" de una fila: guarda al instante. */
function StateCell({ alert }: { alert: WebAlert }) {
  const { loadingId, toggleState } = useWebAlertDeleteStore()

  const handleChange = async (on: boolean) => {
    const ok = await toggleState(alert.id, on ? 1 : 0)
    if (ok) toastSuccess(on ? 'Alerta activada' : 'Alerta desactivada', alert.title ?? alert.subtitle ?? '')
    else toastError('Error', useWebAlertDeleteStore.getState().error ?? 'No se pudo cambiar el estado.')
  }

  return (
    <WebAlertStateSwitch
      checked={alert.stateValue === 1}
      disabled={loadingId === alert.id}
      onCheckedChange={(on) => void handleChange(on)}
    />
  )
}

export const webAlertsColumns: ColumnDef<WebAlert>[] = [
  // Casilla para seleccionar varias alertas (la de la cabecera marca todas las de esta página)
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
        onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
        aria-label="Seleccionar todas"
        className="translate-y-0.5"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(v) => row.toggleSelected(!!v)}
        aria-label="Seleccionar alerta"
        className="translate-y-0.5"
      />
    ),
    meta: { className: 'w-[40px]', label: 'Seleccionar' },
  },

  {
    id: 'state',
    header: () => <span className="text-xs">Activada</span>,
    cell: ({ row }) => <StateCell alert={row.original} />,
    meta: { className: 'w-[150px]', label: 'Activada' },
  },

  {
    id: 'alert',
    header: () => <span className="text-xs">Alerta</span>,
    cell: ({ row }) => {
      const style = getAlertStyle(row.original.style)
      return (
        <div className="flex min-w-[220px] max-w-[380px] items-center gap-3 py-1">
          <span className={cn('size-6 shrink-0 rounded-full', style.barClass)} title={style.label} />
          <Link href={`/web-alerts/edit/${row.original.id}`} className="flex min-w-0 flex-col gap-0.5 hover:underline">
            {row.original.title && <span className="truncate text-sm font-medium text-primary">{row.original.title}</span>}
            {row.original.subtitle && <span className="line-clamp-1 text-xs text-muted-foreground">{row.original.subtitle}</span>}
          </Link>
        </div>
      )
    },
    meta: { label: 'Alerta' },
  },

  {
    id: 'behavior',
    header: () => <span className="text-xs">Cómo se comporta</span>,
    cell: ({ row }) => (
      <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <X className="size-3.5" />
          {row.original.dismissible ? 'Se puede cerrar' : 'No se puede cerrar'}
        </span>
        <span className="flex items-center gap-1">
          {row.original.scrollBehavior === 'sticky' ? <Pin className="size-3.5" /> : <PinOff className="size-3.5" />}
          {row.original.scrollBehavior === 'sticky' ? 'Se queda visible al bajar' : 'Se oculta al bajar'}
        </span>
      </div>
    ),
    meta: { className: 'w-[190px]', label: 'Cómo se comporta' },
  },

  {
    id: 'validity',
    header: () => <span className="text-xs">Vigencia</span>,
    cell: ({ row }) => <span className="text-xs">{validityText(row.original.startsAt, row.original.endsAt)}</span>,
    meta: { className: 'w-[140px]', label: 'Vigencia' },
  },

  {
    id: 'visibility',
    header: () => <span className="text-xs">En la web</span>,
    cell: ({ row }) => {
      const status = getAlertVisibilityStatus(row.original.visibilityStatus)
      return <Badge variant="outline" className={cn('text-xs', status.badge)}>{status.label}</Badge>
    },
    meta: { className: 'w-[140px]', label: 'En la web' },
  },

  {
    id: 'actions',
    cell: WebAlertsRowActions,
    meta: { className: 'w-[48px]', label: 'Acciones' },
  },
]
