import { type ColumnDef } from '@tanstack/react-table'
import { Phone, Smartphone, Printer, MessageCircle, Star, Globe } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'
import { Checkbox } from '@/shared/ui/checkbox'
import { DataTableColumnHeader } from '@/shared/ui/data-table/column-header'
import { getStateOption } from '@/shared/config/entity-states'
import { getContactTypeOption } from '../../data/data'
import type { CompanyContact } from '../../data/schema'
import { CompanyContactsRowActions } from './company-contacts-row-actions'

const TYPE_ICON = {
  phone: Phone,
  mobile: Smartphone,
  whatsapp: MessageCircle,
  fax: Printer,
}

export const companyContactsColumns: ColumnDef<CompanyContact>[] = [
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
    accessorFn: (row) => `${row.name ?? ''} ${row.phone}`,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Contacto" />,
    cell: ({ row }) => {
      const Icon = TYPE_ICON[row.original.type]
      return (
        <div className="flex min-w-[220px] items-center gap-2 py-1.5">
          <div className="flex size-8 items-center justify-center rounded-md bg-muted">
            <Icon className="size-4 text-muted-foreground" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium leading-none text-foreground">
              {row.original.name || row.original.phone}
              {row.original.isPrimary && <Star className="ml-1 inline size-3 fill-amber-400 text-amber-400" />}
            </span>
            {row.original.name && <span className="text-xs text-muted-foreground">{row.original.phone}</span>}
          </div>
        </div>
      )
    },
    enableSorting: true,
    enableHiding: true,
  },

  {
    accessorKey: 'type',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Tipo" />,
    cell: ({ row }) => <span className="text-sm">{getContactTypeOption(row.original.type).label}</span>,
    enableSorting: true,
    enableHiding: true,
    meta: { className: 'w-[110px]' },
  },

  {
    accessorKey: 'email',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Correo" />,
    cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.email || '—'}</span>,
    enableSorting: false,
    enableHiding: true,
  },

  {
    id: 'showOnWebsite',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Sitio web" />,
    cell: ({ row }) => (
      row.original.showOnWebsite
        ? <Badge variant="outline" className="gap-1 text-xs"><Globe className="size-3" />Visible</Badge>
        : <span className="text-xs text-muted-foreground">—</span>
    ),
    enableSorting: false,
    enableHiding: true,
    meta: { className: 'w-[120px]' },
  },

  {
    accessorKey: 'status',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Estado" />,
    cell: ({ row }) => {
      const opt = getStateOption(row.original.statusValue)
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
    cell: CompanyContactsRowActions,
    meta: { className: 'w-[48px]' },
  },
]
