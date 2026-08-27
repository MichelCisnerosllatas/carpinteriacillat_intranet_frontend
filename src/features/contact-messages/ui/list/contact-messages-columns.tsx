import { type ColumnDef } from '@tanstack/react-table'
import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'
import { Checkbox } from '@/shared/ui/checkbox'
import { DataTableColumnHeader } from '@/shared/ui/data-table/column-header'
import { getContactMessageStatusOption, getContactMessageProjectTypeLabel } from '../../data/data'
import type { ContactMessage } from '../../data/schema'
import { ContactMessagesRowActions } from './contact-messages-row-actions'

export const contactMessagesColumns: ColumnDef<ContactMessage>[] = [
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
    accessorFn: (row) => `${row.name} ${row.email} ${row.phone ?? ''}`,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Remitente" />,
    cell: ({ row }) => (
      <div className="flex min-w-[200px] flex-col gap-0.5 py-1.5">
        <span className="text-sm font-medium leading-none text-foreground">{row.original.name}</span>
        <span className="text-xs text-muted-foreground">{row.original.email}</span>
        {row.original.phone && <span className="text-xs text-muted-foreground">{row.original.phone}</span>}
      </div>
    ),
    enableSorting: true,
    enableHiding: true,
  },

  {
    id: 'projectType',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Proyecto" />,
    cell: ({ row }) => (
      <Badge variant="outline" className="text-xs">
        {getContactMessageProjectTypeLabel(row.original.projectType)}
      </Badge>
    ),
    enableSorting: false,
    enableHiding: true,
    meta: { className: 'w-[160px]' },
  },

  {
    id: 'message',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Mensaje" />,
    cell: ({ row }) => (
      <p className="line-clamp-2 max-w-[320px] text-xs text-muted-foreground">{row.original.message}</p>
    ),
    enableSorting: false,
    enableHiding: true,
  },

  {
    accessorKey: 'status',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Estado" />,
    cell: ({ row }) => {
      const opt = getContactMessageStatusOption(row.original.status)
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
    header: ({ column }) => <DataTableColumnHeader column={column} title="Fecha" />,
    cell: ({ row }) => (
      <div className="flex flex-col gap-0.5 text-xs">
        <div className="flex flex-col">
          <span className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wide">Enviado</span>
          <span className="text-muted-foreground">{row.original.createdAtFormatted}</span>
        </div>
      </div>
    ),
    enableSorting: true,
    enableHiding: true,
    meta: { className: 'w-[150px]' },
  },

  {
    id: 'actions',
    cell: ContactMessagesRowActions,
    meta: { className: 'w-[48px]' },
  },
]
