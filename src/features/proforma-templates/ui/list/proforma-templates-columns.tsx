import { type ColumnDef } from '@tanstack/react-table'
import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'
import { Checkbox } from '@/shared/ui/checkbox'
import { DataTableColumnHeader } from '@/shared/ui/data-table/column-header'
import { getStateOption } from '@/shared/config/entity-states'
import type { ProformaTemplate } from '../../data/schema'
import { ProformaTemplatesRowActions } from './proforma-templates-row-actions'

export const proformaTemplatesColumns: ColumnDef<ProformaTemplate>[] = [
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
    id: 'info',
    accessorFn: (row) => `${row.name} ${row.proformaTypeName ?? ''}`,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Plantilla" />,
    cell: ({ row }) => (
      <div className="flex min-w-[200px] flex-col gap-0.5 py-1.5">
        <span className="text-foreground text-sm leading-none font-medium">
          {row.original.name}
        </span>
        {row.original.proformaTypeName && (
          <span className="text-muted-foreground text-xs">{row.original.proformaTypeName}</span>
        )}
      </div>
    ),
    enableSorting: true,
    enableHiding: true,
  },

  {
    id: 'colors',
    header: 'Colores',
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        {[
          row.original.headerBgColor,
          row.original.bodyTextColor,
          row.original.bodyBorderColor,
          row.original.footerBgColor,
        ]
          .filter(Boolean)
          .map((c, i) => (
            <span
              key={i}
              className="size-4 rounded-full border"
              style={{ backgroundColor: c as string }}
              title={c as string}
            />
          ))}
      </div>
    ),
    enableSorting: false,
    enableHiding: true,
    meta: { className: 'w-[120px]' },
  },

  {
    id: 'texts',
    header: 'Textos',
    cell: ({ row }) => (
      <span className="text-muted-foreground text-xs">{row.original.textsCount} bloque(s)</span>
    ),
    enableSorting: false,
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
          <span className="text-muted-foreground/60 text-[10px] font-medium tracking-wide uppercase">
            Registro
          </span>
          <span className="text-muted-foreground">{row.original.createdAt}</span>
        </div>
        {row.original.updatedAt && (
          <div className="mt-0.5 flex flex-col">
            <span className="text-muted-foreground/60 text-[10px] font-medium tracking-wide uppercase">
              Actualización
            </span>
            <span className="text-muted-foreground text-[11px] opacity-70">
              {row.original.updatedAt}
            </span>
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
    cell: ProformaTemplatesRowActions,
    meta: { className: 'w-[48px]' },
  },
]
