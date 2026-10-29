import Link from 'next/link'
import { type ColumnDef } from '@tanstack/react-table'
import { ImageOff, Images, SplitSquareHorizontal } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'
import { Checkbox } from '@/shared/ui/checkbox'
import { DataTableColumnHeader } from '@/shared/ui/data-table/column-header'
import { getTypeWorkBadge, getWebWorkStateOption, RESTORATION_KEY } from '../../data/data'
import type { WebWork } from '../../data/schema'
import { WebWorksRowActions } from './web-works-row-actions'

export const webWorksColumns: ColumnDef<WebWork>[] = [
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
    id: 'cover',
    header: () => <span className="text-xs">Portada</span>,
    cell: ({ row }) => (
      <div className="flex size-12 items-center justify-center overflow-hidden rounded-md border bg-muted">
        {row.original.coverUrl
          ? <img src={row.original.coverUrl} alt={row.original.title} className="h-full w-full object-cover" />
          : <ImageOff className="size-4 text-muted-foreground" />}
      </div>
    ),
    enableSorting: false,
    enableHiding: true,
    meta: { className: 'w-[72px]', label: 'Portada' },
  },

  {
    id: 'info',
    accessorFn: (row) => `${row.title} ${row.description ?? ''}`,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Trabajo" />,
    cell: ({ row }) => (
      <div className="flex min-w-[200px] max-w-[360px] flex-col gap-0.5 py-1.5">
        <Link href={`/web-works/${row.original.id}`} className="text-sm font-medium leading-tight text-primary hover:underline">{row.original.title}</Link>
        {row.original.description && (
          <span className="line-clamp-1 text-xs text-muted-foreground">{row.original.description}</span>
        )}
      </div>
    ),
    enableSorting: true,
    enableHiding: true,
    meta: { label: 'Trabajo' },
  },

  {
    id: 'type',
    accessorFn: (row) => row.typeworkName,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Tipo" />,
    cell: ({ row }) => (
      <Badge variant="outline" className={cn('text-xs', getTypeWorkBadge(row.original.typeworkKey))}>
        {row.original.typeworkName}
      </Badge>
    ),
    enableSorting: true,
    enableHiding: true,
    meta: { className: 'w-[130px]', label: 'Tipo' },
  },

  {
    id: 'category',
    accessorFn: (row) => row.categoryName ?? '',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Categoría" />,
    cell: ({ row }) => (
      <div className="flex flex-col gap-0.5 text-xs">
        <span>{row.original.categoryName ?? '—'}</span>
        {row.original.woodName && <span className="text-muted-foreground">{row.original.woodName}</span>}
      </div>
    ),
    enableSorting: true,
    enableHiding: true,
    meta: { className: 'w-[140px]', label: 'Categoría' },
  },

  {
    id: 'furniture',
    accessorFn: (row) => row.furnitureName ?? '',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Mueble" />,
    cell: ({ row }) => row.original.furnitureId
      ? <Link href={`/furnitures/edit/${row.original.furnitureId}`} className="text-xs text-primary hover:underline">{row.original.furnitureName ?? `#${row.original.furnitureId}`}</Link>
      : <span className="text-xs text-muted-foreground">—</span>,
    enableSorting: true,
    enableHiding: true,
    meta: { className: 'w-[150px]', label: 'Mueble' },
  },

  {
    id: 'media',
    header: () => <span className="text-xs">Fotos</span>,
    cell: ({ row }) => (
      <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
        <span className="flex items-center gap-1" title="Fotos de galería"><Images className="size-3.5" />{row.original.imagesCount}</span>
        {row.original.typeworkKey === RESTORATION_KEY && (
          <span className="flex items-center gap-1" title="Pares Antes/Después"><SplitSquareHorizontal className="size-3.5" />{row.original.pairsCount} par(es)</span>
        )}
      </div>
    ),
    enableSorting: false,
    enableHiding: true,
    meta: { className: 'w-[100px]', label: 'Fotos' },
  },

  {
    accessorKey: 'status',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Estado" />,
    cell: ({ row }) => {
      const opt = getWebWorkStateOption(row.original.stateValue)
      return <Badge variant="outline" className={cn('text-xs', opt.badge)}>{opt.label}</Badge>
    },
    enableSorting: true,
    enableHiding: true,
    meta: { className: 'w-[100px]', label: 'Estado' },
  },

  {
    id: 'actions',
    cell: WebWorksRowActions,
    meta: { className: 'w-[48px]', label: 'Acciones' },
  },
]
