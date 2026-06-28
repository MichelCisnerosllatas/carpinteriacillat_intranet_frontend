import { type ColumnDef } from '@tanstack/react-table'
import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'
import { Checkbox } from '@/shared/ui/checkbox'
import { DataTableColumnHeader } from '@/shared/ui/data-table/column-header'
import { getStateOption } from '@/shared/config/entity-states'
import type { SectionImage } from '../../data/schema'
import { SectionImagesRowActions } from './sectionimages-row-actions'

export const sectionImagesColumns: ColumnDef<SectionImage>[] = [
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
    id: 'thumbnail',
    header: () => <span className="text-xs">Imagen</span>,
    cell: ({ row }) => (
      <div className="flex size-14 items-center justify-center overflow-hidden rounded-md border bg-muted">
        {row.original.imageUrl ? (
          <img src={row.original.imageUrl} alt={row.original.imageName} className="size-full object-cover" />
        ) : (
          <span className="text-[10px] text-muted-foreground">Sin imagen</span>
        )}
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
    meta: { className: 'w-[80px]' },
  },

  {
    id: 'image-info',
    accessorFn: (row) => row.imageName,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Imagen" />,
    cell: ({ row }) => (
      <div className="flex min-w-[160px] flex-col gap-0.5 py-1.5">
        <span className="text-sm font-medium leading-none text-foreground">{row.original.imageName}</span>
        <span className="text-xs text-muted-foreground truncate max-w-[200px]">{row.original.imageUrl}</span>
      </div>
    ),
    enableSorting: true,
    enableHiding: true,
  },

  {
    id: 'section',
    accessorFn: (row) => row.sectionName,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Sección" />,
    cell: ({ row }) => (
      <Badge variant="secondary" className="text-xs font-normal">
        {row.original.sectionName}
      </Badge>
    ),
    enableSorting: true,
    enableHiding: true,
    meta: { className: 'w-[150px]' },
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
          <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground/60">Registro</span>
          <span className="text-muted-foreground">{row.original.createdAt}</span>
        </div>
        {row.original.updatedAt && (
          <div className="mt-0.5 flex flex-col">
            <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground/60">Actualización</span>
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
    cell: SectionImagesRowActions,
    meta: { className: 'w-[48px]' },
  },
]
