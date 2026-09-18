import Link from 'next/link'
import { type ColumnDef } from '@tanstack/react-table'
import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'
import { Checkbox } from '@/shared/ui/checkbox'
import { DataTableColumnHeader } from '@/shared/ui/data-table/column-header'
import { getStateOption } from '@/shared/config/entity-states'
import { FaIcon } from '@/shared/ui/icon-picker/fa-icon'
import type { SectionButton } from '../../data/schema'
import { SectionButtonsRowActions } from './section-buttons-row-actions'

interface SectionButtonsColumnsOptions {
  /** El tipo de sección de estos botones es "fijo" — oculta la acción "Eliminar" de cada fila. */
  hideDelete?: boolean
  /** El orden no afecta nada para este tipo de sección (`web_settings.buttons_reorder: false`,
   * ej. "contact") — oculta la columna "Orden". */
  hideOrder?: boolean
}

export const getSectionButtonsColumns = ({ hideDelete }: SectionButtonsColumnsOptions = {}): ColumnDef<SectionButton>[] => [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
        onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
        aria-label="Seleccionar todos"
        className="translate-y-0.5"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(v) => row.toggleSelected(!!v)}
        aria-label="Seleccionar fila"
        className="translate-y-0.5"
      />
    ),
    enableSorting: false,
    enableHiding: false,
    meta: { className: 'w-[48px]' },
  },

  {
    id: 'info',
    accessorFn: (row) => `${row.label} ${row.url ?? ''}`,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Botón" />,
    cell: ({ row }) => (
      <div className="flex min-w-[180px] flex-col gap-0.5 py-1.5">
        <div className="flex items-center gap-1.5">
          <Link href={`/section-buttons/${row.original.id}`} className="text-sm font-medium leading-none text-primary hover:underline">
            {row.original.label}
          </Link>
          {row.original.actionKey && (
            <Badge variant="outline" className="text-[10px] font-normal">Acción</Badge>
          )}
        </div>
        {row.original.url && (
          <span className="text-xs text-muted-foreground truncate max-w-[220px]">{row.original.url}</span>
        )}
      </div>
    ),
    enableSorting: true,
    enableHiding: true,
    meta: { label: 'Botón' },
  },

  {
    id: 'icon',
    accessorFn: (row) => row.icon ?? '',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Icono" />,
    cell: ({ row }) => (
      row.original.icon
        ? (
          <span className="flex items-center gap-1.5">
            <FaIcon value={row.original.icon} className="size-3.5" />
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{row.original.icon}</code>
          </span>
        )
        : <span className="text-xs text-muted-foreground">—</span>
    ),
    enableSorting: true,
    enableHiding: true,
    meta: { className: 'w-[160px]', label: 'Icono' },
  },

  {
    id: 'variant',
    accessorFn: (row) => row.variant ?? '',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Variante" />,
    cell: ({ row }) => (
      row.original.variant
        ? <Badge variant="secondary" className="text-xs font-normal">{row.original.variant}</Badge>
        : <span className="text-xs text-muted-foreground">—</span>
    ),
    enableSorting: true,
    enableHiding: true,
    meta: { className: 'w-[120px]', label: 'Variante' },
  },

  {
    id: 'order',
    accessorFn: (row) => row.order ?? 0,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Orden" />,
    cell: ({ row }) => (
      <Badge variant="outline" className="font-mono text-xs">{row.original.order ?? '—'}</Badge>
    ),
    enableSorting: true,
    enableHiding: true,
    meta: { className: 'w-[70px]', label: 'Orden' },
  },

  {
    id: 'section',
    accessorFn: (row) => row.idSection,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Sección" />,
    cell: ({ row }) => (
      <Badge variant="secondary" className="text-xs font-normal">Sección #{row.original.idSection}</Badge>
    ),
    enableSorting: true,
    enableHiding: true,
    meta: { className: 'w-[120px]', label: 'Sección' },
  },

  {
    accessorKey: 'status',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Estado" />,
    cell: ({ row }) => {
      const opt = getStateOption(row.original.stateValue)
      return (
        <Badge variant="outline" className={cn('text-xs', opt.badge)}>
          {opt.label}
        </Badge>
      )
    },
    enableSorting: true,
    enableHiding: true,
    meta: { className: 'w-[120px]', label: 'Estado' },
  },

  {
    id: 'dates',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Fechas" />,
    cell: ({ row }) => (
      <div className="flex flex-col gap-0.5 text-xs">
        <div className="flex flex-col">
          <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground/60">Registro</span>
          <span className="text-muted-foreground">{row.original.createdAtFormatted ?? row.original.createdAt}</span>
        </div>
        {row.original.updatedAt && (
          <div className="mt-0.5 flex flex-col">
            <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground/60">Actualización</span>
            <span className="text-[11px] text-muted-foreground opacity-70">{row.original.updatedAtFormatted ?? row.original.updatedAt}</span>
          </div>
        )}
      </div>
    ),
    enableSorting: true,
    enableHiding: true,
    meta: { className: 'w-[160px]', label: 'Fechas' },
  },

  {
    id: 'actions',
    cell: ({ row }) => <SectionButtonsRowActions row={row} hideDelete={hideDelete} />,
    meta: { className: 'w-[48px]', label: 'Acciones' },
  },
]

/**
 * Igual que `getSectionButtonsColumns` pero sin la columna "Sección" — se usa cuando la tabla
 * está embebida dentro del tab de una sección concreta (`idSection` fijo), donde repetir
 * "Sección #N" en cada fila no aporta nada. También respeta `hideOrder`.
 */
export const getSectionButtonsScopedColumns = (opts: SectionButtonsColumnsOptions = {}): ColumnDef<SectionButton>[] =>
  getSectionButtonsColumns(opts).filter((c) => c.id !== 'section' && !(opts.hideOrder && c.id === 'order'))
