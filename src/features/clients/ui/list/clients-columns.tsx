import { type ColumnDef } from '@tanstack/react-table'
import { Mail, Phone, User } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'
import { Checkbox } from '@/shared/ui/checkbox'
import { DataTableColumnHeader } from '@/shared/ui/data-table/column-header'
import { getStateOption } from '@/shared/config/entity-states'
import type { Client } from '../../data/schema'
import { ClientsRowActions } from './clients-row-actions'

export const clientsColumns: ColumnDef<Client>[] = [
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
    id: 'business_name',
    accessorFn: (row) => row.businessName,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Cliente" />,
    cell: ({ row }) => (
      <div className="flex min-w-[200px] flex-col gap-0.5 py-1.5">
        <span className="text-sm font-medium leading-none text-foreground">{row.original.businessName}</span>
        {row.original.address && (
          <span className="text-xs text-muted-foreground">{row.original.address}</span>
        )}
      </div>
    ),
    enableSorting: true,
    enableHiding: true,
  },

  {
    id: 'document',
    accessorFn: (row) => `${row.typedocName ?? ''} ${row.documentNumber ?? ''}`,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Documento" />,
    cell: ({ row }) => (
      <div className="flex min-w-[140px] flex-col gap-0.5 py-1.5">
        {row.original.typedocName ? (
          <Badge variant="outline" className="w-fit text-[11px]">{row.original.typedocName}</Badge>
        ) : (
          <span className="text-xs text-muted-foreground">Sin tipo</span>
        )}
        <span className="text-xs text-muted-foreground">{row.original.documentNumber ?? '—'}</span>
      </div>
    ),
    enableSorting: false,
    enableHiding: true,
    meta: { className: 'w-[160px]' },
  },

  {
    id: 'contact',
    accessorFn: (row) => `${row.contactPerson ?? ''} ${row.phone ?? ''} ${row.email ?? ''}`,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Contacto" />,
    cell: ({ row }) => (
      <div className="flex min-w-[200px] flex-col gap-1 py-1.5 text-xs text-muted-foreground">
        {row.original.contactPerson && (
          <span className="flex items-center gap-1"><User className="size-3" />{row.original.contactPerson}</span>
        )}
        {row.original.phone && (
          <span className="flex items-center gap-1"><Phone className="size-3" />{row.original.phone}</span>
        )}
        {row.original.email && (
          <span className="flex items-center gap-1"><Mail className="size-3" />{row.original.email}</span>
        )}
        {!row.original.contactPerson && !row.original.phone && !row.original.email && <span>—</span>}
      </div>
    ),
    enableSorting: false,
    enableHiding: true,
    meta: { className: 'w-[220px]' },
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
    meta: { className: 'w-[110px]' },
  },

  {
    id: 'actions',
    cell: ClientsRowActions,
    meta: { className: 'w-[48px]' },
  },
]
