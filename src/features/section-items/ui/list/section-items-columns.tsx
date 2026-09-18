import Link from 'next/link'
import { type ColumnDef } from '@tanstack/react-table'
import { MessageCircle } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'
import { Checkbox } from '@/shared/ui/checkbox'
import { DataTableColumnHeader } from '@/shared/ui/data-table/column-header'
import { getStateOption } from '@/shared/config/entity-states'
import { SECTION_ITEM_TYPES } from '../../data/data'
import type { SectionItem } from '../../data/schema'
import { SectionItemsRowActions } from './section-items-row-actions'

const typeLabel = (value: string | null) => SECTION_ITEM_TYPES.find((t) => t.value === value)?.label ?? value ?? '—'

interface SectionItemsColumnsOptions {
  /** El tipo de sección de estos items es "fijo" — oculta la acción "Eliminar" de cada fila. */
  hideDelete?: boolean
  /** El orden no afecta nada para este tipo de sección (`web_settings.items_reorder: false`,
   * ej. "contact") — oculta la columna "Orden" para no sugerir un control que no hace nada. */
  hideOrder?: boolean
}

const buildSectionItemsColumns = ({ hideDelete }: SectionItemsColumnsOptions = {}): ColumnDef<SectionItem>[] => [
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
    id: 'type',
    accessorFn: (row) => row.type,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Tipo" />,
    cell: ({ row }) => (
      <Badge variant="secondary" className="text-xs font-normal">
        {typeLabel(row.original.type)}
      </Badge>
    ),
    enableSorting: true,
    enableHiding: true,
    meta: { className: 'w-[130px]', label: 'Tipo' },
  },

  {
    id: 'title',
    accessorFn: (row) => row.title ?? row.label,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Item" />,
    cell: ({ row }) => (
      <div className="flex min-w-[180px] flex-col gap-0.5 py-1.5">
        <Link href={`/section-items/${row.original.id}`} className="text-sm font-medium leading-none text-primary hover:underline">
          {row.original.title || row.original.label || '—'}
        </Link>
        {row.original.subtitle && (
          <span className="text-xs text-muted-foreground truncate max-w-[220px]">{row.original.subtitle}</span>
        )}
        {row.original.type === 'whatsapp' && (
          <Badge variant="outline" className="w-fit gap-1 border-green-600/30 bg-green-50 px-1.5 py-0 text-[10px] font-medium text-green-700 dark:bg-green-950 dark:text-green-400">
            <MessageCircle className="size-3" />Botón flotante de todo el sitio
          </Badge>
        )}
        <span className="text-[10px] text-muted-foreground/70">Sección #{row.original.idSection}</span>
      </div>
    ),
    enableSorting: true,
    enableHiding: true,
    meta: { label: 'Item' },
  },

  {
    id: 'value',
    header: () => <span className="text-xs">Valor</span>,
    cell: ({ row }) => (
      <span className="text-sm">
        {row.original.value != null ? `${row.original.value}${row.original.suffix ?? ''}` : '—'}
      </span>
    ),
    enableSorting: false,
    enableHiding: true,
    meta: { className: 'w-[110px]', label: 'Valor' },
  },

  {
    accessorKey: 'order',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Orden" />,
    cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.order ?? '—'}</span>,
    enableSorting: true,
    enableHiding: true,
    meta: { className: 'w-[80px]', label: 'Orden' },
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
    cell: ({ row }) => <SectionItemsRowActions row={row} hideDelete={hideDelete} />,
    meta: { className: 'w-[48px]', label: 'Acciones' },
  },
]

export const getSectionItemsColumns = (opts: SectionItemsColumnsOptions = {}): ColumnDef<SectionItem>[] =>
  buildSectionItemsColumns(opts).filter((c) => !(opts.hideOrder && c.id === 'order'))
