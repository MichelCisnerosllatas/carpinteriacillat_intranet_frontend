import { type ColumnDef } from '@tanstack/react-table'
import { Globe, ExternalLink } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'
import { Checkbox } from '@/shared/ui/checkbox'
import { DataTableColumnHeader } from '@/shared/ui/data-table/column-header'
import { getStateOption } from '@/shared/config/entity-states'
import { getSocialNetworkIcon } from '../../data/data'
import type { CompanySocialNetwork } from '../../data/schema'
import { CompanySocialNetworksRowActions } from './company-social-networks-row-actions'

export const companySocialNetworksColumns: ColumnDef<CompanySocialNetwork>[] = [
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
    accessorFn: (row) => `${row.name} ${row.link}`,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Red social" />,
    cell: ({ row }) => {
      const Icon = getSocialNetworkIcon(row.original.name)
      return (
        <div className="flex min-w-[240px] items-center gap-2 py-1.5">
          <div className="flex size-8 items-center justify-center rounded-md bg-muted">
            <Icon className="size-4 text-muted-foreground" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium leading-none text-foreground">{row.original.name}</span>
            <a
              href={row.original.link} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {row.original.link}
              <ExternalLink className="size-3" />
            </a>
          </div>
        </div>
      )
    },
    enableSorting: true,
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
    cell: CompanySocialNetworksRowActions,
    meta: { className: 'w-[48px]' },
  },
]
