import { type ColumnDef } from '@tanstack/react-table'
import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'
import { Checkbox } from '@/shared/ui/checkbox'
import { LongText } from '@/shared/ui/long-text'
import { DataTableColumnHeader } from '@/shared/ui/data-table/column-header'
import { callTypes, roles } from '../data/data'
import type { User } from '../data/schema'
import { UsersRowActions } from './users-row-actions'
import { UserRound } from 'lucide-react'

export const usersColumns: ColumnDef<User>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
        onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
        aria-label="Select all"
        className="translate-y-0.5"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(v) => row.toggleSelected(!!v)}
        aria-label="Select row"
        className="translate-y-0.5"
      />
    ),
    enableSorting: false,
    enableHiding: false,
    meta: {
      className: cn(
        'inset-s-0 z-20 w-[48px] bg-background max-md:sticky'
      ),
    },
  },

  {
    id: 'photo',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Foto" />,
    cell: ({ row }) => {
      const photoUrl = row.original.photoUrl

      return (
        <div className="flex items-center justify-center">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={row.original.username}
              className="size-9 rounded-full object-cover"
            />
          ) : (
            <div className="flex size-9 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <UserRound size={18} />
            </div>
          )}
        </div>
      )
    },
    enableSorting: false,
    enableHiding: true,
    meta: { className: 'w-[60px] min-w-[60px]' },
  },

  {
    id: 'data',
    accessorFn: (row) => `${row.firstName} ${row.lastName} ${row.email} ${row.typeDocName} ${row.documentNumber}`,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Datos" />,
    cell: ({ row }) => {
      const user = row.original
      const fullName = `${user.firstName} ${user.lastName}`.trim() || '-'

      return (
        <div className="flex min-w-[360px] max-w-[520px] flex-col gap-1 py-2 text-xs leading-5">
          <LongText className="max-w-[480px] font-semibold text-foreground">
            {fullName}
          </LongText>

          <div className="text-muted-foreground">
            Correo:{' '}
            <span className="font-medium text-foreground">
            {user.email}
          </span>
          </div>

          <div className="text-muted-foreground">
            Documento:{' '}
            <span className="font-medium text-foreground">
              {user.typeDocName} - {user.documentNumber}
            </span>
          </div>
        </div>
      )
    },
    enableSorting: true,
    enableHiding: true,
    meta: {
      className: 'min-w-[360px]',
    },
  },

  {
    accessorKey: 'status',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Estado" />,
    cell: ({ row }) => {
      const status = row.original.status
      const badgeColor = callTypes.get(status)

      return (
        <Badge variant="outline" className={cn('capitalize', badgeColor)}>
          {row.original.statusLabel}
        </Badge>
      )
    },
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
    enableSorting: true,
    enableHiding: true,
  },

  {
    accessorKey: 'role',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Rol" />,
    cell: ({ row }) => {
      const userType = roles.find(({ value }) => value === row.original.role)

      return (
        <div className="flex items-center gap-x-2">
          {userType?.icon && <userType.icon size={16} className="text-muted-foreground" />}
          <span className="text-sm capitalize">{row.original.roleLabel}</span>
        </div>
      )
    },
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
    enableSorting: true,
    enableHiding: true,
  },

  {
    id: 'dates',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Fechas" />,
    cell: ({ row }) => {
      const user = row.original

      return (
        <div className="flex w-[160px] flex-col gap-1 text-xs leading-5">
          <div className="flex flex-col">
            <span className="text-muted-foreground">Creado</span>
            <span className="font-medium text-foreground">{user.createdAt}</span>
          </div>

          <div className="flex flex-col">
            <span className="text-muted-foreground">Modificado</span>
            <span className="font-medium text-foreground">{user.updatedAt}</span>
          </div>
        </div>
      )
    },
    enableSorting: true,
    enableHiding: true,
    meta: { className: 'w-[170px] min-w-[170px]' },
  },

  {
    id: 'actions',
    cell: UsersRowActions,
  },
]
