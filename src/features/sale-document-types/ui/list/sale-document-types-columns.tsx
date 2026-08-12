import { type ColumnDef } from '@tanstack/react-table'
import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'
import { Checkbox } from '@/shared/ui/checkbox'
import { DataTableColumnHeader } from '@/shared/ui/data-table/column-header'
import { getStateOption } from '@/shared/config/entity-states'
import type { SaleDocumentType } from '../../data/schema'
import { SaleDocumentTypesRowActions } from './sale-document-types-row-actions'

export const saleDocumentTypesColumns: ColumnDef<SaleDocumentType>[] = [
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
    accessorFn: (row) => `${row.name} ${row.code ?? ''}`,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Tipo de Comprobante" />,
    cell: ({ row }) => (
      <div className="flex min-w-[200px] flex-col gap-0.5 py-1.5">
        <span className="text-sm font-medium leading-none text-foreground">{row.original.name}</span>
        {row.original.code && (
          <span className="text-xs text-muted-foreground">{row.original.code}</span>
        )}
      </div>
    ),
    enableSorting: true,
    enableHiding: true,
  },

  {
    id: 'series',
    accessorKey: 'series',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Serie" />,
    cell: ({ row }) => (
      <Badge variant="outline" className="text-xs font-mono">
        {row.original.series}
      </Badge>
    ),
    enableSorting: true,
    enableHiding: true,
    meta: { className: 'w-[110px]' },
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
          <span className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wide">Registro</span>
          <span className="text-muted-foreground">{row.original.createdAt}</span>
        </div>
        {row.original.updatedAt && (
          <div className="flex flex-col mt-0.5">
            <span className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wide">Actualización</span>
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
    cell: SaleDocumentTypesRowActions,
    meta: { className: 'w-[48px]' },
  },
]
