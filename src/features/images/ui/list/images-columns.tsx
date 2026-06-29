import { type ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/shared/ui/badge'
import { DataTableColumnHeader } from '@/shared/ui/data-table/column-header'
import { formatBytes } from '../../lib/image-url'
import type { ImageItem } from '../../data/schema'
import { ImagesRowActions } from './images-row-actions'

export const imagesColumns: ColumnDef<ImageItem>[] = [
  {
    id: 'thumbnail',
    header: 'Vista previa',
    cell: ({ row }) => {
      const displayName = row.original.name ?? row.original.patch.split('/').pop() ?? row.original.patch
      return (
        <div className="flex size-14 items-center justify-center overflow-hidden rounded-md border bg-muted">
          <img
            src={row.original.url}
            alt={displayName}
            className="h-full w-full object-cover"
            onError={(e) => {
              const el = e.target as HTMLImageElement
              el.style.display = 'none'
              el.parentElement!.innerHTML = '<span class="text-xs text-muted-foreground">Sin imagen</span>'
            }}
          />
        </div>
      )
    },
    enableSorting: false,
    enableHiding: false,
    meta: { className: 'w-[80px]' },
  },

  {
    id: 'info',
    accessorFn: (row) => row.name ?? row.patch,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Imagen" />,
    cell: ({ row }) => {
      const displayName = row.original.name ?? row.original.patch.split('/').pop() ?? row.original.patch
      return (
        <div className="flex min-w-[220px] flex-col gap-0.5 py-1.5">
          <span className="text-sm font-medium leading-none text-foreground">{displayName}</span>
          <span className="text-xs text-muted-foreground break-all">{row.original.patch}</span>
        </div>
      )
    },
    enableSorting: true,
    enableHiding: true,
  },

  {
    id: 'meta',
    header: 'Detalles',
    cell: ({ row }) => (
      <div className="flex flex-col gap-1">
        {row.original.type && (
          <Badge variant="secondary" className="w-fit text-[10px]">
            {row.original.type.split('/')[1] ?? row.original.type}
          </Badge>
        )}
        {row.original.size != null && (
          <span className="text-xs text-muted-foreground">{formatBytes(row.original.size)}</span>
        )}
        {row.original.width != null && row.original.height != null && (
          <span className="text-xs text-muted-foreground">{row.original.width}×{row.original.height}px</span>
        )}
      </div>
    ),
    enableSorting: false,
    enableHiding: true,
    meta: { className: 'w-[140px]' },
  },

  {
    id: 'dates',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Fechas" />,
    cell: ({ row }) => (
      <div className="flex flex-col gap-0.5 text-xs">
        <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground/60">Subida</span>
        <span className="text-muted-foreground">{row.original.createdAt ?? '—'}</span>
      </div>
    ),
    enableSorting: true,
    enableHiding: true,
    meta: { className: 'w-[140px]' },
  },

  {
    id: 'actions',
    cell: ImagesRowActions,
    meta: { className: 'w-[48px]' },
  },
]
