import Link from 'next/link'
import { type ColumnDef } from '@tanstack/react-table'
import { Star } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'
import { Checkbox } from '@/shared/ui/checkbox'
import { DataTableColumnHeader } from '@/shared/ui/data-table/column-header'
import { getStateOption } from '@/shared/config/entity-states'
import { formatTestimonyRating } from '../../data/data'
import type { Testimony } from '../../data/schema'
import { TestimonyRowActions } from './testimony-row-actions'

interface TestimonyColumnsOptions {
  hideDelete?: boolean
}

export const getTestimonyColumns = ({ hideDelete }: TestimonyColumnsOptions = {}): ColumnDef<Testimony>[] => [
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
    accessorFn: (row) => `${row.name} ${row.role ?? ''} ${row.city ?? ''}`,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Testimonio" />,
    cell: ({ row }) => (
      <div className="flex min-w-[200px] flex-col gap-0.5 py-1.5">
        <Link href={`/testimony/${row.original.id}`} className="text-sm font-medium leading-none text-primary hover:underline">
          {row.original.name}
        </Link>
        {(row.original.role || row.original.city) && (
          <span className="text-xs text-muted-foreground truncate max-w-[260px]">
            {[row.original.role, row.original.city].filter(Boolean).join(' · ')}
          </span>
        )}
      </div>
    ),
    enableSorting: true,
    enableHiding: true,
    meta: { label: 'Testimonio' },
  },

  {
    id: 'section',
    accessorFn: (row) => row.sectionName ?? row.idSection,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Sección" />,
    cell: ({ row }) => (
      <Badge variant="secondary" className="text-xs font-normal">
        {row.original.sectionName ?? `Sección #${row.original.idSection}`}
      </Badge>
    ),
    enableSorting: true,
    enableHiding: true,
    meta: { className: 'w-[140px]', label: 'Sección' },
  },

  {
    id: 'rating',
    accessorFn: (row) => row.rating ?? 0,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Valoración" />,
    cell: ({ row }) => (
      <Badge variant="outline" className="gap-1 font-mono text-xs">
        <Star className="size-3 fill-amber-400 text-amber-400" />
        {formatTestimonyRating(row.original.rating)}
      </Badge>
    ),
    enableSorting: true,
    enableHiding: true,
    meta: { className: 'w-[100px]', label: 'Valoración' },
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
    cell: ({ row }) => <TestimonyRowActions row={row} hideDelete={hideDelete} />,
    meta: { className: 'w-[48px]', label: 'Acciones' },
  },
]

/**
 * Igual que `getTestimonyColumns` pero sin la columna "Sección" — se usa cuando la tabla está
 * embebida dentro del tab de una sección concreta (`idSection` fijo), donde repetir el nombre de
 * la sección en cada fila no aporta nada.
 */
export const getTestimonyScopedColumns = (opts: TestimonyColumnsOptions = {}): ColumnDef<Testimony>[] =>
  getTestimonyColumns(opts).filter((c) => c.id !== 'section')
