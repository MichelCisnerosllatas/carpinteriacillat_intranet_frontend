import { type ColumnDef } from '@tanstack/react-table'
import { PenTool } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'
import { Checkbox } from '@/shared/ui/checkbox'
import { DataTableColumnHeader } from '@/shared/ui/data-table/column-header'
import { getStateOption } from '@/shared/config/entity-states'
import { getImageUrl } from '@/features/images/lib/image-url'
import type { CompanySignature } from '../../data/schema'
import { CompanySignaturesRowActions } from './company-signatures-row-actions'

export const companySignaturesColumns: ColumnDef<CompanySignature>[] = [
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
    id: 'signature',
    header: () => null,
    cell: ({ row }) => (
      <div className="flex size-9 items-center justify-center overflow-hidden rounded-md border bg-muted">
        {row.original.signatureImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={getImageUrl(row.original.signatureImage)} alt={row.original.signerName} className="h-full w-full object-contain" />
        ) : (
          <PenTool className="size-4 text-muted-foreground" />
        )}
      </div>
    ),
    enableSorting: false,
    enableHiding: true,
    meta: { className: 'w-[56px]' },
  },

  {
    id: 'info',
    accessorFn: (row) => `${row.signerName} ${row.position ?? ''}`,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Firmante" />,
    cell: ({ row }) => (
      <div className="flex min-w-[200px] flex-col gap-0.5 py-1.5">
        <span className="text-sm font-medium leading-none text-foreground">{row.original.signerName}</span>
        {row.original.position && (
          <span className="text-xs text-muted-foreground">{row.original.position}</span>
        )}
      </div>
    ),
    enableSorting: true,
    enableHiding: true,
  },

  {
    accessorKey: 'phone',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Teléfono" />,
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">{row.original.phone || '—'}</span>
    ),
    enableSorting: true,
    enableHiding: true,
    meta: { className: 'w-[140px]' },
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
    cell: CompanySignaturesRowActions,
    meta: { className: 'w-[48px]' },
  },
]
