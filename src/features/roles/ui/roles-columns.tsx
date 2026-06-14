import { type ColumnDef } from '@tanstack/react-table'
import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'
import { Checkbox } from '@/shared/ui/checkbox'
import { DataTableColumnHeader } from '@/shared/ui/data-table/column-header'
import { roleStatusBadge } from '../data/data'
import type { Role } from '../data/schema'
import { RolesRowActions } from './roles-row-actions'

export const rolesColumns: ColumnDef<Role>[] = [
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
    meta: { className: cn('inset-s-0 z-20 w-[48px] bg-background max-md:sticky') },
  },

  {
    id: 'data',
    accessorFn: (row) => `${row.name} ${row.description ?? ''}`,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Rol" />,
    cell: ({ row }) => {
      const role = row.original
      return (
        <div className="flex min-w-[280px] max-w-[480px] flex-col gap-1 py-2 text-xs leading-5">
          <span className="font-semibold text-foreground">{role.name}</span>
          {role.description && (
            <span className="text-muted-foreground">{role.description}</span>
          )}
        </div>
      )
    },
    enableSorting: true,
    enableHiding: true,
    meta: { className: 'min-w-[280px]' },
  },

  {
    accessorKey: 'status',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Estado" />,
    cell: ({ row }) => {
      const badgeColor = roleStatusBadge.get(row.original.status)
      return (
        <Badge variant="outline" className={cn('capitalize', badgeColor)}>
          {row.original.statusLabel}
        </Badge>
      )
    },
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
    enableSorting: true,
    enableHiding: true,
  },

  {
    id: 'dates',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Fechas" />,
    cell: ({ row }) => {
      const role = row.original
      return (
        <div className="flex w-[160px] flex-col gap-1 text-xs leading-5">
          <div className="flex flex-col">
            <span className="text-muted-foreground">Creado</span>
            <span className="font-medium text-foreground">{role.createdAt}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-muted-foreground">Modificado</span>
            <span className="font-medium text-foreground">{role.updatedAt || '—'}</span>
          </div>
        </div>
      )
    },
    enableSorting: true,
    enableHiding: true,
    meta: { className: 'w-[170px] min-w-[170px]' },
  },

  {
    id: 'actions',
    cell: RolesRowActions,
  },
]
