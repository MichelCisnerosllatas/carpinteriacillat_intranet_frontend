import { type ColumnDef } from '@tanstack/react-table'
import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar'
import { DataTableColumnHeader } from '@/shared/ui/data-table/column-header'
import { getInitials } from '@/shared/lib/get-initials'
import { getGoogleAccessRequestStatusOption } from '../../data/data'
import type { GoogleAccessRequest } from '../../data/schema'
import { GoogleAccessRequestRowActions } from './google-access-requests-row-actions'

export const googleAccessRequestsColumns: ColumnDef<GoogleAccessRequest>[] = [
  {
    id: 'person',
    accessorFn: (row) => `${row.name ?? ''} ${row.email}`,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Cuenta de Google" />,
    cell: ({ row }) => {
      const name = row.original.name?.trim() || row.original.email
      return (
        <div className="flex min-w-[220px] items-center gap-3 py-1">
          <Avatar className="size-9 shrink-0">
            <AvatarImage src={row.original.photoUrl ?? undefined} alt={name} />
            <AvatarFallback className="text-xs">{getInitials(name)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium leading-none">{row.original.name || 'Sin nombre'}</span>
            <span className="text-xs text-muted-foreground">{row.original.email}</span>
          </div>
        </div>
      )
    },
    enableSorting: true,
    enableHiding: true,
    meta: { label: 'Cuenta de Google' },
  },

  {
    accessorKey: 'status',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Estado" />,
    cell: ({ row }) => {
      const opt = getGoogleAccessRequestStatusOption(row.original.status)
      return <Badge variant="outline" className={cn('text-xs', opt.badge)}>{opt.label}</Badge>
    },
    enableSorting: true,
    enableHiding: true,
    meta: { className: 'w-[120px]', label: 'Estado' },
  },

  {
    id: 'attempts',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Intentos" />,
    cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.attempts}</span>,
    enableSorting: false,
    enableHiding: true,
    meta: { className: 'w-[90px]', label: 'Intentos' },
  },

  {
    id: 'lastAttempt',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Último intento" />,
    cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.original.lastAttemptAtFormatted ?? '—'}</span>,
    enableSorting: true,
    enableHiding: true,
    meta: { className: 'w-[170px]', label: 'Último intento' },
  },

  {
    id: 'reviewed',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Revisado" />,
    cell: ({ row }) => (
      <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
        <span>{row.original.reviewedAtFormatted ?? '—'}</span>
        {row.original.reviewerEmail && <span className="text-[10px]">por {row.original.reviewerEmail}</span>}
      </div>
    ),
    enableSorting: false,
    enableHiding: true,
    meta: { className: 'w-[170px]', label: 'Revisado' },
  },

  {
    id: 'actions',
    cell: GoogleAccessRequestRowActions,
    meta: { className: 'w-[48px]', label: 'Acciones' },
  },
]
