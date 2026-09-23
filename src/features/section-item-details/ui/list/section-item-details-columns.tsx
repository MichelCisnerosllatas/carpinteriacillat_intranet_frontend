import Link from 'next/link'
import { type ColumnDef } from '@tanstack/react-table'
import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'
import { Checkbox } from '@/shared/ui/checkbox'
import { DataTableColumnHeader } from '@/shared/ui/data-table/column-header'
import { getVisibilityStateOption } from '@/shared/config/entity-states'
import type { SectionItemDetail } from '../../data/schema'
import { SectionItemDetailsRowActions } from './section-item-details-row-actions'

export const sectionItemDetailsColumns: ColumnDef<SectionItemDetail>[] = [
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
    accessorFn: (row) => `${row.title ?? ''} ${row.description ?? ''}`,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Detalle" />,
    cell: ({ row }) => (
      <div className="flex min-w-[180px] flex-col gap-0.5 py-1.5">
        <Link href={`/section-item-details/${row.original.id}`} className="text-sm font-medium leading-none text-primary hover:underline">
          {row.original.title ?? `Detalle #${row.original.id}`}
        </Link>
        {row.original.description && (
          <span className="text-xs text-muted-foreground truncate max-w-[280px]">{row.original.description}</span>
        )}
      </div>
    ),
    enableSorting: true,
    enableHiding: true,
    meta: { label: 'Detalle' },
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
    meta: { className: 'w-[70px]', label: 'Orden' },
  },

  {
    id: 'sectionItem',
    accessorFn: (row) => row.idSectionItem,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Item" />,
    cell: ({ row }) => (
      <Badge variant="secondary" className="text-xs font-normal">Item #{row.original.idSectionItem}</Badge>
    ),
    enableSorting: true,
    enableHiding: true,
    meta: { className: 'w-[120px]', label: 'Item' },
  },

  {
    accessorKey: 'status',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Estado" />,
    cell: ({ row }) => {
      const opt = getVisibilityStateOption(row.original.stateValue)
      return (
        <Badge variant="outline" className={cn('text-xs', opt.badge)}>
          {opt.label}
        </Badge>
      )
    },
    enableSorting: true,
    enableHiding: true,
    meta: { className: 'w-[120px]', label: 'Estado' },
  },

  {
    id: 'dates',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Fechas" />,
    cell: ({ row }) => (
      <div className="flex flex-col gap-0.5 text-xs">
        <div className="flex flex-col">
          <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground/60">Registro</span>
          <span className="text-muted-foreground">{row.original.createdAtFormatted ?? row.original.createdAt}</span>
        </div>
        {row.original.updatedAt && (
          <div className="mt-0.5 flex flex-col">
            <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground/60">Actualización</span>
            <span className="text-[11px] text-muted-foreground opacity-70">{row.original.updatedAtFormatted ?? row.original.updatedAt}</span>
          </div>
        )}
      </div>
    ),
    enableSorting: true,
    enableHiding: true,
    meta: { className: 'w-[160px]', label: 'Fechas' },
  },

  {
    id: 'actions',
    cell: SectionItemDetailsRowActions,
    meta: { className: 'w-[48px]', label: 'Acciones' },
  },
]

/**
 * Igual que `sectionItemDetailsColumns` pero sin la columna "Item" — se usa cuando la tabla
 * está embebida dentro del tab de un item de sección concreto (`idSectionItem` fijo), donde
 * repetir "Item #N" en cada fila no aporta nada.
 */
export const sectionItemDetailsScopedColumns: ColumnDef<SectionItemDetail>[] = sectionItemDetailsColumns.filter((c) => c.id !== 'sectionItem')
