import Link from 'next/link'
import { type ColumnDef } from '@tanstack/react-table'
import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'
import { Checkbox } from '@/shared/ui/checkbox'
import { DataTableColumnHeader } from '@/shared/ui/data-table/column-header'
import { getProformaStatusOption } from '../../data/data'
import type { Proforma } from '../../data/schema'
import { ProformasRowActions } from './proformas-row-actions'

const formatCurrency = (value: number, currency: string) => `${currency} ${value.toFixed(2)}`

export const proformasColumns: ColumnDef<Proforma>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
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
    accessorKey: 'code',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Código" />,
    cell: ({ row }) => (
      <Link
        href={`/proformas/${row.original.id}`}
        className="text-primary text-sm font-medium hover:underline"
      >
        {row.original.code}
      </Link>
    ),
    enableSorting: true,
    enableHiding: true,
    meta: { className: 'min-w-[120px]' },
  },

  {
    id: 'client',
    accessorFn: (row) => row.clientName ?? row.clientBusinessName ?? '',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Cliente" />,
    cell: ({ row }) => (
      <span className="text-sm">
        {row.original.clientName ?? row.original.clientBusinessName ?? '—'}
      </span>
    ),
    enableSorting: true,
    enableHiding: true,
    meta: { className: 'min-w-[180px]' },
  },

  {
    accessorKey: 'issueDate',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Fecha de emisión" />,
    cell: ({ row }) => (
      <span className="text-sm">{row.original.issueDateFormatted ?? row.original.issueDate}</span>
    ),
    enableSorting: true,
    enableHiding: true,
    meta: { className: 'w-[130px]' },
  },

  {
    accessorKey: 'status',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Estado" />,
    cell: ({ row }) => {
      const opt = getProformaStatusOption(row.original.status)
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
    accessorKey: 'total',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Total" />,
    cell: ({ row }) => (
      <span className="text-sm font-medium">
        {formatCurrency(row.original.total, row.original.currency)}
      </span>
    ),
    enableSorting: true,
    enableHiding: true,
    meta: { className: 'w-[130px] text-right' },
  },

  {
    id: 'actions',
    cell: ProformasRowActions,
    meta: { className: 'w-[48px]' },
  },
]
