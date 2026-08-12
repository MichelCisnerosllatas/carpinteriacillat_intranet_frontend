import { type ColumnDef } from '@tanstack/react-table'
import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'
import { Checkbox } from '@/shared/ui/checkbox'
import { DataTableColumnHeader } from '@/shared/ui/data-table/column-header'
import { getStateOption } from '@/shared/config/entity-states'
import type { Section } from '../../data/schema'
import { SectionsRowActions } from './sections-row-actions'

export const sectionsColumns: ColumnDef<Section>[] = [
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
    accessorFn: (row) => `${row.name} ${row.title ?? ''} ${row.description ?? ''}`,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Sección" />,
    cell: ({ row }) => (
      <div className="flex min-w-[200px] flex-col gap-0.5 py-1.5">
        <span className="text-sm font-medium leading-none text-foreground">{row.original.name}</span>
        {row.original.title && (
          <span className="text-xs text-muted-foreground">{row.original.title}</span>
        )}
        {row.original.description && (
          <span className="text-xs text-muted-foreground">{row.original.description}</span>
        )}
      </div>
    ),
    enableSorting: true,
    enableHiding: true,
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
    meta: { className: 'w-[70px]' },
  },

  {
    id: 'typesection',
    accessorFn: (row) => row.typesectionName,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Tipo de Sección" />,
    cell: ({ row }) => (
      <Badge variant="secondary" className="text-xs font-normal">
        {row.original.typesectionName}
      </Badge>
    ),
    enableSorting: true,
    enableHiding: true,
    meta: { className: 'w-[150px]' },
  },

  {
    id: 'navigation',
    accessorFn: (row) => row.navigationName ?? '',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Navegación" />,
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">
        {row.original.navigationName ?? '—'}
      </span>
    ),
    enableSorting: true,
    enableHiding: true,
    meta: { className: 'w-[140px]' },
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
    meta: { className: 'w-[120px]' },
  },

  {
    id: 'dates',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Fechas" />,
    cell: ({ row }) => (
      <div className="flex flex-col gap-0.5 text-xs">
        <div className="flex flex-col">
          <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground/60">Registro</span>
          <span className="text-muted-foreground">{row.original.createdAt}</span>
        </div>
        {row.original.updatedAt && (
          <div className="mt-0.5 flex flex-col">
            <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground/60">Actualización</span>
            <span className="text-[11px] text-muted-foreground opacity-70">{row.original.updatedAt}</span>
          </div>
        )}
      </div>
    ),
    enableSorting: true,
    enableHiding: true,
    meta: { className: 'w-[160px]' },
  },

  {
    id: 'actions',
    cell: SectionsRowActions,
    meta: { className: 'w-[48px]' },
  },
]

/**
 * Igual que `sectionsColumns` pero sin la columna "Navegación" — se usa dentro de cada
 * grupo del listado agrupado por navegación (`sections-group-table.tsx`), donde el nombre
 * de la navegación ya se muestra una sola vez en el encabezado del grupo.
 */
export const sectionsGroupedColumns: ColumnDef<Section>[] = sectionsColumns.filter((c) => c.id !== 'navigation')
